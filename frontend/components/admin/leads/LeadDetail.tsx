"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { hasPermission } from "@/lib/auth/permissions";
import { formatDateTime } from "@/lib/site/format";
import type { AuthUser } from "@/types/auth";
import type { AdminLead, LeadStatus } from "@/types/lead";
import { LEAD_STATUS_LABELS, LEAD_TYPE_LABELS } from "@/types/lead";

interface LeadDetailProps {
  leadId: string;
  user: AuthUser;
}

export function LeadDetail({ leadId, user }: LeadDetailProps) {
  const router = useRouter();
  const canUpdate = hasPermission(user, "leads.update");
  const [lead, setLead] = useState<AdminLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<LeadStatus>("new");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/leads/${leadId}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          toast.error("Lead not found");
          router.push("/admin/leads");
          return;
        }
        setLead(data.data);
        setStatus(data.data.status);
        setAdminNotes(data.data.adminNotes ?? "");
      } catch {
        toast.error("Failed to load lead");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [leadId, router]);

  async function handleSave() {
    if (!canUpdate) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.errors?.form || "Save failed");
      }
      setLead(data.data);
      toast.success("Lead updated");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function downloadResume() {
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/resume`);
      if (!res.ok) throw new Error("Resume not found");
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] ?? "resume.pdf";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Resume download failed");
    }
  }

  if (loading) return <LoadingSkeleton />;
  if (!lead) return null;

  const payloadEntries = Object.entries(lead.payload ?? {}).filter(
    ([key]) => key !== "resumePath"
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={lead.name}
        description={`${LEAD_TYPE_LABELS[lead.type]} · ${formatDateTime(lead.createdAt)}`}
        action={
          <Button asChild variant="outline">
            <Link href="/admin/leads">Back to list</Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6 rounded-xl border bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{lead.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium">{lead.phone ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Source</p>
              <p className="font-medium">{lead.sourceUrl ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Type</p>
              <Badge variant="secondary">{LEAD_TYPE_LABELS[lead.type]}</Badge>
            </div>
          </div>

          {payloadEntries.length > 0 ? (
            <div>
              <p className="mb-2 text-sm font-semibold">Details</p>
              <dl className="space-y-2 rounded-lg border bg-slate-50 p-4 text-sm">
                {payloadEntries.map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4">
                    <dt className="capitalize text-muted-foreground">
                      {key.replace(/([A-Z])/g, " $1")}
                    </dt>
                    <dd className="text-right font-medium">
                      {typeof value === "string" || typeof value === "number"
                        ? String(value)
                        : JSON.stringify(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          {lead.payload?.resumeName || lead.payload?.resumePath ? (
            <Button type="button" variant="outline" onClick={downloadResume}>
              <Download className="h-4 w-4" />
              Download resume
            </Button>
          ) : null}

          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                disabled={!canUpdate}
              >
                {(Object.keys(LEAD_STATUS_LABELS) as LeadStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {LEAD_STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Admin notes</Label>
              <Textarea
                rows={4}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                disabled={!canUpdate}
                placeholder="Internal notes…"
              />
            </div>
            {canUpdate ? (
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save changes
              </Button>
            ) : null}
          </div>
        </div>

        <aside className="rounded-xl border bg-white p-5 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Status
          </p>
          <p className="mt-2 text-lg font-semibold">
            {LEAD_STATUS_LABELS[lead.status]}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Created {formatDateTime(lead.createdAt)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Updated {formatDateTime(lead.updatedAt)}
          </p>
        </aside>
      </div>
    </div>
  );
}
