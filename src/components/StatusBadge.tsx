import { cn } from "@/lib/utils";
import { PROPOSAL_LABEL, PROPOSAL_TONE, type ProposalStatus, type MilestoneView } from "@/lib/fyp";

const tone = {
  muted: "bg-muted text-muted-foreground",
  info: "bg-info/12 text-info",
  warning: "bg-warning/20 text-warning-foreground",
  success: "bg-success/15 text-success",
  destructive: "bg-destructive/12 text-destructive",
};

export function StatusBadge({ status }: { status: ProposalStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", tone[PROPOSAL_TONE[status]])}>
      {PROPOSAL_LABEL[status]}
    </span>
  );
}

const mTone: Record<MilestoneView, keyof typeof tone> = {
  pending: "muted",
  in_progress: "info",
  completed: "success",
  overdue: "destructive",
};
const mLabel: Record<MilestoneView, string> = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
  overdue: "Overdue",
};

export function MilestoneBadge({ view }: { view: MilestoneView }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", tone[mTone[view]])}>
      {mLabel[view]}
    </span>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
