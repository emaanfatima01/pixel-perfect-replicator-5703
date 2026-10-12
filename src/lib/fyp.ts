import type { Database } from "@/integrations/supabase/types";

export type Role = Database["public"]["Enums"]["app_role"];
export type ProposalStatus = Database["public"]["Enums"]["proposal_status"];
export type MilestoneStatus = Database["public"]["Enums"]["milestone_status"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Milestone = Database["public"]["Tables"]["milestones"]["Row"];
export type Feedback = Database["public"]["Tables"]["feedback"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export const PROPOSAL_LABEL: Record<ProposalStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  approved: "Approved",
  revision_required: "Revision Required",
  rejected: "Rejected",
};

export const PROPOSAL_TONE: Record<ProposalStatus, "muted" | "info" | "warning" | "success" | "destructive"> = {
  draft: "muted",
  submitted: "info",
  under_review: "info",
  approved: "success",
  revision_required: "warning",
  rejected: "destructive",
};

export const CATEGORIES = [
  "Web Application",
  "Mobile Application",
  "AI / Machine Learning",
  "Data Science",
  "Networking & Security",
  "IoT / Embedded",
  "Game Development",
  "Other",
];

export const DEFAULT_MILESTONES = [
  "Requirement Analysis",
  "System Design",
  "Database Design",
  "Development",
  "Testing",
  "Documentation",
  "Final Presentation",
];

export type MilestoneView = "pending" | "in_progress" | "completed" | "overdue";

type MLike = Pick<Milestone, "status" | "progress" | "due_date">;

/** Effective progress of one milestone: completed always counts as 100. */
export function milestoneProgress(m: MLike): number {
  if (m.status === "completed") return 100;
  return Math.max(0, Math.min(100, m.progress ?? 0));
}

/** Overall project progress = average of milestone progress, rounded. 0 when there are no milestones. */
export function overallProgress(ms: MLike[]): number {
  if (!ms.length) return 0;
  return Math.round(ms.reduce((s, m) => s + milestoneProgress(m), 0) / ms.length);
}

/** A milestone is overdue when it is not completed and its due date is before today. */
export function isOverdue(m: MLike, today: Date = new Date()): boolean {
  if (m.status === "completed" || !m.due_date) return false;
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return new Date(m.due_date + "T00:00:00") < t;
}

export function milestoneView(m: MLike, today?: Date): MilestoneView {
  if (isOverdue(m, today)) return "overdue";
  return m.status;
}

export function milestoneStats(ms: MLike[], today?: Date) {
  return {
    total: ms.length,
    completed: ms.filter((m) => m.status === "completed").length,
    pending: ms.filter((m) => m.status !== "completed").length,
    overdue: ms.filter((m) => isOverdue(m, today)).length,
  };
}

export function fmtDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d.length === 10 ? d + "T00:00:00" : d).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
