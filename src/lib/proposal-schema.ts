import { z } from "zod";

export const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;

export const proposalSchema = z.object({
  title: z.string({ required_error: "Project title is required" }).trim().min(5, "Title must be at least 5 characters").max(200),
  problem_statement: z.string({ required_error: "Problem statement is required" }).trim().min(20, "Describe the problem (min 20 characters)").max(5000),
  objectives: z.string({ required_error: "Objectives are required" }).trim().min(10, "List your objectives").max(5000),
  proposed_solution: z.string({ required_error: "Proposed solution is required" }).trim().min(20, "Describe your solution (min 20 characters)").max(5000),
  scope: z.string({ required_error: "Scope is required" }).trim().min(10, "Define the scope").max(5000),
  technologies: z.string({ required_error: "Technologies are required" }).trim().min(2, "List technologies and tools").max(1000),
  expected_outcomes: z.string({ required_error: "Expected outcomes are required" }).trim().min(10, "Describe expected outcomes").max(5000),
  category: z.string({ required_error: "Choose a category" }).min(1, "Choose a category"),
  supervisor_id: z.string({ required_error: "Choose a supervisor" }).uuid("Choose a supervisor"),
});

export type ProposalInput = z.infer<typeof proposalSchema>;

/** Returns a map of field -> first error message, or null when valid. */
export function proposalErrors(values: Record<string, unknown>): Record<string, string> | null {
  const parsed = proposalSchema.safeParse(values);
  if (parsed.success) return null;
  const errs: Record<string, string> = {};
  for (const i of parsed.error.issues) {
    const k = String(i.path[0]);
    if (!errs[k]) errs[k] = i.message;
  }
  return errs;
}

export function attachmentTooLarge(file: { size: number } | null | undefined): boolean {
  return !!file && file.size > MAX_ATTACHMENT_BYTES;
}
