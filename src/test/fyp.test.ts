import { describe, it, expect } from "vitest";
import { overallProgress, isOverdue, milestoneStats } from "@/lib/fyp";

const today = new Date(2026, 9, 12);

describe("progress rules", () => {
  it("overall progress is the average of milestones, completed counts as 100", () => {
    expect(
      overallProgress([
        { status: "completed", progress: 20, due_date: null },
        { status: "in_progress", progress: 50, due_date: null },
        { status: "pending", progress: 0, due_date: null },
      ]),
    ).toBe(50);
  });
  it("no milestones means 0% progress", () => {
    expect(overallProgress([])).toBe(0);
  });
  it("an unfinished milestone past its due date is overdue", () => {
    expect(isOverdue({ status: "in_progress", progress: 10, due_date: "2026-10-11" }, today)).toBe(true);
  });
  it("a completed milestone is never overdue", () => {
    expect(isOverdue({ status: "completed", progress: 100, due_date: "2026-01-01" }, today)).toBe(false);
  });
  it("counts completed vs pending milestones", () => {
    const s = milestoneStats(
      [
        { status: "completed", progress: 100, due_date: null },
        { status: "pending", progress: 0, due_date: "2026-10-01" },
      ],
      today,
    );
    expect(s).toEqual({ total: 2, completed: 1, pending: 1, overdue: 1 });
  });
});
