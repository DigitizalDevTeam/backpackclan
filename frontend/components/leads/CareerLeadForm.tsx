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
  careerLeadSchema,
  type CareerLeadData,
} from "@/lib/validations/leads";

export function CareerLeadForm() {
  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CareerLeadData>({
    resolver: zodResolver(careerLeadSchema),
    defaultValues: { name: "", email: "", phone: "", role: "", message: "" },
  });

  async function onSubmit(data: CareerLeadData) {
    setLoading(true);
    try {
      const form = new FormData();
      form.set("type", "career");
      form.set("name", data.name);
      form.set("email", data.email);
      form.set("phone", data.phone);
      form.set("sourceUrl", "/careers/apply");
      form.set("payload[role]", data.role);
      if (data.message) form.set("payload[message]", data.message);
      if (resume) form.set("resume", resume);

      const res = await fetch("/api/leads", { method: "POST", body: form });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.errors?.form || "Could not submit");
      }
      toast.success(result.data?.message || "Application submitted");
      reset();
      setResume(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LeadFormShell
      title="Career application"
      description="Join the Backpackclan crew — guides, ops, and content roles."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Role applying for</Label>
            <Input {...register("role")} placeholder="e.g. Trip leader" />
            {errors.role ? <p className="text-sm text-destructive">{errors.role.message}</p> : null}
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
          <Label>Resume (PDF/DOC, max 5MB)</Label>
          <Input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResume(e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="space-y-2">
          <Label>Cover note</Label>
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
