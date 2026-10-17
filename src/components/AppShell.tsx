import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, FolderKanban, FilePlus2, UserCircle, Shield, LogOut, GraduationCap, Menu, Home } from "lucide-react";
import { useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const items = [
    { to: "/", label: "Home", icon: Home, show: true },
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: true },
    { to: "/projects", label: me?.role === "student" ? "My projects" : "Projects", icon: FolderKanban, show: true },
    { to: "/proposals/new", label: "New proposal", icon: FilePlus2, show: me?.role === "student" },
    { to: "/admin", label: "Coordinator", icon: Shield, show: me?.role === "admin" },
    { to: "/profile", label: "Profile", icon: UserCircle, show: true },
  ] as const;

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {items.filter((i) => i.show).map((i) => (
        <Link
          key={i.to}
          to={i.to}
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          activeProps={{ className: "bg-sidebar-accent text-sidebar-primary" }}
        >
          <i.icon className="h-4 w-4" />
          {i.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen lg:flex">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col gap-6 bg-sidebar p-5 transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Link to="/dashboard" className="flex items-center gap-2 text-sidebar-foreground">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-semibold">FYPMS</span>
        </Link>
        {nav}
        <div className="rounded-lg border border-sidebar-border p-3 text-sidebar-foreground">
          <p className="truncate text-sm font-semibold">{me?.profile?.full_name || "…"}</p>
          <p className="text-xs capitalize text-sidebar-foreground/60">{me?.role}</p>
          <button onClick={signOut} className="mt-3 flex items-center gap-2 text-xs font-semibold text-sidebar-primary hover:underline">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-ink/50 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="flex-1">
        <header className="flex items-center gap-3 border-b bg-card px-4 py-3 lg:hidden">
          <button onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-display text-lg font-semibold">FYPMS</span>
        </header>
        <main className="mx-auto max-w-6xl p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
