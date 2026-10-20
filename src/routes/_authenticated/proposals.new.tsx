import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Sparkles, Lightbulb, CircleCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/auth";
import { reviewProposal, type ProposalReview } from "@/lib/proposal-review.functions";
import { CATEGORIES, type Project } from "@/lib/fyp";
import { proposalSchema, attachmentTooLarge, type ProposalInput } from "@/lib/proposal-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/proposals/new")({
  validateSearch: (s: Record<string, unknown>) => ({ id: typeof s["id"] === "string" ? (s["id"] as string) : undefined }),
  head: () => ({ meta: [{ title: "Project proposal — FYPMS" }, { name: "description", content: "Write and submit your project proposal." }] }),
  component: ProposalForm,
});

const schema = proposalSchema;

const fields: { key: keyof ProposalInput; label: string; long?: boolean }[] = [
  { key: "title", label: "Project title" },
  { key: "problem_statement", label: "Problem statement", long: true },
  { key: "objectives", label: "Project objectives", long: true },
  { key: "proposed_solution", label: "Proposed solution", long: true },
  { key: "scope", label: "Project scope", long: true },
  { key: "technologies", label: "Technologies & tools" },
  { key: "expected_outcomes", label: "Expected outcomes", long: true },
];

function ProposalForm() {
  const { id } = Route.useSearch();
  const { data: me } = useMe();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [values, setValues] = useState<Record<string, string>>({ category: CATEGORIES[0] ?? "" });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [review, setReview] = useState<ProposalReview | null>(null);
  const [reviewBusy, setReviewBusy] = useState(false);
  const reviewFn = useServerFn(reviewProposal);

  async function reviewWithAi() {
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[String(i.path[0])] = i.message));
      setErrors(errs);
      toast.error("Fill in every section first, then the AI can review it");
      return;
    }
    setErrors({});
    setReviewBusy(true);
    try {
      const res = await reviewFn({ data: parsed.data });
      if (res.error || !res.review) toast.error(res.error ?? "Could not review the proposal");
      else setReview(res.review);
    } catch {
      toast.error("The AI reviewer is unavailable right now. Please try again in a moment.");
    } finally {
      setReviewBusy(false);
    }
  }

  const { data: supervisors = [] } = useQuery({
    queryKey: ["supervisors"],
    queryFn: async () => (await supabase.rpc("list_supervisors")).data ?? [],
  });
  const { data: existing } = useQuery({
    enabled: !!id,
    queryKey: ["project", id],
    queryFn: async () => (await supabase.from("projects").select("*").eq("id", id!).single()).data as Project,
  });
  useEffect(() => {
    if (existing) {
      const v: Record<string, string> = {};
      for (const k of [...fields.map((f) => f.key), "category", "supervisor_id"] as const) v[k] = (existing[k] as string) ?? "";
      setValues(v);
    }
  }, [existing]);

  if (me && me.role !== "student") return <p className="text-muted-foreground">Only students can submit proposals.</p>;

  async function save(submit: boolean) {
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[String(i.path[0])] = i.message));
      setErrors(errs);
      toast.error("Please fix the highlighted fields");
      return;
    }
    if (attachmentTooLarge(file)) return void toast.error("Attachment must be under 20 MB");
    setErrors({});
    setBusy(true);
    try {
      const payload = { ...parsed.data, status: submit ? ("submitted" as const) : ("draft" as const) };
      let projectId = id;
      if (id) {
        const { error } = await supabase.from("projects").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("projects").insert({ ...payload, student_id: me!.id }).select("id").single();
        if (error) throw error;
        projectId = data.id;
      }
      if (file && projectId) {
        const path = `${projectId}/proposal-${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
        const { error } = await supabase.storage.from("documents").upload(path, file);
        if (error) throw error;
        await supabase.from("projects").update({ document_path: path }).eq("id", projectId);
      }
      if (submit && projectId) {
        await supabase.from("feedback").insert({ project_id: projectId, author_id: me!.id, kind: "status", body: id ? "Proposal resubmitted for review." : "Proposal submitted for review." });
      }
      qc.invalidateQueries();
      toast.success(submit ? "Proposal submitted" : "Draft saved");
      navigate({ to: "/projects/$id", params: { id: projectId! } });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const set = (k: string, v: string): void => setValues((s) => ({ ...s, [k]: v }));

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-4xl font-semibold">{id ? "Revise proposal" : "New project proposal"}</h1>
      <p className="mt-2 text-muted-foreground">Fill in every section. You can save a draft and submit later.</p>
      <div className="card-lift mt-8 space-y-5 rounded-2xl border bg-card p-6 shadow-soft md:p-8">
        {fields.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label htmlFor={f.key}>{f.label}</Label>
            {f.long ? (
              <Textarea id={f.key} rows={4} value={values[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />
            ) : (
              <Input id={f.key} value={values[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />
            )}
            {errors[f.key] && <p className="text-xs text-destructive">{errors[f.key]}</p>}
          </div>
        ))}
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={values["category"] ?? CATEGORIES[0] ?? ""} onValueChange={(v) => set("category", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Supervisor preference</Label>
            <Select value={values["supervisor_id"] ?? ""} onValueChange={(v) => set("supervisor_id", v)}>
              <SelectTrigger><SelectValue placeholder={supervisors.length ? "Choose a supervisor" : "No supervisors registered yet"} /></SelectTrigger>
              <SelectContent>
                {supervisors.map((s) => <SelectItem key={s.id} value={s.id}>{s.full_name}{s.department ? ` · ${s.department}` : ""}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors["supervisor_id"] && <p className="text-xs text-destructive">{errors["supervisor_id"]}</p>}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="doc">Proposal document (PDF/DOCX, optional)</Label>
          <Input id="doc" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          {existing?.document_path && !file && <p className="text-xs text-muted-foreground">A document is already attached.</p>}
        </div>
        <div className="rounded-xl border border-dashed bg-muted/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4 text-primary" />AI proposal check</p>
              <p className="mt-1 text-sm text-muted-foreground">Get instant feedback on clarity and completeness before you submit.</p>
            </div>
            <Button type="button" variant="secondary" className="btn-lift" disabled={busy || reviewBusy} onClick={reviewWithAi}>
              {reviewBusy ? "Reviewing…" : "Review with AI"}
            </Button>
          </div>
          {review && (
            <div className="mt-4 space-y-4 border-t pt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {([["Clarity", review.clarity_score], ["Completeness", review.completeness_score]] as const).map(([label, score]) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm"><span className="font-medium">{label}</span><span className="font-semibold">{score}/10</span></div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${score * 10}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{review.summary}</p>
              {review.strengths.length > 0 && (
                <ul className="space-y-1.5 text-sm">
                  {review.strengths.map((s) => <li key={s} className="flex gap-2"><CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />{s}</li>)}
                </ul>
              )}
              {review.improvements.length > 0 && (
                <div>
                  <p className="text-sm font-semibold">Suggested improvements</p>
                  <ul className="mt-1.5 space-y-1.5 text-sm">
                    {review.improvements.map((s) => <li key={s} className="flex gap-2"><Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent-foreground" />{s}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <Button variant="outline" className="btn-lift" disabled={busy} onClick={() => save(false)}>Save draft</Button>
          <Button className="btn-lift" disabled={busy} onClick={() => save(true)}>{busy ? "Saving…" : "Submit for review"}</Button>
        </div>
      </div>
    </div>
  );
}
