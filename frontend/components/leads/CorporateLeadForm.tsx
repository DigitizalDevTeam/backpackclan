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
  corporateLeadSchema,
  type CorporateLeadData,
} from "@/lib/validations/leads";

export function CorporateLeadForm() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CorporateLeadData>({
    resolver: zodResolver(corporateLeadSchema) as never,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      requirements: "",
    },
  });

  async function onSubmit(data: CorporateLeadData) {
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "corporate",
          name: data.name,
          email: data.email,
          phone: data.phone,
          sourceUrl: "/inquire/corporate",
          payload: {
            company: data.company,
            groupSize: data.groupSize,
            requirements: data.requirements || undefined,
          },
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.errors?.form || "Could not submit");
      }
      toast.success(result.data?.message || "Corporate inquiry sent");
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LeadFormShell
      title="Corporate & group inquiry"
      description="Offsites, incentives, and team expeditions with dedicated planning."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Contact name</Label>
            <Input {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Company</Label>
            <Input {...register("company")} />
            {errors.company ? (
              <p className="text-sm text-destructive">{errors.company.message}</p>
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
          <Label>Group size</Label>
          <Input type="number" min={1} {...register("groupSize")} />
        </div>
        <div className="space-y-2">
          <Label>Requirements</Label>
          <Textarea rows={4} {...register("requirements")} />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <Send className="h-4 w-4" />}
          Submit inquiry
        </Button>
      </form>
    </LeadFormShell>
  );
}
