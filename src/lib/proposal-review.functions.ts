import { createServerFn } from "@tanstack/react-start";
import { generateResponse, GatewayError } from "@lovable.dev/ai-gateway";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ProposalReviewInput = {
  title: string;
  problem_statement: string;
  objectives: string;
  proposed_solution: string;
  scope: string;
  technologies: string;
  expected_outcomes: string;
  category: string;
};

export type ProposalReview = {
  clarity_score: number;
  completeness_score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
};

const REVIEW_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["clarity_score", "completeness_score", "summary", "strengths", "improvements"],
  properties: {
    clarity_score: { type: "integer", minimum: 1, maximum: 10 },
    completeness_score: { type: "integer", minimum: 1, maximum: 10 },
    summary: { type: "string" },
    strengths: { type: "array", items: { type: "string" }, maxItems: 5 },
    improvements: { type: "array", items: { type: "string" }, maxItems: 8 },
  },
} as const;

export const reviewProposal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: ProposalReviewInput) => input)
  .handler(async ({ data }): Promise<{ review: ProposalReview | null; error: string | null }> => {
    const proposalText = [
      `Title: ${data.title}`,
      `Category: ${data.category}`,
      `Problem statement: ${data.problem_statement}`,
      `Objectives: ${data.objectives}`,
      `Proposed solution: ${data.proposed_solution}`,
      `Scope: ${data.scope}`,
      `Technologies & tools: ${data.technologies}`,
      `Expected outcomes: ${data.expected_outcomes}`,
    ].join("\n\n");

    try {
      const response = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions:
          "You are an experienced university final-year-project supervisor reviewing a student's project proposal. " +
          "Assess clarity (is the writing clear, specific and well-structured?) and completeness (does it cover problem, objectives, solution, scope, technologies and outcomes with enough detail?). " +
          "Score each from 1 (poor) to 10 (excellent). Give a short summary, up to 5 strengths, and up to 8 concrete, actionable improvements the student can make before submitting. Be encouraging but honest.",
        input: `Review this final year project proposal:\n\n${proposalText}`,
        text: { format: { type: "json_schema", name: "proposal_review", strict: true, schema: REVIEW_SCHEMA } },
        max_output_tokens: 2000,
      });

      const raw = response.output
        .filter((item) => item.type === "message")
        .flatMap((item) => item.content)
        .filter((part) => part.type === "output_text")
        .map((part) => part.text)
        .join("");
      const parsed = JSON.parse(raw) as ProposalReview;
      return { review: parsed, error: null };
    } catch (e) {
      if (e instanceof GatewayError) {
        console.error("Proposal review failed", { code: e.code, httpStatus: e.httpStatus });
        return { review: null, error: "The AI reviewer is unavailable right now. Please try again in a moment." };
      }
      console.error("Proposal review failed", e);
      return { review: null, error: "Could not review the proposal. Please try again." };
    }
  });
