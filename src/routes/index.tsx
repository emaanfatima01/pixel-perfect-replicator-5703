import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import hero from "@/assets/hero.jpg";
import { SiteHeader, SiteFooter } from "@/components/SiteLayout";
import { steps, features, roles, benefits, categories } from "@/lib/site-content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FYPMS — Final Year Project Management System" },
      { name: "description", content: "Submit proposals, track milestones and get supervisor feedback on your final year project." },
      { property: "og:title", content: "FYPMS — Final Year Project Management System" },
      { property: "og:description", content: "Proposals, milestones, progress and feedback for final year projects in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const faqs = [
  { q: "Who can create an account?", a: "Students and supervisors can sign up themselves. Coordinator access is granted by an existing coordinator." },
  { q: "Can I edit my proposal after submitting?", a: "Yes, until it is approved. If your supervisor requests a revision, you can update and resubmit it." },
  { q: "What files can I upload?", a: "PDF and Word documents up to 20 MB, for proposals and milestone deliverables." },
  { q: "How is my progress calculated?", a: "Each milestone has a progress value; the project progress is the average across all milestones." },
  { q: "Who can see my project?", a: "Only you, your assigned supervisor and the coordinator." },
  { q: "I forgot my password. What now?", a: "Use “Forgot password?” on the sign-in page to receive a reset link by email." },
];

function Index() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="bg-hero text-ink-foreground">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-20 pt-10 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Final Year Projects</p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.05] sm:text-5xl md:text-6xl">From proposal to presentation, on schedule.</h1>
            <p className="mt-6 max-w-md text-lg text-ink-foreground/75">
              One place for students, supervisors and coordinators to manage proposals, milestones, deadlines and feedback.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/auth">Get started <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="secondary"><Link to="/auth">Sign in</Link></Button>
            </div>
          </div>
          <img src={hero} alt="Student desk with project plans" className="aspect-[4/3] w-full rounded-2xl object-cover shadow-soft" />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">What is FYPMS?</p>
        <h2 className="mt-3 text-3xl font-semibold md:text-4xl">A single workspace for the final year project</h2>
        <p className="mt-5 text-muted-foreground">
          FYPMS replaces spreadsheets, email threads and paper forms with one system. Students submit proposals,
          supervisors review them and guide progress, and coordinators oversee every project and deadline in the department.
        </p>
      </section>

      <section id="how" className="bg-muted/40 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-semibold md:text-4xl">How it works</h2>
          <ol className="mt-12 grid gap-4 md:grid-cols-5">
            {steps.map((s, i) => (
              <li key={s.title} className="relative rounded-2xl border bg-card p-5 shadow-soft">
                <span className="text-xs font-bold text-primary">STEP {i + 1}</span>
                <s.icon className="mt-3 h-6 w-6 text-primary" />
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
                {i < steps.length - 1 && <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-muted-foreground md:block" />}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="fyps" className="bg-muted/40 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-semibold md:text-4xl">FYPs / Projects</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <div key={c.title} className="rounded-2xl border bg-card p-6 shadow-soft">
                <h3 className="text-xl font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center"><Button asChild variant="outline"><Link to="/fyps">Explore projects <ArrowRight className="ml-1 h-4 w-4" /></Link></Button></div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-semibold md:text-4xl">Key features</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border bg-card p-6 shadow-soft">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10"><f.icon className="h-5 w-5 text-primary" /></span>
              <h3 className="mt-4 text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="roles" className="bg-hero py-20 text-ink-foreground">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-semibold md:text-4xl">Built for every role</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {roles.map((r) => (
              <div key={r.title} className="rounded-2xl border border-ink-foreground/15 bg-ink-foreground/5 p-6">
                <r.icon className="h-6 w-6 text-accent" />
                <h3 className="mt-4 text-xl font-semibold">{r.title}</h3>
                <ul className="mt-4 space-y-2 text-sm text-ink-foreground/80">
                  {r.points.map((p) => <li key={p} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{p}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-semibold md:text-4xl">Why use FYPMS?</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-2xl border bg-card p-6 shadow-soft">
              <b.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-xl font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="bg-muted/40 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center text-3xl font-semibold md:text-4xl">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="mt-10 rounded-2xl border bg-card px-6 shadow-soft">
            {faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-12 text-center">
            <Button asChild size="lg"><Link to="/auth">Get started <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
