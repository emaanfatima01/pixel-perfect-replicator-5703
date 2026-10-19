import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SitePage } from "@/components/SiteLayout";
import { categories, roles } from "@/lib/site-content";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/fyps")({
  head: () => ({
    meta: [
      { title: "FYPs / Projects — FYPMS" },
      { name: "description", content: "Final year project categories in the BS IT program and who does what in FYPMS." },
      { property: "og:title", content: "FYPs / Projects — FYPMS" },
      { property: "og:description", content: "Explore project categories and roles for BS IT final year projects." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Fyps,
});

function Fyps() {
  return (
    <SitePage eyebrow="FYPs / Projects" title="Final year projects in BS IT" intro="Students choose a project area, submit a proposal and work with an assigned supervisor. Signed-in users can view their own projects in the dashboard.">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-3xl font-semibold">Project categories</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c.title} className="rounded-2xl border bg-card p-6 shadow-soft">
              <FolderKanban className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-xl font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-muted/40 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-semibold">Who works on a project</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {roles.map((r) => (
              <div key={r.title} className="rounded-2xl border bg-card p-6">
                <r.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">{r.title}</h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {r.points.map((p) => <li key={p} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{p}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild size="lg"><Link to="/auth">View my projects <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
          </div>
        </div>
      </section>
    </SitePage>
  );
}
