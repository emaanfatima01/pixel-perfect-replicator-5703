import type React from "react";
import { cn } from "@/lib/utils";

export function Panel({ title, icon: Icon, children, className = "" }: { title: string; icon?: React.ComponentType<{ className?: string }>; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border bg-card p-5 shadow-soft sm:p-6", className)}>
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold sm:text-lg">{Icon && <Icon className="h-4 w-4 text-primary" />}{title}</h2>
      {children}
    </section>
  );
}

export function Empty({ text }: { text: string }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{text}</p>;
}
