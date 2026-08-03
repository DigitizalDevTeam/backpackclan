"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { PriceInput } from "@/components/forms/travel/PriceInput";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { hasPermission } from "@/lib/auth/permissions";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import {
  tripPricingUpdateSchema,
  type TripPricingUpdateValues,
} from "@/lib/validations/pricing";
import type { AdminTrip } from "@/types/admin-trip";
import type { AuthUser } from "@/types/auth";

interface PricingTripFormProps {
  tripId: string;
  user: AuthUser;
}

export function PricingTripForm({ tripId, user }: PricingTripFormProps) {
  const router = useRouter();
  const canUpdate = hasPermission(user, "pricing.update");
  const readOnly = !canUpdate;

  const [trip, setTrip] = useState<AdminTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isDirty },
  } = useForm<TripPricingUpdateValues>({
    resolver: zodResolver(tripPricingUpdateSchema) as Resolver<TripPricingUpdateValues>,
    defaultValues: { pricing: { basePrice: 0, showStrikeThrough: false, currency: "INR", pricePer: "person" } },
  });

  const pricing = watch("pricing");

  useUnsavedChanges(isDirty && !readOnly);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/trips/${tripId}`);
        const result = await res.json();
        if (!result.success) {
          toast.error("Trip not found");
          router.push("/admin/pricing");
          return;
        }
        setTrip(result.data);
        reset({ pricing: result.data.pricing });
      } catch {
        toast.error("Failed to load trip");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tripId, reset, router]);

  async function onSubmit(data: TripPricingUpdateValues) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/pricing/trips/${tripId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.errors?.form ?? "Failed to save pricing");
        return;
      }
      toast.success("Pricing updated");
      router.push("/admin/pricing");
    } catch {
      toast.error("Failed to save pricing");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSkeleton variant="form" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={trip ? `Pricing — ${trip.title}` : "Trip pricing"}
        description="Set base price, sale offers, and strike-through display rules."
        action={
          <div className="flex gap-2">
            {trip?.status === "published" && (
              <Button variant="outline" asChild>
                <Link href={`/preview/trips/${trip.slug}`} target="_blank">
                  <ExternalLink className="h-4 w-4" />
                  Preview
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/admin/pricing">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pricePer">Price per</Label>
              <Select
                id="pricePer"
                value={pricing.pricePer}
                onChange={(e) =>
                  setValue(
                    "pricing",
                    {
                      ...pricing,
                      pricePer: e.target.value as TripPricingUpdateValues["pricing"]["pricePer"],
                    },
                    { shouldDirty: true }
                  )
                }
                disabled={readOnly}
              >
                <option value="person">Per person</option>
                <option value="bike">Per bike</option>
                <option value="couple">Per couple</option>
              </Select>
            </div>

            <PriceInput
              pricing={pricing}
              onChange={(p) => setValue("pricing", p, { shouldDirty: true })}
              disabled={readOnly}
              tripType={trip?.tripType}
            />
          </CardContent>
        </Card>

        {canUpdate && (
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Save pricing
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/pricing">Cancel</Link>
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
