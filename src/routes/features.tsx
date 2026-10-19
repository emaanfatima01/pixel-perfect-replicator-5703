import { createFileRoute } from "@tanstack/react-router";
import { SitePage } from "@/components/SiteLayout";
import { features, benefits } from "@/lib/site-content";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — FYPMS" },
      { name: "description", content: "Proposal review, milestone board, feedback, uploads, reminders and search in FYPMS." },
      { property: "og:title", content: "Features — FYPMS" },
      { property: "og:description", content: "Everything FYPMS offers students, supervisors and coordinators." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Features,
});

function Features() {
  return (
    <SitePage eyebrow="Features" title="Everything a final year project needs" intro="Tools for proposals, milestones, feedback and deadlines — all in one place.">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...features, ...benefits].map((f) => (
            <div key={f.title} className="rounded-2xl border bg-card p-6 shadow-soft">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10"><f.icon className="h-5 w-5 text-primary" /></span>
              <h2 className="mt-4 text-xl font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>
    </SitePage>
  );
}
