import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, FileCheck2, KanbanSquare, MessageSquareText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FYPMS — Final Year Project Management System" },
      { name: "description", content: "Submit proposals, track milestones and get supervisor feedback on your final year project." },
      { property: "og:title", content: "FYPMS — Final Year Project Management System" },
      { property: "og:description", content: "Proposals, milestones, progress and feedback for final year projects in one place." },
    ],
  }),
  component: Index,
});

const features = [
  { icon: FileCheck2, title: "Proposal review", text: "Submit structured proposals and follow every review step from draft to approval." },
  { icon: KanbanSquare, title: "Milestone board", text: "Plan analysis to final presentation on a board with clear overdue signals." },
  { icon: MessageSquareText, title: "Feedback history", text: "Every comment, revision request and reply kept alongside the project." },
];

function Index() {
  return (
    <div className="min-h-screen">
      <section className="bg-hero text-ink-foreground">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <span className="flex items-center gap-2 font-display text-xl font-semibold">
            <GraduationCap className="h-6 w-6 text-accent" /> FYPMS
          </span>
          <Button asChild variant="secondary" size="sm">
            <Link to="/auth">Sign in</Link>
          </Button>
        </header>
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-20 pt-10 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Final Year Projects</p>
            <h1 className="mt-4 text-5xl font-semibold leading-[1.05] md:text-6xl">From proposal to presentation, on schedule.</h1>
            <p className="mt-6 max-w-md text-lg text-ink-foreground/75">
              One place for students, supervisors and coordinators to manage proposals, milestones, deadlines and feedback.
            </p>
            <div className="mt-8 flex gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/auth">Get started <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
          <img src={hero} alt="Student desk with project plans" className="aspect-[4/3] w-full rounded-2xl object-cover shadow-soft" />
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-20 md:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl border bg-card p-6 shadow-soft">
            <f.icon className="h-6 w-6 text-primary" />
            <h3 className="mt-4 text-xl font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
