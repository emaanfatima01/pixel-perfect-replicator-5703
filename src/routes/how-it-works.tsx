import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SitePage } from "@/components/SiteLayout";
import { steps, statuses } from "@/lib/site-content";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — FYPMS" },
      { name: "description", content: "The five stages of a final year project in FYPMS, from proposal to final presentation." },
      { property: "og:title", content: "How It Works — FYPMS" },
      { property: "og:description", content: "Proposal, review, milestones, progress tracking and final presentation explained." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HowItWorks,
});

function HowItWorks() {
  return (
    <SitePage eyebrow="How it works" title="Five stages, one clear path" intro="Every final year project in FYPMS moves through the same stages, so students, supervisors and the coordinator always know what happens next.">
      <section className="mx-auto max-w-4xl px-6 py-16">
        <ol className="space-y-4">
          {steps.map((s, i) => (
            <li key={s.title} className="card-lift flex gap-5 rounded-2xl border bg-card p-6 shadow-soft">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10"><s.icon className="h-6 w-6 text-primary" /></span>
              <div>
                <span className="text-xs font-bold text-primary">STEP {i + 1}</span>
                <h2 className="text-xl font-semibold">{s.title}</h2>
                <p className="mt-1 text-muted-foreground">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="bg-muted/40 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-center text-3xl font-semibold">Proposal statuses</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {statuses.map((s) => (
                <div key={s.name} className="card-lift rounded-xl border bg-card p-4">
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-sm text-muted-foreground">{s.text}</p>
                </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild size="lg"><Link to="/auth">Get started <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
          </div>
        </div>
      </section>
    </SitePage>
  );
}
