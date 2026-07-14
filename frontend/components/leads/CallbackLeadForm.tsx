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
import {
  callbackLeadSchema,
  type CallbackLeadData,
} from "@/lib/validations/leads";

export function CallbackLeadForm() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CallbackLeadData>({
    resolver: zodResolver(callbackLeadSchema),
    defaultValues: { name: "", phone: "", email: "", preferredTime: "" },
  });

  async function onSubmit(data: CallbackLeadData) {
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "callback",
          name: data.name,
          phone: data.phone,
          email: data.email || null,
          sourceUrl: "/request-callback",
          payload: { preferredTime: data.preferredTime || undefined },
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.errors?.form || "Could not submit");
      }
      toast.success(result.data?.message || "Callback requested");
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LeadFormShell
      title="Request a callback"
      description="Share your number and preferred time — we'll call you back."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" {...register("name")} />
          {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone")} />
          {errors.phone ? <p className="text-sm text-destructive">{errors.phone.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email (optional)</Label>
          <Input id="email" type="email" {...register("email")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="preferredTime">Preferred time</Label>
          <Input id="preferredTime" {...register("preferredTime")} placeholder="e.g. Weekday evenings" />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <Send className="h-4 w-4" />}
          Request callback
        </Button>
      </form>
    </LeadFormShell>
  );
}
