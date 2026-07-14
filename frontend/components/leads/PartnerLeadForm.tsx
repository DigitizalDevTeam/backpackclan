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
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  partnerLeadSchema,
  type PartnerLeadData,
} from "@/lib/validations/leads";

export function PartnerLeadForm() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PartnerLeadData>({
    resolver: zodResolver(partnerLeadSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      organization: "",
      partnershipType: "reseller",
      message: "",
    },
  });

  async function onSubmit(data: PartnerLeadData) {
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "partner",
          name: data.name,
          email: data.email,
          phone: data.phone,
          sourceUrl: "/partners/register",
          payload: {
            organization: data.organization,
            partnershipType: data.partnershipType,
            message: data.message || undefined,
          },
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.errors?.form || "Could not submit");
      }
      toast.success(result.data?.message || "Partner application sent");
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LeadFormShell
      title="Partner registration"
      description="Work with Backpackclan as a reseller, local operator, or affiliate."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Contact name</Label>
            <Input {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Organization</Label>
            <Input {...register("organization")} />
            {errors.organization ? (
              <p className="text-sm text-destructive">{errors.organization.message}</p>
            ) : null}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" {...register("email")} />
            {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input {...register("phone")} />
            {errors.phone ? <p className="text-sm text-destructive">{errors.phone.message}</p> : null}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Partnership type</Label>
          <Select {...register("partnershipType")}>
            <option value="reseller">Reseller / Travel agent</option>
            <option value="operator">Local operator</option>
            <option value="affiliate">Affiliate / Influencer</option>
            <option value="other">Other</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Message</Label>
          <Textarea rows={4} {...register("message")} />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <Send className="h-4 w-4" />}
          Submit application
        </Button>
      </form>
    </LeadFormShell>
  );
}
