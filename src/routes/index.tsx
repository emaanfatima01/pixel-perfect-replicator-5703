import { createFileRoute, Link } from "@tanstack/react-router";
import {
  GraduationCap, FileCheck2, KanbanSquare, MessageSquareText, ArrowRight, Bell, Upload, Search,
  CalendarClock, UserCheck, ClipboardList, Users, Presentation, CheckCircle2, LineChart, Clock, Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import hero from "@/assets/hero.jpg";

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

const steps = [
  { icon: ClipboardList, title: "Proposal Submission", text: "Students write a structured proposal and attach supporting documents." },
  { icon: UserCheck, title: "Supervisor Review", text: "Supervisors approve, reject or request revisions with written notes." },
  { icon: KanbanSquare, title: "Milestones", text: "Approved projects are broken into milestones with start and due dates." },
  { icon: LineChart, title: "Progress Tracking", text: "Progress updates, deliverables and comments are logged as work moves forward." },
  { icon: Presentation, title: "Final Presentation", text: "The coordinator schedules the defense and marks the project completed." },
];

const features = [
  { icon: FileCheck2, title: "Proposal review", text: "Draft, Submitted, Under Review, Approved, Revision Required or Rejected — every status is visible." },
  { icon: KanbanSquare, title: "Milestone board", text: "Plan analysis to final presentation on a board with clear overdue signals." },
  { icon: MessageSquareText, title: "Feedback history", text: "Every comment, revision request and reply kept alongside the project." },
  { icon: Upload, title: "Document uploads", text: "Attach proposals and milestone deliverables to secure, private storage." },
  { icon: Bell, title: "Deadline reminders", text: "In-app notifications for upcoming deadlines, overdue work and new feedback." },
  { icon: Search, title: "Search & filter", text: "Find projects by title, student, supervisor or status in seconds." },
];

const roles = [
  { icon: GraduationCap, title: "Students", points: ["Submit and revise proposals", "Manage milestones and upload deliverables", "Track progress and deadlines", "Read supervisor feedback"] },
  { icon: Users, title: "Supervisors", points: ["Review assigned proposals", "Update milestone statuses", "Comment on deliverables", "See which students need feedback"] },
  { icon: Megaphone, title: "Coordinators", points: ["Manage users and roles", "Assign supervisors to projects", "Schedule final presentations", "Publish announcements and monitor deadlines"] },
];

const benefits = [
  { icon: ClipboardList, title: "Organization", text: "Proposals, files, milestones and comments live in one record instead of scattered emails." },
  { icon: MessageSquareText, title: "Communication", text: "A shared feedback thread keeps students and supervisors on the same page." },
  { icon: Clock, title: "Deadline management", text: "Overdue milestones stand out, and reminders appear before due dates." },
];

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
      <section className="bg-hero text-ink-foreground">
        <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-6">
          <span className="flex items-center gap-2 font-display text-xl font-semibold">
            <GraduationCap className="h-6 w-6 text-accent" /> FYPMS
          </span>
          <nav className="hidden gap-6 text-sm text-ink-foreground/80 md:flex">
            <a href="#how" className="hover:text-ink-foreground">How it works</a>
            <a href="#features" className="hover:text-ink-foreground">Features</a>
            <a href="#roles" className="hover:text-ink-foreground">Roles</a>
            <a href="#faq" className="hover:text-ink-foreground">FAQ</a>
          </nav>
          <div className="flex gap-2">
            <Button asChild variant="secondary" size="sm"><Link to="/auth">Sign in</Link></Button>
          </div>
        </header>
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

      <footer className="bg-hero text-ink-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-3">
          <div>
            <span className="flex items-center gap-2 font-display text-xl font-semibold"><GraduationCap className="h-6 w-6 text-accent" /> FYPMS</span>
            <p className="mt-3 text-sm text-ink-foreground/70">Final Year Project Management System for the BS Information Technology program.</p>
          </div>
          <div>
            <p className="font-semibold">Navigate</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-foreground/70">
              <li><a href="#how" className="hover:text-ink-foreground">How it works</a></li>
              <li><a href="#features" className="hover:text-ink-foreground">Features</a></li>
              <li><a href="#faq" className="hover:text-ink-foreground">FAQ</a></li>
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
    </div>
  );
}
