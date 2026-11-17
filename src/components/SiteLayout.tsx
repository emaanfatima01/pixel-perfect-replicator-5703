import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { GraduationCap, House, Workflow, FolderKanban, Sparkles, Mail, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", label: "Home", icon: House },
  { to: "/how-it-works", label: "How it works", icon: Workflow },
  { to: "/fyps", label: "FYPs", icon: FolderKanban },
  { to: "/features", label: "Features", icon: Sparkles },
  { to: "/contact", label: "Contact", icon: Mail },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="bg-hero text-ink-foreground">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold">
          <GraduationCap className="h-6 w-6 text-accent" /> FYPMS
        </Link>
        <nav className="hidden items-center gap-1 text-sm md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: true }}
              className="group relative flex min-h-10 items-center gap-2 px-3 py-2 text-ink-foreground transition-colors duration-200 hover:text-ink-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink after:absolute after:inset-x-3 after:-bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-200 after:content-['']"
              activeProps={{ className: "after:scale-x-100" }}
            >
              <l.icon aria-hidden="true" className="h-4 w-4 shrink-0 text-nav-icon transition-transform duration-200 group-hover:-translate-y-0.5" />
              <span>{l.label}</span>
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="secondary" size="sm"><Link to="/auth">Sign in</Link></Button>
          <button className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t border-ink-foreground/10 px-6 py-3 md:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: true }}
              className="group relative flex min-h-11 items-center gap-3 px-3 py-2 text-sm text-ink-foreground transition-colors duration-200 hover:text-ink-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent after:absolute after:inset-y-2 after:left-0 after:w-0.5 after:origin-top after:scale-y-0 after:bg-accent after:transition-transform after:duration-200 after:content-['']"
              activeProps={{ className: "after:scale-y-100" }}
            >
              <l.icon aria-hidden="true" className="h-4 w-4 shrink-0 text-nav-icon transition-transform duration-200 group-hover:-translate-y-0.5" />
              <span>{l.label}</span>
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-hero text-ink-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-3">
        <div>
          <span className="flex items-center gap-2 font-display text-xl font-semibold"><GraduationCap className="h-6 w-6 text-accent" /> FYPMS</span>
          <p className="mt-3 text-sm text-ink-foreground/70">Final Year Project Management System for the BS Information Technology program.</p>
        </div>
        <div>
          <p className="font-semibold">Navigate</p>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-ink-foreground/70">
            {links.map((l) => (
              <li key={l.to}><Link to={l.to} className="hover:text-ink-foreground">{l.label === "FYPs" ? "FYPs / Projects" : l.label}</Link></li>
            ))}
            <li><Link to="/auth" className="hover:text-ink-foreground">Sign in / Sign up</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-foreground/70">
            <li>Department of Information Technology</li>
            <li>fyp-coordinator@university.edu</li>
            <li>+92 000 0000000</li>
          </ul>
        </div>
      </div>
      <p className="border-t border-ink-foreground/10 py-5 text-center text-xs text-ink-foreground/60">© {new Date().getFullYear()} FYPMS. All rights reserved.</p>
    </footer>
  );
}

export function SitePage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <section className="bg-hero pb-16 pt-8 text-ink-foreground">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-semibold md:text-5xl">{title}</h1>
          <p className="mt-4 text-ink-foreground/75">{intro}</p>
        </div>
      </section>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
