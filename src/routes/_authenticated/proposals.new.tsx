import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/auth";
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
  const [values, setValues] = useState<Record<string, string>>({ category: CATEGORIES[0] });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

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
      <div className="mt-8 space-y-5 rounded-2xl border bg-card p-6 shadow-soft md:p-8">
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
            <Select value={values["category"] ?? CATEGORIES[0]} onValueChange={(v) => set("category", v)}>
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
        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <Button variant="outline" disabled={busy} onClick={() => save(false)}>Save draft</Button>
          <Button disabled={busy} onClick={() => save(true)}>{busy ? "Saving…" : "Submit for review"}</Button>
        </div>
      </div>
    </div>
  );
}
