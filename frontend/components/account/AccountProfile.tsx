"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, Phone, User } from "lucide-react";
import type { AuthUser } from "@/types/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AccountProfile() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUser(data.data.user ?? data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <p className="text-muted-foreground">Unable to load profile.</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="mt-1 text-muted-foreground">Your account details and contact information.</p>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center gap-4 border-b pb-6">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-teal-100 text-lg text-primary">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.roleName ?? "Customer"}</p>
          </div>
        </div>

        <dl className="mt-6 space-y-5">
          <div className="flex items-start gap-3">
            <User className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Full name
              </dt>
              <dd className="mt-0.5 font-medium">{user.name}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Email
              </dt>
              <dd className="mt-0.5 font-medium">{user.email}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Phone
              </dt>
              <dd className="mt-0.5 font-medium">{user.phone ?? "—"}</dd>
            </div>
          </div>
        </dl>
      </div>
    </div>
  );
}
