import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { GraduationCap, Home, Workflow, FolderKanban, Sparkles, Mail, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/how-it-works", label: "How it works", icon: Workflow },
  { to: "/fyps", label: "FYPs", icon: FolderKanban },
  { to: "/features", label: "Features", icon: Sparkles },
  { to: "/contact", label: "Contact", icon: Mail },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 text-foreground backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2.5 rounded-md font-display text-xl font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground"><GraduationCap className="h-5 w-5" /></span>
          FYPMS
        </Link>
        <nav className="hidden items-center gap-1 text-sm lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: true }}
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              activeProps={{ className: "bg-muted !text-primary" }}
            >
              <l.icon className="h-4 w-4" /> {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex"><Link to="/auth">Sign in</Link></Button>
          <Button asChild size="sm" className="hidden sm:inline-flex"><Link to="/auth">Get started</Link></Button>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen((o) => !o)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t px-5 py-3 sm:px-6 lg:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: true }}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              activeProps={{ className: "bg-muted !text-primary" }}
            >
              <l.icon className="h-4 w-4" /> {l.label}
            </Link>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2 border-t pt-3 sm:hidden">
            <Button asChild variant="outline" size="sm"><Link to="/auth">Sign in</Link></Button>
            <Button asChild size="sm"><Link to="/auth">Get started</Link></Button>
          </div>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-hero text-ink-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <span className="flex items-center gap-2 font-display text-xl font-semibold"><span className="grid h-9 w-9 place-items-center rounded-md bg-ink-foreground/10"><GraduationCap className="h-5 w-5 text-accent" /></span> FYPMS</span>
          <p className="mt-4 max-w-sm text-sm leading-6 text-ink-foreground/70">Final Year Project Management System for the BS Information Technology program.</p>
        </div>
        <div>
          <p className="font-semibold">Navigate</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-ink-foreground/70">
            {links.map((l) => (
              <li key={l.to}><Link to={l.to} className="transition-colors hover:text-ink-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">{l.label === "FYPs" ? "FYPs / Projects" : l.label}</Link></li>
            ))}
            <li><Link to="/auth" className="transition-colors hover:text-ink-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">Sign in / Sign up</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Contact</p>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-ink-foreground/70">
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
      <section className="bg-hero pb-14 pt-10 text-ink-foreground sm:pb-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold leading-tight md:text-5xl">{title}</h1>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-ink-foreground/75">{intro}</p>
        </div>
      </section>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
