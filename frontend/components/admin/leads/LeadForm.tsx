"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { hasPermission } from "@/lib/auth/permissions";
import type { AuthUser } from "@/types/auth";
import type { LeadStatus, LeadType } from "@/types/lead";
import { LEAD_STATUS_LABELS, LEAD_TYPE_LABELS } from "@/types/lead";

interface LeadFormProps {
  user: AuthUser;
}

export function LeadForm({ user }: LeadFormProps) {
  const router = useRouter();
  const canCreate = hasPermission(user, "leads.create");
  const [saving, setSaving] = useState(false);

  const [type, setType] = useState<LeadType>("contact");
  const [status, setStatus] = useState<LeadStatus>("new");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sourceUrl, setSourceUrl] = useState("admin");
  const [adminNotes, setAdminNotes] = useState("");
  const [message, setMessage] = useState("");
  const [extraField, setExtraField] = useState("");

  if (!canCreate) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center text-sm text-muted-foreground">
        You do not have permission to create leads.
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    const payload: Record<string, unknown> = {};
    if (message.trim()) payload.message = message.trim();

    if (type === "callback" && extraField.trim()) {
      payload.preferredTime = extraField.trim();
    } else if (type === "custom_trip" && extraField.trim()) {
      payload.destination = extraField.trim();
    } else if (type === "corporate" && extraField.trim()) {
      payload.company = extraField.trim();
    } else if (type === "partner") {
      if (extraField.trim()) payload.organization = extraField.trim();
      payload.partnershipType = "general";
    } else if (type === "career" && extraField.trim()) {
      payload.role = extraField.trim();
    } else if ((type === "contact" || type === "general") && extraField.trim()) {
      payload.destination = extraField.trim();
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          status,
          name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          sourceUrl: sourceUrl.trim() || "admin",
          adminNotes: adminNotes.trim() || null,
          payload,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.errors?.form || "Could not create lead");
      }
      toast.success("Lead created");
      router.push(`/admin/leads/${data.data.id}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Create failed");
    } finally {
      setSaving(false);
    }
  }

  const extraLabel =
    type === "callback"
      ? "Preferred time"
      : type === "custom_trip"
        ? "Destination"
        : type === "corporate"
          ? "Company"
          : type === "partner"
            ? "Organization"
            : type === "career"
              ? "Role"
              : "Destination / topic";

  return (
    <div className="space-y-6">
      <PageHeader
        title="New lead"
        description="Manually add an inquiry captured over phone, WhatsApp, or walk-in."
        action={
          <Button asChild variant="outline">
            <Link href="/admin/leads">Back to list</Link>
          </Button>
        }
      />

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl space-y-5 rounded-xl border bg-white p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as LeadType)}
            >
              {(Object.keys(LEAD_TYPE_LABELS) as LeadType[]).map((t) => (
                <option key={t} value={t}>
                  {LEAD_TYPE_LABELS[t]}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatus)}
            >
              {(Object.keys(LEAD_STATUS_LABELS) as LeadStatus[]).map((s) => (
                <option key={s} value={s}>
                  {LEAD_STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{extraLabel}</Label>
          <Input value={extraField} onChange={(e) => setExtraField(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Message / notes from customer</Label>
          <Textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Source</Label>
          <Input
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="admin / phone / walk-in"
          />
        </div>

        <div className="space-y-2">
          <Label>Admin notes</Label>
          <Textarea
            rows={3}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Internal notes…"
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Create lead
          </Button>
          <Button asChild type="button" variant="outline">
            <Link href="/admin/leads">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
