"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  searchLeadSchema,
  type SearchLeadData,
} from "@/lib/validations/leads";

interface SearchLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchQuery: string;
}

export function SearchLeadModal({
  open,
  onOpenChange,
  searchQuery,
}: SearchLeadModalProps) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SearchLeadData>({
    resolver: zodResolver(searchLeadSchema) as never,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      destination: searchQuery,
      travelers: undefined,
      message: "",
    },
  });

  useEffect(() => {
    if (open && searchQuery.trim()) {
      setValue("destination", searchQuery.trim());
    }
  }, [open, searchQuery, setValue]);

  async function onSubmit(data: SearchLeadData) {
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
          sourceUrl: "/",
          payload: {
            destination: data.destination,
            travelers: data.travelers,
            message:
              data.message?.trim() ||
              `Homepage search interest: ${data.destination}`,
            searchQuery: searchQuery.trim() || data.destination,
            source: "homepage_search",
          },
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.errors?.form || "Could not submit details");
      }
      toast.success(
        result.data?.message || "Thanks! We'll email you trip options shortly."
      );
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Tell us where you want to go
          </DialogTitle>
          <DialogDescription>
            Leave your details and our travel desk will share matching trips by email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search-lead-destination">Looking for</Label>
            <Input
              id="search-lead-destination"
              {...register("destination")}
              placeholder="e.g. Ladakh bike trip"
            />
            {errors.destination ? (
              <p className="text-sm text-destructive">{errors.destination.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="search-lead-name">Full name</Label>
            <Input id="search-lead-name" {...register("name")} autoComplete="name" />
            {errors.name ? (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="search-lead-phone">Phone</Label>
              <Input
                id="search-lead-phone"
                {...register("phone")}
                autoComplete="tel"
                placeholder="10-digit mobile"
              />
              {errors.phone ? (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-lead-email">Email</Label>
              <Input
                id="search-lead-email"
                type="email"
                {...register("email")}
                autoComplete="email"
              />
              {errors.email ? (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search-lead-travelers">Travellers (optional)</Label>
            <Input
              id="search-lead-travelers"
              type="number"
              min={1}
              max={100}
              {...register("travelers")}
              placeholder="e.g. 2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="search-lead-message">Anything else? (optional)</Label>
            <Textarea
              id="search-lead-message"
              rows={3}
              {...register("message")}
              placeholder="Dates, budget, group type…"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#F58220] hover:bg-[#e07418]"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Send className="h-4 w-4" />}
            Get trip options on email
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            We&apos;ll only use this to share relevant departures — no spam.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
