"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { hasPermission } from "@/lib/auth/permissions";
import type { AuthUser } from "@/types/auth";
import type { AdminCoupon, CouponType } from "@/types/admin-coupon";

interface CouponFormProps {
  mode: "create" | "edit";
  couponId?: string;
  user: AuthUser;
}

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function CouponForm({ mode, couponId, user }: CouponFormProps) {
  const router = useRouter();
  const canWrite = hasPermission(
    user,
    mode === "create" ? "coupons.create" : "coupons.update"
  );
  const readOnly = !canWrite;

  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [coupon, setCoupon] = useState<AdminCoupon | null>(null);

  const [code, setCode] = useState("");
  const [type, setType] = useState<CouponType>("percent");
  const [value, setValue] = useState(10);
  const [minAmount, setMinAmount] = useState(0);
  const [maxDiscount, setMaxDiscount] = useState<string>("");
  const [usageLimit, setUsageLimit] = useState<string>("");
  const [tripSlug, setTripSlug] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (mode !== "edit" || !couponId) return;

    async function load() {
      try {
        const res = await fetch(`/api/admin/coupons/${couponId}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          toast.error("Coupon not found");
          router.push("/admin/coupons");
          return;
        }
        const c = data.data as AdminCoupon;
        setCoupon(c);
        setCode(c.code);
        setType(c.type);
        setValue(c.value);
        setMinAmount(c.minAmount);
        setMaxDiscount(c.maxDiscount != null ? String(c.maxDiscount) : "");
        setUsageLimit(c.usageLimit != null ? String(c.usageLimit) : "");
        setTripSlug(c.tripSlug ?? "");
        setIsActive(c.isActive);
        setStartsAt(toDatetimeLocal(c.startsAt));
        setEndsAt(toDatetimeLocal(c.endsAt));
        setDescription(c.description ?? "");
      } catch {
        toast.error("Failed to load coupon");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [mode, couponId, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (readOnly) return;
    setSaving(true);
    try {
      const payload = {
        code,
        type,
        value,
        minAmount,
        maxDiscount: maxDiscount === "" ? null : Number(maxDiscount),
        usageLimit: usageLimit === "" ? null : Number(usageLimit),
        tripSlug: tripSlug.trim() || null,
        isActive,
        startsAt: fromDatetimeLocal(startsAt),
        endsAt: fromDatetimeLocal(endsAt),
        description: description.trim() || null,
      };

      const url =
        mode === "create" ? "/api/admin/coupons" : `/api/admin/coupons/${couponId}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.errors?.form || "Save failed");
      }
      toast.success(mode === "create" ? "Coupon created" : "Coupon updated");
      router.push("/admin/coupons");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleResetUsage() {
    if (!couponId || readOnly) return;
    setResetting(true);
    try {
      const res = await fetch(`/api/admin/coupons/${couponId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_usage" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.errors?.form || "Reset failed");
      }
      setCoupon(data.data);
      toast.success("Usage count reset");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Reset failed");
    } finally {
      setResetting(false);
    }
  }

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={mode === "create" ? "Create coupon" : `Edit ${coupon?.code ?? "coupon"}`}
        description={
          mode === "create"
            ? "Add a discount code customers can apply at checkout."
            : "Update discount rules, schedule, and availability."
        }
      />

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-2xl space-y-6 rounded-xl border bg-white p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="WELCOME10"
              required
              disabled={readOnly}
              className="font-mono uppercase"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as CouponType)}
              disabled={readOnly}
            >
              <option value="percent">Percent (%)</option>
              <option value="fixed">Fixed amount (₹)</option>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="value">
              {type === "percent" ? "Percent value" : "Amount (₹)"}
            </Label>
            <Input
              id="value"
              type="number"
              min={1}
              max={type === "percent" ? 100 : undefined}
              value={value}
              onChange={(e) => setValue(Number(e.target.value) || 0)}
              required
              disabled={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minAmount">Min cart (₹)</Label>
            <Input
              id="minAmount"
              type="number"
              min={0}
              value={minAmount}
              onChange={(e) => setMinAmount(Number(e.target.value) || 0)}
              disabled={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxDiscount">Max discount (₹)</Label>
            <Input
              id="maxDiscount"
              type="number"
              min={1}
              value={maxDiscount}
              onChange={(e) => setMaxDiscount(e.target.value)}
              placeholder="Optional"
              disabled={readOnly}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="usageLimit">Usage limit</Label>
            <Input
              id="usageLimit"
              type="number"
              min={1}
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              placeholder="Unlimited"
              disabled={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tripSlug">Trip slug (optional)</Label>
            <Input
              id="tripSlug"
              value={tripSlug}
              onChange={(e) => setTripSlug(e.target.value)}
              placeholder="leh-ladakh-bike-expedition"
              disabled={readOnly}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for all trips
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startsAt">Starts at</Label>
            <Input
              id="startsAt"
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endsAt">Ends at</Label>
            <Input
              id="endsAt"
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              disabled={readOnly}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Shown during checkout validation"
            disabled={readOnly}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={readOnly}
          />
          Active (customers can use this code)
        </label>

        {mode === "edit" && coupon ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-slate-50 px-4 py-3 text-sm">
            <p>
              Used <span className="font-semibold">{coupon.usedCount}</span>
              {coupon.usageLimit != null ? ` / ${coupon.usageLimit}` : ""} times
            </p>
            {canWrite ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={resetting || coupon.usedCount === 0}
                onClick={handleResetUsage}
              >
                {resetting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
                Reset usage
              </Button>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          {!readOnly ? (
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : mode === "create" ? (
                "Create coupon"
              ) : (
                "Save changes"
              )}
            </Button>
          ) : null}
          <Button asChild type="button" variant="outline">
            <Link href="/admin/coupons">Back to list</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
