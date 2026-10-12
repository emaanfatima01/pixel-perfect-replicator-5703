import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Megaphone, FilePlus2, ArrowRight, CalendarClock, AlertTriangle } from "lucide-react";
import { useMe } from "@/lib/auth";
import { useProjects, useMilestonesFor, useFeedbackFor, useAnnouncements } from "@/lib/queries";
import { overallProgress, milestoneStats, isOverdue, fmtDate, type Milestone } from "@/lib/fyp";
import { StatusBadge, StatCard, MilestoneBadge } from "@/components/StatusBadge";
import { milestoneView } from "@/lib/fyp";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Panel, Empty } from "@/components/Panel";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — FYPMS" }, { name: "description", content: "Your final year project overview." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data: me } = useMe();
  const { data: projects = [] } = useProjects(me);
  const ids = useMemo(() => projects.map((p) => p.id), [projects]);
  const { data: milestones = [] } = useMilestonesFor(ids);
  const { data: feedback = [] } = useFeedbackFor(ids);
  const { data: announcements = [] } = useAnnouncements();
  if (!me) return null;

  const byProject = (id: string) => milestones.filter((m) => m.project_id === id);
  const upcoming = milestones
    .filter((m) => m.status !== "completed" && m.due_date)
    .sort((a, b) => a.due_date!.localeCompare(b.due_date!))
    .slice(0, 6);
  const name = me.profile?.full_name?.split(" ")[0] || "there";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground capitalize">{me.role} dashboard</p>
          <h1 className="mt-1 text-4xl font-semibold">Hello, {name}</h1>
        </div>
        {me.role === "student" && (
          <Button asChild>
            <Link to="/proposals/new" search={{ id: undefined }}><FilePlus2 className="mr-1 h-4 w-4" /> Submit proposal</Link>
          </Button>
        )}
      </div>

      {me.role === "student" ? (
        <StudentView projects={projects} milestones={milestones} byProject={byProject} />
      ) : (
        <SupervisorView projects={projects} milestones={milestones} byProject={byProject} feedback={feedback} isAdmin={me.role === "admin"} />
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Upcoming deadlines" icon={CalendarClock} className="lg:col-span-2">
          {upcoming.length === 0 ? <Empty text="No upcoming deadlines." /> : (
            <ul className="divide-y">
              {upcoming.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link to="/projects/$id" params={{ id: m.project_id }} className="font-medium hover:underline">{m.title}</Link>
                    <p className="truncate text-xs text-muted-foreground">{projects.find((p) => p.id === m.project_id)?.title}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className={isOverdue(m) ? "font-semibold text-destructive" : "text-muted-foreground"}>{fmtDate(m.due_date)}</span>
                    <MilestoneBadge view={milestoneView(m)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Announcements" icon={Megaphone}>
          {announcements.length === 0 ? <Empty text="No announcements yet." /> : (
            <ul className="space-y-4">
              {announcements.map((a) => (
                <li key={a.id}>
                  <p className="font-semibold">{a.title}</p>
                  <p className="text-sm text-muted-foreground">{a.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{fmtDate(a.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title={me.role === "student" ? "Recent supervisor feedback" : "Recent activity"}>
        {feedback.length === 0 ? <Empty text="No feedback yet." /> : (
          <ul className="divide-y">
            {feedback.slice(0, 6).map((f) => (
              <li key={f.id} className="py-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{f.author?.full_name}</span>
                  <span>{fmtDate(f.created_at)}</span>
                </div>
                <p className="mt-1 text-sm">{f.body}</p>
                <Link to="/projects/$id" params={{ id: f.project_id }} className="text-xs text-primary hover:underline">
                  {projects.find((p) => p.id === f.project_id)?.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

type P = ReturnType<typeof useProjects>["data"] & {};

function StudentView({ projects, milestones, byProject }: { projects: P; milestones: Milestone[]; byProject: (id: string) => Milestone[] }) {
  const current = projects.find((p) => p.status !== "rejected") ?? projects[0];
  if (!current) {
    return (
      <div className="rounded-2xl border border-dashed bg-card p-10 text-center">
        <h2 className="text-2xl font-semibold">No project yet</h2>
        <p className="mt-2 text-muted-foreground">Start by submitting your project proposal to a supervisor.</p>
        <Button asChild className="mt-6"><Link to="/proposals/new" search={{ id: undefined }}>Write a proposal</Link></Button>
      </div>
    );
  }
  const ms = byProject(current.id);
  const stats = milestoneStats(ms);
  const pct = overallProgress(ms);
  return (
    <>
      <Link to="/projects/$id" params={{ id: current.id }} className="block rounded-2xl bg-hero p-6 text-ink-foreground shadow-soft md:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={current.status} />
          <span className="text-sm text-ink-foreground/70">Supervisor: {current.supervisor?.full_name ?? "Not assigned"}</span>
        </div>
        <h2 className="mt-3 text-3xl font-semibold">{current.title}</h2>
        <div className="mt-6 flex items-center gap-4">
          <Progress value={pct} className="h-2.5 flex-1 bg-ink-foreground/20" />
          <span className="font-display text-2xl font-semibold">{pct}%</span>
        </div>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent">Open project <ArrowRight className="h-4 w-4" /></span>
      </Link>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Milestones" value={stats.total} />
        <StatCard label="Completed" value={stats.completed} />
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="Overdue" value={stats.overdue} hint={stats.overdue ? "Needs attention" : undefined} />
      </div>
      {milestones.length === 0 && current.status === "approved" && (
        <p className="flex items-center gap-2 rounded-lg bg-warning/15 p-3 text-sm"><AlertTriangle className="h-4 w-4" /> Your proposal is approved — add milestones from the project page.</p>
      )}
    </>
  );
}

function SupervisorView({ projects, byProject, feedback, isAdmin }: { projects: P; milestones: Milestone[]; byProject: (id: string) => Milestone[]; feedback: { project_id: string; created_at: string }[]; isAdmin: boolean }) {
  const pending = projects.filter((p) => p.status === "submitted" || p.status === "under_review");
  const active = projects.filter((p) => p.status === "approved");
  const needFeedback = active.filter((p) => {
    const last = feedback.find((f) => f.project_id === p.id);
    const lastUpdate = byProject(p.id).reduce((acc, m) => (m.updated_at > acc ? m.updated_at : acc), "");
    return lastUpdate && (!last || last.created_at < lastUpdate);
  });
  const chart = active.map((p) => ({ name: p.title.slice(0, 14), progress: overallProgress(byProject(p.id)) }));
  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label={isAdmin ? "All projects" : "Assigned projects"} value={projects.length} />
        <StatCard label="Pending review" value={pending.length} />
        <StatCard label="In progress" value={active.length} />
        <StatCard label="Need feedback" value={needFeedback.length} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Proposals awaiting review">
          {pending.length === 0 ? <Empty text="Nothing to review." /> : (
            <ul className="divide-y">
              {pending.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <Link to="/projects/$id" params={{ id: p.id }} className="font-medium hover:underline">{p.title}</Link>
                    <p className="text-xs text-muted-foreground">{p.student?.full_name}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Project progress">
          {chart.length === 0 ? <Empty text="No active projects." /> : (
            <div className="h-56">
              <ResponsiveContainer>
                <BarChart data={chart}>
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis domain={[0, 100]} fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="progress" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}

