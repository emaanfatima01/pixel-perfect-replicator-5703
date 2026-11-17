import type React from "react";

export function Panel({ title, icon: Icon, children, className = "" }: { title: string; icon?: React.ComponentType<{ className?: string }>; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border bg-card p-6 shadow-soft ${className}`}>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">{Icon && <Icon className="h-4 w-4 text-primary" />}{title}</h2>
      {children}
    </section>
  );
}

export function Empty({ text }: { text: string }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{text}</p>;
}
