import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useMe } from "@/lib/auth";
import { useProjects, useMilestonesFor } from "@/lib/queries";
import { overallProgress, fmtDate, PROPOSAL_LABEL, type ProposalStatus } from "@/lib/fyp";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Empty } from "@/components/Panel";

export const Route = createFileRoute("/_authenticated/projects/")({
  head: () => ({ meta: [{ title: "Projects — FYPMS" }, { name: "description", content: "Browse and search final year projects." }] }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { data: me } = useMe();
  const { data: projects = [], isLoading } = useProjects(me);
  const ids = useMemo(() => projects.map((p) => p.id), [projects]);
  const { data: milestones = [] } = useMilestonesFor(ids);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  const list = projects.filter((p) => {
    const t = `${p.title} ${p.student?.full_name ?? ""} ${p.student?.reg_number ?? ""} ${p.category}`.toLowerCase();
    return t.includes(q.toLowerCase()) && (status === "all" || p.status === status);
  });

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-semibold">{me?.role === "student" ? "My projects" : "Projects"}</h1>
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-60 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by title, student, reg. number or category" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {(Object.keys(PROPOSAL_LABEL) as ProposalStatus[]).map((s) => <SelectItem key={s} value={s}>{PROPOSAL_LABEL[s]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
        {isLoading ? <Empty text="Loading…" /> : list.length === 0 ? <Empty text="No projects found." /> : (
          <ul className="divide-y">
            {list.map((p) => {
              const pct = overallProgress(milestones.filter((m) => m.project_id === p.id));
              return (
                <li key={p.id}>
                  <Link to="/projects/$id" params={{ id: p.id }} className="grid gap-3 p-5 transition hover:bg-muted/50 md:grid-cols-[1fr_auto_10rem] md:items-center">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{p.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.student?.full_name}{p.student?.reg_number ? ` (${p.student.reg_number})` : ""} · {p.category} · updated {fmtDate(p.updated_at)}
                      </p>
                    </div>
                    <StatusBadge status={p.status} />
                    <div className="flex items-center gap-2"><Progress value={pct} className="h-2" /><span className="w-10 text-right text-xs font-semibold">{pct}%</span></div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
