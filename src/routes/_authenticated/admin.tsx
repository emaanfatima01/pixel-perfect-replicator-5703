import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/auth";
import { useProjects, useAnnouncements } from "@/lib/queries";
import { fmtDate, type Role } from "@/lib/fyp";
import { StatCard } from "@/components/StatusBadge";
import { Panel, Empty } from "@/components/Panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Coordinator — FYPMS" }, { name: "description", content: "Coordinator tools: users, supervisors, presentations and announcements." }] }),
  component: AdminPage,
});

function AdminPage() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const { data: projects = [] } = useProjects(me);
  const { data: announcements = [] } = useAnnouncements();
  const { data: users = [] } = useQuery({
    enabled: me?.role === "admin",
    queryKey: ["admin-users"],
    queryFn: async () => {
      const [{ data: profiles }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at"),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      return (profiles ?? []).map((p) => ({ ...p, role: (roles ?? []).find((r) => r.user_id === p.id)?.role ?? ("student" as Role) }));
    },
  });
  const [ann, setAnn] = useState({ title: "", body: "" });
  const [q, setQ] = useState("");

  if (me && me.role !== "admin") return <Empty text="Coordinators only." />;

  async function setRole(userId: string, role: Role) {
    if (userId === me!.id) return void toast.error("You can't change your own role");
    const del = await supabase.from("user_roles").delete().eq("user_id", userId);
    if (del.error) return void toast.error(del.error.message);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) return void toast.error(error.message);
    toast.success("Role updated");
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  }

  async function assign(projectId: string, supervisorId: string) {
    const { error } = await supabase.from("projects").update({ supervisor_id: supervisorId }).eq("id", projectId);
    if (error) return void toast.error(error.message);
    toast.success("Supervisor assigned");
    qc.invalidateQueries({ queryKey: ["projects"] });
  }

  async function postAnn() {
    if (!ann.title.trim()) return void toast.error("Title is required");
    const { error } = await supabase.from("announcements").insert({ title: ann.title.trim(), body: ann.body.trim(), author_id: me!.id });
    if (error) return void toast.error(error.message);
    setAnn({ title: "", body: "" });
    qc.invalidateQueries({ queryKey: ["announcements"] });
  }

  async function delAnn(id: string) {
    await supabase.from("announcements").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["announcements"] });
  }

  const supervisors = users.filter((u) => u.role === "supervisor");
  const filtered = users.filter((u) => `${u.full_name} ${u.email}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-semibold">Coordinator dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Students" value={users.filter((u) => u.role === "student").length} />
        <StatCard label="Supervisors" value={supervisors.length} />
        <StatCard label="Projects" value={projects.length} />
        <StatCard label="Approved" value={projects.filter((p) => p.status === "approved").length} />
      </div>

      <Panel title="Users">
        <Input className="mb-4" placeholder="Search users" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="py-2">Name</th><th>Email</th><th>Department</th><th>Joined</th><th className="w-40">Role</th></tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td className="py-2 font-medium">{u.full_name}</td>
                  <td className="text-muted-foreground">{u.email}</td>
                  <td>{u.department ?? "—"}</td>
                  <td>{fmtDate(u.created_at)}</td>
                  <td>
                    <Select value={u.role} onValueChange={(v) => setRole(u.id, v as Role)} disabled={u.id === me?.id}>
                      <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="admin">Coordinator</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Supervisor assignment">
        {projects.length === 0 ? <Empty text="No projects yet." /> : (
          <ul className="divide-y">
            {projects.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div><p className="font-medium">{p.title}</p><p className="text-xs text-muted-foreground">{p.student?.full_name}</p></div>
                <Select value={p.supervisor_id ?? ""} onValueChange={(v) => assign(p.id, v)}>
                  <SelectTrigger className="w-56"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>{supervisors.map((s) => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}</SelectContent>
                </Select>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Final presentations & completion">
        {projects.filter((p) => p.status === "approved").length === 0 ? <Empty text="No approved projects yet." /> : (
          <ul className="divide-y">
            {projects.filter((p) => p.status === "approved").map((p) => (
              <PresentationRow key={p.id} p={p} onSaved={() => qc.invalidateQueries({ queryKey: ["projects"] })} />
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Announcements">
        <div className="space-y-3">
          <Input placeholder="Title" value={ann.title} onChange={(e) => setAnn({ ...ann, title: e.target.value })} />
          <Textarea rows={2} placeholder="Message" value={ann.body} onChange={(e) => setAnn({ ...ann, body: e.target.value })} />
          <div className="flex justify-end"><Button onClick={postAnn}>Publish announcement</Button></div>
        </div>
        <ul className="mt-6 divide-y">
          {announcements.map((a) => (
            <li key={a.id} className="flex items-start justify-between gap-3 py-3">
              <div><p className="font-semibold">{a.title}</p><p className="text-sm text-muted-foreground">{a.body}</p></div>
              <Button size="icon" variant="ghost" onClick={() => delAnn(a.id)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

type PresentationProject = { id: string; title: string; student?: { full_name?: string | null } | null; presentation_at?: string | null; presentation_venue?: string | null; completed_at?: string | null };

function toLocalInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
}

function PresentationRow({ p, onSaved }: { p: PresentationProject; onSaved: () => void }) {
  const [when, setWhen] = useState(toLocalInput(p.presentation_at));
  const [venue, setVenue] = useState(p.presentation_venue ?? "");
  const [busy, setBusy] = useState(false);
  const save = async (completed?: boolean) => {
    setBusy(true);
    const patch: { presentation_at: string | null; presentation_venue: string | null; completed_at?: string | null } = {
      presentation_at: when ? new Date(when).toISOString() : null,
      presentation_venue: venue.trim() || null,
    };
    if (completed !== undefined) patch.completed_at = completed ? new Date().toISOString() : null;
    const { error } = await supabase.from("projects").update(patch).eq("id", p.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    onSaved();
  };
  return (
    <li className="flex flex-wrap items-end justify-between gap-3 py-3">
      <div className="min-w-48">
        <p className="font-medium">{p.title}</p>
        <p className="text-xs text-muted-foreground">
          {p.student?.full_name}
          {p.completed_at ? ` · Completed ${fmtDate(p.completed_at)}` : ""}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Input type="datetime-local" className="w-52" value={when} onChange={(e) => setWhen(e.target.value)} />
        <Input placeholder="Venue" className="w-40" value={venue} onChange={(e) => setVenue(e.target.value)} />
        <Button size="sm" disabled={busy} onClick={() => save()}>Save</Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => save(!p.completed_at)}>
          {p.completed_at ? "Mark not completed" : "Mark completed"}
        </Button>
      </div>
    </li>
  );
}
