"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, MapPin, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SiteSettings } from "@/types/settings";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  phone: z.string().min(10, "Valid phone required"),
  destination: z.string().optional(),
  message: z.string().min(10, "Please share a few details about your trip"),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  settings: SiteSettings;
}

export function ContactForm({ settings }: ContactFormProps) {
  const [loading, setLoading] = useState(false);
  const { general, social } = settings;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      destination: "",
      message: "",
    },
  });

  async function onSubmit(_data: ContactFormData) {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    toast.success("Thanks! Our team will reach out within 24 hours.");
    reset();
  }

  return (
    <div className="grid gap-10 lg:grid-cols-5">
      <div className="space-y-6 lg:col-span-2">
        <div>
          <h2 className="text-2xl font-bold">Get in touch</h2>
          <p className="mt-2 text-muted-foreground">
            Tell us about your dream trip. We respond to every inquiry within one business day.
          </p>
        </div>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-medium">Phone</p>
              <a href={`tel:${general.contactPhone}`} className="text-sm text-muted-foreground hover:text-primary">
                {general.contactPhone}
              </a>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-medium">Email</p>
              <a href={`mailto:${general.contactEmail}`} className="text-sm text-muted-foreground hover:text-primary">
                {general.contactEmail}
              </a>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-medium">Office</p>
              <p className="text-sm text-muted-foreground">{general.address}</p>
            </div>
          </li>
        </ul>
        {social.whatsapp ? (
          <Button asChild variant="outline" className="border-green-600 text-green-700 hover:bg-green-50">
            <a
              href={`https://wa.me/${social.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Chat on WhatsApp
            </a>
          </Button>
        ) : null}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm lg:col-span-3"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" {...register("name")} placeholder="Your name" />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} placeholder="you@email.com" />
            {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("phone")} placeholder="+91 98765 43210" />
            {errors.phone ? <p className="text-sm text-destructive">{errors.phone.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="destination">Destination (optional)</Label>
            <Input id="destination" {...register("destination")} placeholder="Ladakh, Spiti, etc." />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Your message</Label>
          <Textarea
            id="message"
            rows={5}
            {...register("message")}
            placeholder="Dates, group size, trip type, budget..."
          />
          {errors.message ? <p className="text-sm text-destructive">{errors.message.message}</p> : null}
        </div>
        <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send inquiry
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
