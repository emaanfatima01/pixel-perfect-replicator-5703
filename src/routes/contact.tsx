import { createFileRoute } from "@tanstack/react-router";
import { Building2, Mail, Phone } from "lucide-react";
import { SitePage } from "@/components/SiteLayout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — FYPMS" },
      { name: "description", content: "Contact the FYP coordinator of the Department of Information Technology." },
      { property: "og:title", content: "Contact Us — FYPMS" },
      { property: "og:description", content: "Get in touch with the FYP coordinator." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Contact,
});

const items = [
  { icon: Building2, label: "Department", value: "Department of Information Technology" },
  { icon: Mail, label: "Email", value: "fyp-coordinator@university.edu" },
  { icon: Phone, label: "Phone", value: "+92 000 0000000" },
];

function Contact() {
  return (
    <SitePage eyebrow="Contact us" title="Questions about your FYP?" intro="Reach the FYP coordinator for account access, supervisor assignment or presentation schedules.">
      <section className="mx-auto grid max-w-4xl gap-6 px-6 py-16 md:grid-cols-3">
        {items.map((i) => (
          <div key={i.label} className="rounded-2xl border bg-card p-6 text-center shadow-soft">
            <i.icon className="mx-auto h-6 w-6 text-primary" />
            <p className="mt-3 text-sm font-semibold">{i.label}</p>
            <p className="mt-1 break-words text-sm text-muted-foreground">{i.value}</p>
          </div>
        ))}
      </section>
    </SitePage>
  );
}
