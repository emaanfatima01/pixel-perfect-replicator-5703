DROP POLICY "profiles own or coordinator read" ON public.profiles;
CREATE POLICY "profiles own coordinator or project partner read" ON public.profiles FOR SELECT TO authenticated USING (
  auth.uid() = id
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR EXISTS (
    SELECT 1 FROM public.projects p
    WHERE (p.student_id = profiles.id OR p.supervisor_id = profiles.id)
      AND (p.student_id = auth.uid() OR p.supervisor_id = auth.uid())
  )
);