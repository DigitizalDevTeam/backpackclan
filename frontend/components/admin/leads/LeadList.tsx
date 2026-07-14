"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Inbox,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { hasPermission } from "@/lib/auth/permissions";
import { formatDateTime } from "@/lib/site/format";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/types/auth";
import type { AdminLead, LeadStatus, LeadType } from "@/types/lead";
import { LEAD_STATUS_LABELS, LEAD_TYPE_LABELS } from "@/types/lead";

const statusStyles: Record<LeadStatus, string> = {
  new: "bg-amber-100 text-amber-800",
  contacted: "bg-blue-100 text-blue-800",
  qualified: "bg-violet-100 text-violet-800",
  converted: "bg-green-100 text-green-800",
  closed: "bg-slate-100 text-slate-600",
};

interface LeadListProps {
  user: AuthUser;
}

export function LeadList({ user }: LeadListProps) {
  const canCreate = hasPermission(user, "leads.create");
  const canUpdate = hasPermission(user, "leads.update");
  const canDelete = hasPermission(user, "leads.delete");

  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<LeadType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [deleteTarget, setDeleteTarget] = useState<AdminLead | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/leads");
      const data = await res.json();
      if (data.success) setLeads(data.data);
      else toast.error("Failed to load leads");
    } catch {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter((l) => {
      const matchesSearch =
        l.name.toLowerCase().includes(q) ||
        (l.email ?? "").toLowerCase().includes(q) ||
        (l.phone ?? "").includes(q);
      const matchesType = typeFilter === "all" || l.type === typeFilter;
      const matchesStatus = statusFilter === "all" || l.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [leads, search, typeFilter, statusFilter]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/leads/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.errors?.form || "Delete failed");
      }
      toast.success("Lead deleted");
      setDeleteTarget(null);
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="Inquiries from contact, callback, corporate, partner, and career forms."
        action={
          canCreate ? (
            <Button asChild>
              <Link href="/admin/leads/new">
                <Plus className="h-4 w-4" />
                Add lead
              </Link>
            </Button>
          ) : null
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search name, email, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as LeadType | "all")}
          className="lg:w-44"
        >
          <option value="all">All types</option>
          {(Object.keys(LEAD_TYPE_LABELS) as LeadType[]).map((t) => (
            <option key={t} value={t}>
              {LEAD_TYPE_LABELS[t]}
            </option>
          ))}
        </Select>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "all")}
          className="lg:w-40"
        >
          <option value="all">All statuses</option>
          {(Object.keys(LEAD_STATUS_LABELS) as LeadStatus[]).map((s) => (
            <option key={s} value={s}>
              {LEAD_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-6 w-6" />}
          title="No leads found"
          description="New form submissions will appear here."
          action={
            canCreate ? (
              <Button asChild>
                <Link href="/admin/leads/new">Add lead</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Lead</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date &amp; time</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <p className="font-medium">{lead.name}</p>
                  </td>
                  <td className="px-4 py-3">{LEAD_TYPE_LABELS[lead.type]}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs">{lead.email ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{lead.phone ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={cn("border-0", statusStyles[lead.status])}>
                      {LEAD_STATUS_LABELS[lead.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDateTime(lead.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/leads/${lead.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      {canDelete ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => setDeleteTarget(lead)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                      {!canUpdate && !canDelete ? null : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete lead?"
        description={
          deleteTarget ? `Delete inquiry from ${deleteTarget.name}?` : ""
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
}
