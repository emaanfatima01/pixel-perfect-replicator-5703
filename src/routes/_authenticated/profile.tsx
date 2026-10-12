import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — FYPMS" }, { name: "description", content: "Manage your FYPMS profile." }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const [v, setV] = useState({ full_name: "", department: "", reg_number: "" });
  const [pw, setPw] = useState({ current: "", next: "" });
  useEffect(() => {
    if (me?.profile) setV({ full_name: me.profile.full_name, department: me.profile.department ?? "", reg_number: me.profile.reg_number ?? "" });
  }, [me]);
  if (!me) return null;

  async function save() {
    if (v.full_name.trim().length < 2) return void toast.error("Name must be at least 2 characters");
    const { error } = await supabase.from("profiles").update({ full_name: v.full_name.trim(), department: v.department.trim() || null, reg_number: v.reg_number.trim() || null }).eq("id", me!.id);
    if (error) return void toast.error(error.message);
    toast.success("Profile updated");
    qc.invalidateQueries({ queryKey: ["me"] });
  }

  async function changePassword() {
    if (pw.next.length < 8) return void toast.error("New password must be at least 8 characters");
    const { error } = await supabase.auth.updateUser({ password: pw.next, current_password: pw.current } as { password: string });
    if (error) return void toast.error(error.message);
    setPw({ current: "", next: "" });
    toast.success("Password changed");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-4xl font-semibold">Profile</h1>
        <p className="mt-1 text-muted-foreground">{me.email} · <span className="capitalize">{me.role}</span></p>
      </div>
      <div className="space-y-4 rounded-2xl border bg-card p-6 shadow-soft">
        <div className="space-y-1.5"><Label>Full name</Label><Input value={v.full_name} onChange={(e) => setV({ ...v, full_name: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Department</Label><Input value={v.department} onChange={(e) => setV({ ...v, department: e.target.value })} /></div>
          {me.role === "student" && <div className="space-y-1.5"><Label>Reg. number</Label><Input value={v.reg_number} onChange={(e) => setV({ ...v, reg_number: e.target.value })} /></div>}
        </div>
        <div className="flex justify-end"><Button onClick={save}>Save changes</Button></div>
      </div>
      <div className="space-y-4 rounded-2xl border bg-card p-6 shadow-soft">
        <h2 className="text-lg font-semibold">Change password</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Current password</Label><Input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>New password</Label><Input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></div>
        </div>
        <div className="flex justify-end"><Button variant="outline" onClick={changePassword}>Update password</Button></div>
      </div>
    </div>
  );
}
