import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { GraduationCap, House, Workflow, FolderKanban, Sparkles, Mail, Menu, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", label: "Home", icon: House },
  { to: "/how-it-works", label: "How it Works", icon: Workflow },
  { to: "/fyps", label: "FYPs", icon: FolderKanban },
  { to: "/features", label: "Features", icon: Sparkles },
  { to: "/contact", label: "Contact", icon: Mail },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="bg-hero text-ink-foreground">
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-5">
        <div className={`overflow-hidden border border-accent/30 bg-ink/80 shadow-soft transition-[border-radius] duration-200 ${open ? "rounded-3xl" : "rounded-full"}`}>
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <Link to="/" className="flex shrink-0 items-center gap-2 font-display text-xl font-semibold">
              <GraduationCap className="h-7 w-7 text-accent" /> FYPMS
            </Link>
            <nav className="hidden items-center text-sm lg:flex">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  activeOptions={{ exact: true }}
                  className="group relative flex min-h-12 items-center gap-2 border-r border-ink-foreground/15 px-3 text-ink-foreground transition-colors duration-200 hover:text-ink-foreground focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset last:border-r-0 xl:gap-2.5 xl:px-4 after:absolute after:inset-x-3 after:-bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-200 after:content-[''] xl:after:inset-x-4"
                  activeProps={{ className: "after:scale-x-100" }}
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-nav-icon-well">
                    <l.icon aria-hidden="true" className="h-4 w-4 text-nav-icon transition-transform duration-200 group-hover:-translate-y-0.5" />
                  </span>
                  <span className="whitespace-nowrap">{l.label}</span>
                </Link>
              ))}
            </nav>
            <div className="flex shrink-0 items-center gap-2">
              <Button asChild size="sm" className="rounded-full bg-accent px-4 text-accent-foreground transition-colors duration-200 hover:bg-accent/90">
                <Link to="/auth"><UserRound aria-hidden="true" className="mr-2 h-4 w-4" />Sign in</Link>
              </Button>
              <button className="grid h-10 w-10 place-items-center rounded-full text-ink-foreground transition-colors hover:bg-ink-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={open}>
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
          {open && (
            <nav className="flex flex-col gap-1 border-t border-ink-foreground/10 px-4 py-3 lg:hidden">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: true }}
                  className="group relative flex min-h-11 items-center gap-3 px-3 py-2 text-sm text-ink-foreground transition-colors duration-200 hover:bg-ink-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent after:absolute after:inset-y-2 after:left-0 after:w-0.5 after:origin-top after:scale-y-0 after:bg-accent after:transition-transform after:duration-200 after:content-['']"
                  activeProps={{ className: "after:scale-y-100" }}
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-nav-icon-well">
                    <l.icon aria-hidden="true" className="h-4 w-4 text-nav-icon transition-transform duration-200 group-hover:-translate-y-0.5" />
                  </span>
                  <span>{l.label}</span>
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
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
