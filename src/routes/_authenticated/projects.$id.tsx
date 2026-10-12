import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Paperclip, Plus, Pencil, Send, ListPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/auth";
import { openDocument } from "@/lib/queries";
import {
  overallProgress, milestoneStats, milestoneView, milestoneProgress, fmtDate, DEFAULT_MILESTONES,
  type Milestone, type MilestoneView, type ProposalStatus,
} from "@/lib/fyp";
import { StatusBadge, MilestoneBadge, StatCard } from "@/components/StatusBadge";
import { Panel, Empty } from "@/components/Panel";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/projects/$id")({
  head: () => ({ meta: [{ title: "Project — FYPMS" }, { name: "description", content: "Project proposal, milestones and feedback." }] }),
  component: ProjectPage,
});

function useProject(id: string) {
  return useQuery({
    queryKey: ["project-full", id],
    queryFn: async () => {
      const [p, m, f] = await Promise.all([
        supabase.from("projects").select("*, student:profiles!projects_student_id_fkey(full_name, email, reg_number), supervisor:profiles!projects_supervisor_id_fkey(full_name)").eq("id", id).maybeSingle(),
        supabase.from("milestones").select("*").eq("project_id", id).order("position"),
        supabase.from("feedback").select("*, author:profiles!feedback_author_id_fkey(full_name)").eq("project_id", id).order("created_at", { ascending: false }),
      ]);
      if (p.error) throw p.error;
      return { project: p.data, milestones: m.data ?? [], feedback: f.data ?? [] };
    },
  });
}

function ProjectPage() {
  const { id } = Route.useParams();
  const { data: me } = useMe();
  const { data, isLoading } = useProject(id);
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Milestone> | null>(null);
  const refresh = () => qc.invalidateQueries();

  if (isLoading || !me) return <Empty text="Loading…" />;
  if (!data?.project) return <Empty text="Project not found or you don't have access." />;
  const { project: p, milestones, feedback } = data;
  const isStudent = me.id === p.student_id;
  const isReviewer = me.id === p.supervisor_id || me.role === "admin";
  const pct = overallProgress(milestones);
  const stats = milestoneStats(milestones);

  async function addFeedback(body: string, kind = "comment", milestone_id: string | null = null) {
    const { error } = await supabase.from("feedback").insert({ project_id: p.id, author_id: me!.id, body, kind, milestone_id });
    if (error) throw error;
  }

  async function review(status: ProposalStatus, note: string) {
    try {
      const { error } = await supabase.from("projects").update({ status, reviewed_at: new Date().toISOString() }).eq("id", p.id);
      if (error) throw error;
      const labels: Record<string, string> = { under_review: "Marked as under review", approved: "Proposal approved", revision_required: "Revision requested", rejected: "Proposal rejected" };
      await addFeedback(note ? `${labels[status]}: ${note}` : labels[status], status === "revision_required" ? "revision" : "status");
      toast.success(labels[status]);
      refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function addDefaults() {
    const rows = DEFAULT_MILESTONES.map((title, i) => ({ project_id: p.id, title, position: i }));
    const { error } = await supabase.from("milestones").insert(rows);
    if (error) return void toast.error(error.message);
    toast.success("Standard milestones added");
    refresh();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link to="/projects" className="text-sm text-muted-foreground hover:underline">← Projects</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <StatusBadge status={p.status} />
          <span className="text-sm text-muted-foreground">{p.category}</span>
        </div>
        <h1 className="mt-2 text-4xl font-semibold">{p.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {p.student?.full_name}{p.student?.reg_number ? ` (${p.student.reg_number})` : ""} · Supervisor: {p.supervisor?.full_name ?? "—"}
          {p.reviewed_at && <> · Last reviewed {fmtDate(p.reviewed_at)}</>}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <div className="col-span-2 rounded-xl border bg-card p-5 shadow-soft md:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Overall</p>
          <p className="mt-2 font-display text-3xl font-semibold">{pct}%</p>
          <Progress value={pct} className="mt-2 h-2" />
        </div>
        <StatCard label="Milestones" value={stats.total} />
        <StatCard label="Completed" value={stats.completed} />
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="Overdue" value={stats.overdue} />
      </div>

      <Tabs defaultValue={p.status === "approved" ? "milestones" : "proposal"}>
        <TabsList>
          <TabsTrigger value="proposal">Proposal</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="feedback">Feedback ({feedback.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="proposal" className="mt-6 space-y-6">
          {isStudent && ["draft", "submitted", "revision_required"].includes(p.status) && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-warning/15 p-4 text-sm">
              <span>{p.status === "revision_required" ? "Your supervisor requested changes. Revise and resubmit." : p.status === "draft" ? "This proposal is a draft and hasn't been submitted." : "Waiting for your supervisor's review. You can still edit it."}</span>
              <Button asChild size="sm"><Link to="/proposals/new" search={{ id: p.id }}><Pencil className="mr-1 h-3.5 w-3.5" /> Edit proposal</Link></Button>
            </div>
          )}
          {isReviewer && <ReviewBox status={p.status} onReview={review} />}
          <div className="grid gap-4 md:grid-cols-2">
            {([
              ["Problem statement", p.problem_statement], ["Objectives", p.objectives], ["Proposed solution", p.proposed_solution],
              ["Scope", p.scope], ["Technologies & tools", p.technologies], ["Expected outcomes", p.expected_outcomes],
            ] as const).map(([k, v]) => (
              <div key={k} className="rounded-xl border bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{k}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm">{v || "—"}</p>
              </div>
            ))}
          </div>
          {p.document_path && (
            <Button variant="outline" onClick={() => openDocument(p.document_path!).catch((e) => toast.error(e.message))}>
              <Paperclip className="mr-1 h-4 w-4" /> Open proposal document
            </Button>
          )}
        </TabsContent>

        <TabsContent value="milestones" className="mt-6 space-y-4">
          <div className="flex flex-wrap justify-end gap-2">
            {milestones.length === 0 && (isStudent || isReviewer) && (
              <Button variant="outline" onClick={addDefaults}><ListPlus className="mr-1 h-4 w-4" /> Add standard milestones</Button>
            )}
            {(isStudent || isReviewer) && <Button onClick={() => setEditing({ status: "pending", progress: 0 })}><Plus className="mr-1 h-4 w-4" /> Milestone</Button>}
          </div>
          <Board milestones={milestones} onOpen={(m) => setEditing(m)} />
        </TabsContent>

        <TabsContent value="feedback" className="mt-6">
          <FeedbackThread feedback={feedback} milestones={milestones} onPost={async (b) => { await addFeedback(b, isStudent ? "reply" : "comment"); refresh(); }} />
        </TabsContent>
      </Tabs>

      {editing && (
        <MilestoneDialog
          projectId={p.id}
          milestone={editing}
          count={milestones.length}
          isReviewer={isReviewer}
          onClose={() => setEditing(null)}
          onSaved={async (msg) => { if (msg) await addFeedback(msg, "milestone", editing.id ?? null).catch(() => {}); setEditing(null); refresh(); }}
        />
      )}
    </div>
  );
}

function ReviewBox({ status, onReview }: { status: ProposalStatus; onReview: (s: ProposalStatus, note: string) => void }) {
  const [note, setNote] = useState("");
  const go = (s: ProposalStatus) => { if ((s === "revision_required" || s === "rejected") && !note.trim()) return void toast.error("Add a note explaining your decision"); onReview(s, note.trim()); setNote(""); };
  return (
    <Panel title="Review proposal">
      <Textarea rows={3} placeholder="Feedback or suggestions for the student…" value={note} onChange={(e) => setNote(e.target.value)} />
      <div className="mt-3 flex flex-wrap gap-2">
        {status === "submitted" && <Button variant="outline" onClick={() => go("under_review")}>Mark under review</Button>}
        <Button className="bg-success text-success-foreground hover:bg-success/90" onClick={() => go("approved")}>Approve</Button>
        <Button className="bg-warning text-warning-foreground hover:bg-warning/90" onClick={() => go("revision_required")}>Request revision</Button>
        <Button variant="destructive" onClick={() => go("rejected")}>Reject</Button>
      </div>
    </Panel>
  );
}

const COLUMNS: { key: MilestoneView; title: string }[] = [
  { key: "pending", title: "Pending" },
  { key: "in_progress", title: "In progress" },
  { key: "overdue", title: "Overdue" },
  { key: "completed", title: "Completed" },
];

function Board({ milestones, onOpen }: { milestones: Milestone[]; onOpen: (m: Milestone) => void }) {
  if (!milestones.length) return <Empty text="No milestones yet." />;
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {COLUMNS.map((c) => {
        const items = milestones.filter((m) => milestoneView(m) === c.key);
        return (
          <div key={c.key} className="rounded-2xl bg-muted/60 p-3">
            <p className="mb-3 flex items-center justify-between px-1 text-sm font-semibold">{c.title}<span className="text-muted-foreground">{items.length}</span></p>
            <div className="space-y-3">
              {items.map((m) => (
                <button key={m.id} onClick={() => onOpen(m)} className="w-full rounded-xl border bg-card p-4 text-left shadow-soft transition hover:border-primary">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold">{m.title}</p>
                    <MilestoneBadge view={milestoneView(m)} />
                  </div>
                  {m.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{m.description}</p>}
                  <Progress value={milestoneProgress(m)} className="mt-3 h-1.5" />
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>Due {fmtDate(m.due_date)}</span>
                    <span>{milestoneProgress(m)}%</span>
                  </div>
                  {(m.deliverable_path || m.supervisor_comment) && (
                    <div className="mt-2 flex gap-3 text-xs text-primary">
                      {m.deliverable_path && <span className="flex items-center gap-1"><Paperclip className="h-3 w-3" /> Deliverable</span>}
                      {m.supervisor_comment && <span>Comment</span>}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MilestoneDialog({ projectId, milestone, count, isReviewer, onClose, onSaved }: {
  projectId: string; milestone: Partial<Milestone>; count: number; isReviewer: boolean; onClose: () => void; onSaved: (msg?: string) => void;
}) {
  const [m, setM] = useState<Partial<Milestone>>(milestone);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Milestone>(k: K, v: Milestone[K]) => setM((s) => ({ ...s, [k]: v }));

  async function save() {
    if (!m.title?.trim()) return void toast.error("Title is required");
    if (m.start_date && m.due_date && m.due_date < m.start_date) return void toast.error("Due date must be after start date");
    setBusy(true);
    try {
      let deliverable_path = m.deliverable_path ?? null;
      if (file) {
        if (file.size > 20 * 1024 * 1024) throw new Error("File must be under 20 MB");
        deliverable_path = `${projectId}/deliverable-${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
        const { error } = await supabase.storage.from("documents").upload(deliverable_path, file);
        if (error) throw error;
      }
      const status = m.status ?? "pending";
      const row = {
        title: m.title.trim(), description: m.description ?? "", start_date: m.start_date || null, due_date: m.due_date || null,
        status, progress: status === "completed" ? 100 : m.progress ?? 0, deliverable_path, supervisor_comment: m.supervisor_comment ?? null,
      };
      const { error } = m.id
        ? await supabase.from("milestones").update(row).eq("id", m.id)
        : await supabase.from("milestones").insert({ ...row, project_id: projectId, position: count });
      if (error) throw error;
      toast.success("Milestone saved");
      const msgs: string[] = [];
      if (file) msgs.push(`Deliverable uploaded for "${row.title}".`);
      if (m.id && milestone.status !== status) msgs.push(`"${row.title}" moved to ${status.replace("_", " ")}.`);
      if (isReviewer && row.supervisor_comment && row.supervisor_comment !== milestone.supervisor_comment) msgs.push(`On "${row.title}": ${row.supervisor_comment}`);
      onSaved(msgs.join(" ") || undefined);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{m.id ? "Update milestone" : "New milestone"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label>Title</Label><Input value={m.title ?? ""} onChange={(e) => set("title", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Description</Label><Textarea rows={3} value={m.description ?? ""} onChange={(e) => set("description", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Start date</Label><Input type="date" value={m.start_date ?? ""} onChange={(e) => set("start_date", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Due date</Label><Input type="date" value={m.due_date ?? ""} onChange={(e) => set("due_date", e.target.value)} /></div>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={m.status ?? "pending"} onValueChange={(v) => set("status", v as Milestone["status"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Progress: {m.status === "completed" ? 100 : m.progress ?? 0}%</Label>
            <Slider disabled={m.status === "completed"} value={[m.status === "completed" ? 100 : m.progress ?? 0]} max={100} step={5} onValueChange={([v]) => set("progress", v ?? 0)} />
          </div>
          <div className="space-y-1.5">
            <Label>Deliverable</Label>
            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            {m.deliverable_path && <button className="text-xs text-primary hover:underline" onClick={() => openDocument(m.deliverable_path!).catch((e) => toast.error(e.message))}>Open current deliverable</button>}
          </div>
          <div className="space-y-1.5">
            <Label>Supervisor comments</Label>
            {isReviewer ? (
              <Textarea rows={2} value={m.supervisor_comment ?? ""} onChange={(e) => set("supervisor_comment", e.target.value)} />
            ) : (
              <p className="rounded-md bg-muted p-3 text-sm">{m.supervisor_comment || "No comments yet."}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FeedbackThread({ feedback, milestones, onPost }: {
  feedback: { id: string; body: string; kind: string; created_at: string; milestone_id: string | null; author: { full_name: string } | null }[];
  milestones: Milestone[];
  onPost: (b: string) => Promise<void>;
}) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  async function post() {
    if (!body.trim()) return;
    setBusy(true);
    try { await onPost(body.trim()); setBody(""); } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  }
  const kindLabel: Record<string, string> = { comment: "Comment", reply: "Reply", revision: "Revision request", status: "Status", milestone: "Milestone" };
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-4 shadow-soft">
        <Textarea rows={3} placeholder="Write a comment or reply…" value={body} onChange={(e) => setBody(e.target.value)} />
        <div className="mt-3 flex justify-end"><Button onClick={post} disabled={busy || !body.trim()}><Send className="mr-1 h-4 w-4" /> Post</Button></div>
      </div>
      {feedback.length === 0 ? <Empty text="No feedback yet." /> : (
        <ol className="relative space-y-4 border-l pl-6">
          {feedback.map((f) => (
            <li key={f.id} className="relative">
              <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{f.author?.full_name}</span>
                <span className="rounded bg-muted px-1.5 py-0.5">{kindLabel[f.kind] ?? f.kind}</span>
                {f.milestone_id && <span>· {milestones.find((m) => m.id === f.milestone_id)?.title}</span>}
                <span>· {new Date(f.created_at).toLocaleString()}</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm">{f.body}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
