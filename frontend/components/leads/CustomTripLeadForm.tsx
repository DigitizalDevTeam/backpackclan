"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { LeadFormShell } from "@/components/leads/LeadFormShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  customTripLeadSchema,
  type CustomTripLeadData,
} from "@/lib/validations/leads";

export function CustomTripLeadForm() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomTripLeadData>({
    resolver: zodResolver(customTripLeadSchema) as never,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      destination: "",
      travelDates: "",
      budget: "",
      message: "",
    },
  });

  async function onSubmit(data: CustomTripLeadData) {
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "custom_trip",
          name: data.name,
          email: data.email,
          phone: data.phone,
          sourceUrl: "/inquire/custom-trip",
          payload: {
            destination: data.destination,
            travelers: data.travelers,
            travelDates: data.travelDates || undefined,
            budget: data.budget || undefined,
            message: data.message || undefined,
          },
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.errors?.form || "Could not submit");
      }
      toast.success(result.data?.message || "Custom trip inquiry sent");
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LeadFormShell
      title="Custom trip inquiry"
      description="Tell us where you want to go — we'll design a private itinerary."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" {...register("email")} />
            {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input {...register("phone")} />
            {errors.phone ? <p className="text-sm text-destructive">{errors.phone.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Travelers</Label>
            <Input type="number" min={1} {...register("travelers")} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Destination</Label>
          <Input {...register("destination")} />
          {errors.destination ? (
            <p className="text-sm text-destructive">{errors.destination.message}</p>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Travel dates</Label>
            <Input {...register("travelDates")} placeholder="e.g. Sep 2026" />
          </div>
          <div className="space-y-2">
            <Label>Budget</Label>
            <Input {...register("budget")} placeholder="e.g. ₹40,000 / person" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea rows={4} {...register("message")} />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <Send className="h-4 w-4" />}
          Submit inquiry
        </Button>
      </form>
    </LeadFormShell>
  );
}
