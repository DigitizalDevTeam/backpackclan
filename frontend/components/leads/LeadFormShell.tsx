"use client";

import type { ReactNode } from "react";

interface LeadFormShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function LeadFormShell({ title, description, children }: LeadFormShellProps) {
  return (
    <div className="mx-auto h-[100vh] max-w-xl overflow-y-auto space-y-6 rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}
