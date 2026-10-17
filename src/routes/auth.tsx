import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { GraduationCap, Home } from "lucide-react";
import authSide from "@/assets/auth-side.jpg";
import { supabase } from "@/integrations/supabase/client";
import { friendly } from "@/lib/auth-errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — FYPMS" },
      { name: "description", content: "Sign in or create a student or supervisor account on FYPMS." },
      { property: "og:title", content: "Sign in — FYPMS" },
      { property: "og:description", content: "Access your final year project workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const signUpSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["student", "supervisor"]),
  department: z.string().trim().max(100).optional(),
  reg_number: z.string().trim().max(40).optional(),
});

async function homeFor(userId: string): Promise<"/admin" | "/dashboard"> {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).some((r) => r.role === "admin") ? "/admin" : "/dashboard";
}

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [role, setRole] = useState<"student" | "supervisor">("student");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [unconfirmed, setUnconfirmed] = useState<string | null>(null);

  async function resend(email: string) {
    const { error } = await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: window.location.origin + "/dashboard" } });
    if (error) toast.error(friendly(error.message));
    else toast.success("Confirmation email sent again.");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setErrors({});
    setUnconfirmed(null);
    const email = (fd["email"] ?? "").trim().toLowerCase();
    if (!z.string().email().safeParse(email).success) return void setErrors({ email: email ? "Enter a valid email" : "Email is required" });
    setBusy(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) return void toast.error(friendly(error.message));
        setSent("If an account exists for this email, we sent a password reset link. Open it to choose a new password.");
      } else if (mode === "signin") {
        if (!fd["password"]) return void setErrors({ password: "Password is required" });
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: fd["password"] });
        if (error) {
          if (error.message.toLowerCase().includes("not confirmed")) setUnconfirmed(email);
          const msg = friendly(error.message);
          if (error.message.toLowerCase().includes("invalid login")) setErrors({ password: msg });
          return void toast.error(msg);
        }
        toast.success("Signed in successfully");
        navigate({ to: await homeFor(data.user.id) });
      } else {
        const parsed = signUpSchema.safeParse({ ...fd, email, role });
        if (!parsed.success) {
          const errs: Record<string, string> = {};
          parsed.error.issues.forEach((i) => (errs[String(i.path[0])] = i.message));
          return void setErrors(errs);
        }
        const { password, ...meta } = parsed.data;
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/dashboard", data: meta },
        });
        if (error) {
          const msg = friendly(error.message);
          setErrors(error.message.toLowerCase().includes("weak") ? { password: msg } : { email: msg });
          return void toast.error(msg);
        }
        // An already-registered email returns a placeholder user with no identities:
        // nothing was created and the password was NOT changed.
        if (data.user && (data.user.identities ?? []).length === 0) {
          const msg = "An account with this email already exists. Sign in with your original password, or use \"Forgot password?\" to set a new one.";
          toast.error(msg);
          setMode("signin");
          return void setErrors({ email: msg });
        }
        if (data.session) {
          toast.success("Account created");
          navigate({ to: await homeFor(data.session.user.id) });
        } else setSent("Account created! We sent a confirmation link to your email. Click it to activate your account, then sign in.");
      }
    } finally {
      setBusy(false);
    }
  }

  const err = (k: string) => errors[k] && <p className="text-xs text-destructive">{errors[k]}</p>;
  const switchTo = (m: Mode) => { setErrors({}); setUnconfirmed(null); setMode(m); };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden overflow-hidden text-ink-foreground md:block">
        <img src={authSide} alt="Students working on a final year project" width={1024} height={1536} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/20" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold">
            <GraduationCap className="h-6 w-6 text-accent" /> FYPMS
          </Link>
          <div>
            <p className="font-display text-4xl leading-tight">“A good project is a well-planned project.”</p>
            <p className="mt-3 text-sm text-ink-foreground/80">Proposals, milestones and feedback — all in one place.</p>
          </div>
        </div>
      </div>
      <div className="relative flex items-center justify-center p-6">
        <Link to="/" aria-label="Back to home" className="absolute right-6 top-6 inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm font-medium shadow-soft hover:bg-muted">
          <Home className="h-4 w-4" /> Home
        </Link>
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-2 font-display text-lg font-semibold md:hidden">
            <GraduationCap className="h-5 w-5 text-primary" /> FYPMS
          </Link>
          {sent ? (
            <div className="text-center">
              <h1 className="text-3xl font-semibold">Check your email</h1>
              <p className="mt-3 text-sm text-muted-foreground">{sent}</p>
              <Button variant="outline" className="mt-6" onClick={() => { setSent(null); switchTo("signin"); }}>Back to sign in</Button>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-semibold">
                {mode === "signin" ? "Welcome back" : mode === "signup" ? "Create account" : "Reset password"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === "signin" ? "Sign in to your project workspace." : mode === "signup" ? "Join as a student or supervisor." : "Enter your email and we'll send you a reset link."}
              </p>
              <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
                {mode === "signup" && (
                  <>
                    <Tabs value={role} onValueChange={(v) => setRole(v as typeof role)}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="student">Student</TabsTrigger>
                        <TabsTrigger value="supervisor">Supervisor</TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <div className="space-y-1.5">
                      <Label htmlFor="full_name">Full name</Label>
                      <Input id="full_name" name="full_name" />
                      {err("full_name")}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="department">Department</Label>
                        <Input id="department" name="department" placeholder="BS IT" />
                      </div>
                      {role === "student" && (
                        <div className="space-y-1.5">
                          <Label htmlFor="reg_number">Reg. number</Label>
                          <Input id="reg_number" name="reg_number" />
                        </div>
                      )}
                    </div>
                  </>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" autoComplete="email" />
                  {err("email")}
                </div>
                {mode !== "forgot" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      {mode === "signin" && (
                        <button type="button" className="text-xs font-semibold text-primary hover:underline" onClick={() => switchTo("forgot")}>
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <Input id="password" name="password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} />
                    {err("password")}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
                </Button>
                {unconfirmed && (
                  <div className="rounded-lg border bg-muted/50 p-3 text-xs">
                    Didn't get the confirmation email?{" "}
                    <button type="button" className="font-semibold text-primary hover:underline" onClick={() => resend(unconfirmed)}>Resend it</button>
                  </div>
                )}
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
                <button className="font-semibold text-primary hover:underline" onClick={() => switchTo(mode === "signin" ? "signup" : "signin")}>
                  {mode === "signin" ? "Create an account" : "Sign in"}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
