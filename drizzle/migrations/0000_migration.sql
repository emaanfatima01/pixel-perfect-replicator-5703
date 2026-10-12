create type public.app_role as enum ('admin','supervisor','student');
create type public.proposal_status as enum ('draft','submitted','under_review','approved','revision_required','rejected');
create type public.milestone_status as enum ('pending','in_progress','completed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  department text,
  reg_number text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select, insert, update, delete on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "profiles readable by signed in" on public.profiles for select to authenticated using (true);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "admin profile update" on public.profiles for update to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "admin manage roles ins" on public.user_roles for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin manage roles upd" on public.user_roles for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin manage roles del" on public.user_roles for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create or replace function public.list_supervisors()
returns table(id uuid, full_name text, department text) language sql stable security definer set search_path = public as $$
  select p.id, p.full_name, p.department from public.profiles p
  join public.user_roles r on r.user_id = p.id and r.role = 'supervisor' order by p.full_name
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  requested text := coalesce(new.raw_user_meta_data->>'role','student');
  chosen app_role;
begin
  insert into public.profiles(id, full_name, email, department, reg_number)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), new.email,
          new.raw_user_meta_data->>'department', new.raw_user_meta_data->>'reg_number');
  if not exists (select 1 from public.user_roles where role = 'admin') then
    chosen := 'admin';
  elsif requested = 'supervisor' then
    chosen := 'supervisor';
  else
    chosen := 'student';
  end if;
  insert into public.user_roles(user_id, role) values (new.id, chosen);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  supervisor_id uuid references public.profiles(id) on delete set null,
  title text not null,
  problem_statement text not null default '',
  objectives text not null default '',
  proposed_solution text not null default '',
  scope text not null default '',
  technologies text not null default '',
  expected_outcomes text not null default '',
  category text not null default 'Web Application',
  status proposal_status not null default 'draft',
  document_path text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.projects to authenticated;
grant all on public.projects to service_role;
alter table public.projects enable row level security;

create or replace function public.can_access_project(_project_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.projects p where p.id = _project_id
    and (p.student_id = auth.uid() or p.supervisor_id = auth.uid() or public.has_role(auth.uid(),'admin')))
$$;

create policy "projects read" on public.projects for select to authenticated
  using (student_id = auth.uid() or supervisor_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "student create" on public.projects for insert to authenticated
  with check (student_id = auth.uid() and public.has_role(auth.uid(),'student') and status in ('draft','submitted'));
create policy "student update own" on public.projects for update to authenticated
  using (student_id = auth.uid() and status in ('draft','submitted','revision_required','approved')) with check (student_id = auth.uid() and status in ('draft','submitted','approved'));
create policy "supervisor update" on public.projects for update to authenticated
  using (supervisor_id = auth.uid()) with check (supervisor_id = auth.uid());
create policy "admin all" on public.projects for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "student delete draft" on public.projects for delete to authenticated using (student_id = auth.uid() and status = 'draft');

-- students may not self-approve: block status change to approved by student unless already approved
create or replace function public.guard_project_status() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() = new.student_id and not public.has_role(auth.uid(),'admin') and new.status <> old.status then
    if new.status not in ('draft','submitted') then
      raise exception 'Students can only save drafts or submit proposals';
    end if;
  end if;
  if auth.uid() = new.student_id and old.status = 'approved' and new.status <> 'approved' then
    raise exception 'Approved proposals cannot be changed';
  end if;
  new.updated_at = now();
  return new;
end $$;
create trigger t_projects before update on public.projects for each row execute function public.guard_project_status();

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text not null default '',
  start_date date,
  due_date date,
  status milestone_status not null default 'pending',
  progress int not null default 0 check (progress between 0 and 100),
  deliverable_path text,
  supervisor_comment text,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.milestones to authenticated;
grant all on public.milestones to service_role;
alter table public.milestones enable row level security;
create policy "milestones access" on public.milestones for all to authenticated
  using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  milestone_id uuid references public.milestones(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null default 'comment',
  body text not null,
  created_at timestamptz not null default now()
);
grant select, insert on public.feedback to authenticated;
grant all on public.feedback to service_role;
alter table public.feedback enable row level security;
create policy "feedback read" on public.feedback for select to authenticated using (public.can_access_project(project_id));
create policy "feedback write" on public.feedback for insert to authenticated
  with check (author_id = auth.uid() and public.can_access_project(project_id));

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
grant select, insert, delete on public.announcements to authenticated;
grant all on public.announcements to service_role;
alter table public.announcements enable row level security;
create policy "ann read" on public.announcements for select to authenticated using (true);
create policy "ann write" on public.announcements for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "ann delete" on public.announcements for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;
create trigger t_milestones before update on public.milestones for each row execute function public.touch_updated_at();

create policy "docs read" on storage.objects for select to authenticated
  using (bucket_id = 'documents' and public.can_access_project(((storage.foldername(name))[1])::uuid));
create policy "docs upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'documents' and public.can_access_project(((storage.foldername(name))[1])::uuid));
create policy "docs update" on storage.objects for update to authenticated
  using (bucket_id = 'documents' and public.can_access_project(((storage.foldername(name))[1])::uuid));