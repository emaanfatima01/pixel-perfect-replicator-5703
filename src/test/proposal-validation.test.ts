import { describe, it, expect } from "vitest";
import { proposalErrors, attachmentTooLarge } from "@/lib/proposal-schema";

const valid = {
  title: "Smart Attendance System",
  problem_statement: "Manual attendance wastes lecture time and is error prone.",
  objectives: "Automate attendance with QR codes.",
  proposed_solution: "A web app where students scan a rotating QR code in class.",
  scope: "Single department, web only.",
  technologies: "React, PostgreSQL",
  expected_outcomes: "Faster, accurate attendance records.",
  category: "Web Application",
  supervisor_id: "3f2b8c1e-4d5a-4b6c-9e7f-1a2b3c4d5e6f",
};

const required = [
  "title", "problem_statement", "objectives", "proposed_solution",
  "scope", "technologies", "expected_outcomes", "category", "supervisor_id",
] as const;

describe("proposal form validation", () => {
  it("accepts a complete proposal", () => {
    expect(proposalErrors(valid)).toBeNull();
  });

  for (const key of required) {
    it(`rejects a proposal missing ${key}`, () => {
      const { [key]: _omit, ...rest } = valid;
      expect(proposalErrors(rest)?.[key]).toBeTruthy();
    });
    it(`rejects an empty ${key}`, () => {
      expect(proposalErrors({ ...valid, [key]: "" })?.[key]).toBeTruthy();
    });
  }

  it("an empty form reports every required field", () => {
    expect(Object.keys(proposalErrors({}) ?? {}).sort()).toEqual([...required].sort());
  });

  it("whitespace-only title is treated as missing", () => {
    expect(proposalErrors({ ...valid, title: "     " })?.['title']).toBe("Title must be at least 5 characters");
  });

  it("title needs at least 5 characters", () => {
    expect(proposalErrors({ ...valid, title: "Abcd" })?.['title']).toBeTruthy();
    expect(proposalErrors({ ...valid, title: "Abcde" })).toBeNull();
  });

  it("title over 200 characters is rejected", () => {
    expect(proposalErrors({ ...valid, title: "a".repeat(201) })?.['title']).toBeTruthy();
  });

  it("problem statement needs at least 20 characters", () => {
    expect(proposalErrors({ ...valid, problem_statement: "a".repeat(19) })?.['problem_statement']).toBeTruthy();
  });

  it("supervisor must be a real selection", () => {
    expect(proposalErrors({ ...valid, supervisor_id: "not-a-supervisor" })?.['supervisor_id']).toBe("Choose a supervisor");
  });

  it("attachments over 20 MB are rejected, 20 MB is allowed", () => {
    expect(attachmentTooLarge({ size: 20 * 1024 * 1024 + 1 })).toBe(true);
    expect(attachmentTooLarge({ size: 20 * 1024 * 1024 })).toBe(false);
    expect(attachmentTooLarge(null)).toBe(false);
  });
});
