"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm, Controller, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { MediaPicker } from "@/components/forms/MediaPicker";
import { RichTextEditor } from "@/components/forms/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  brandingSettingsSchema,
  footerSettingsSchema,
  generalSettingsSchema,
  integrationSettingsSchema,
  mailSettingsSchema,
  maintenanceSettingsSchema,
  notificationSettingsSchema,
  paymentSettingsSchema,
  socialSettingsSchema,
} from "@/lib/validations/settings";
import {
  SETTINGS_TABS,
  type SettingsGroup,
  type SiteSettings,
} from "@/types/settings";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";

const schemaMap = {
  general: generalSettingsSchema,
  social: socialSettingsSchema,
  branding: brandingSettingsSchema,
  footer: footerSettingsSchema,
  integrations: integrationSettingsSchema,
  maintenance: maintenanceSettingsSchema,
  mail: mailSettingsSchema,
  payments: paymentSettingsSchema,
  notifications: notificationSettingsSchema,
};

export function SettingsManager() {
  const [activeTab, setActiveTab] = useState<SettingsGroup>("general");
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const result = await res.json();
      if (result.success) setSettings(result.data);
      else toast.error("Failed to load settings");
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  async function handleSave(group: SettingsGroup, data: unknown) {
    const res = await fetch(`/api/admin/settings/${group}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();

    if (!res.ok || !result.success) {
      const errMsg =
        result.errors?.form ||
        Object.values(result.errors ?? {})[0] ||
        "Failed to save settings";
      toast.error(String(errMsg));
      return;
    }

    setSettings(result.data);
    toast.success("Settings saved successfully");

    if (group === "maintenance") {
      if ((data as SiteSettings["maintenance"]).enabled) {
        toast.warning(
          "Maintenance mode is now ON — visitors will see the maintenance page"
        );
      }
      window.dispatchEvent(new Event("maintenance-updated"));
    }
  }

  if (loading || !settings) return <LoadingSkeleton variant="form" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Global Settings"
        description="Configure branding, email (SMTP), Stripe, Razorpay, and notification preferences."
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="flex lg:w-48 shrink-0 flex-row lg:flex-col gap-1 overflow-x-auto">
          {SETTINGS_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <Card className="flex-1">
          <CardContent className="pt-6">
            <SettingsTabForm
              key={activeTab}
              group={activeTab}
              data={settings[activeTab]}
              onSave={handleSave}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SettingsTabForm({
  group,
  data,
  onSave,
}: {
  group: SettingsGroup;
  data: SiteSettings[SettingsGroup];
  onSave: (group: SettingsGroup, data: unknown) => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FieldValues>({
    resolver: zodResolver(schemaMap[group]) as never,
    defaultValues: data as FieldValues,
  });

  const { register, handleSubmit, control, watch, formState: { isDirty } } = form;

  useUnsavedChanges(isDirty);

  const primaryColor = watch("primaryColor" as never) as unknown as string | undefined;
  const secondaryColor = watch("secondaryColor" as never) as unknown as string | undefined;
  const stripeEnabled = watch("stripeEnabled" as never) as unknown as boolean | undefined;
  const razorpayEnabled = watch("razorpayEnabled" as never) as unknown as boolean | undefined;

  async function onSubmit(formData: unknown) {
    setSubmitting(true);
    try {
      await onSave(group, formData);
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {group === "general" && (
        <>
          <Field label="Site name" name="siteName" register={register} />
          <Field label="Tagline" name="tagline" register={register} />
          <div className="space-y-2">
            <Label>Logo</Label>
            <Controller
              name="logoId"
              control={control}
              render={({ field }) => (
                <MediaPicker
                  value={field.value}
                  onChange={(m) => field.onChange(m?.id ?? null)}
                  accept="image"
                  label="Select logo"
                />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label>Favicon</Label>
            <Controller
              name="faviconId"
              control={control}
              render={({ field }) => (
                <MediaPicker
                  value={field.value}
                  onChange={(m) => field.onChange(m?.id ?? null)}
                  accept="image"
                  label="Select favicon"
                />
              )}
            />
          </div>
          <Field label="Contact email" name="contactEmail" type="email" register={register} />
          <Field label="Contact phone" name="contactPhone" register={register} />
          <Field label="Address" name="address" register={register} />
        </>
      )}

      {group === "social" && (
        <>
          <Field label="Facebook URL" name="facebook" register={register} />
          <Field label="Instagram URL" name="instagram" register={register} />
          <Field label="YouTube URL" name="youtube" register={register} />
          <Field
            label="WhatsApp number"
            name="whatsapp"
            register={register}
            placeholder="+919876543210"
          />
          <Field label="LinkedIn URL" name="linkedin" register={register} />
        </>
      )}

      {group === "branding" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Primary color</Label>
              <div className="flex gap-2">
                <Input type="color" {...register("primaryColor")} className="h-10 w-14 p-1" />
                <Input {...register("primaryColor")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Secondary color</Label>
              <div className="flex gap-2">
                <Input type="color" {...register("secondaryColor")} className="h-10 w-14 p-1" />
                <Input {...register("secondaryColor")} />
              </div>
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <p className="mb-3 text-sm font-medium">Preview</p>
            <div className="flex gap-3">
              <div
                className="h-12 flex-1 rounded-lg"
                style={{ backgroundColor: primaryColor ?? "#F58220" }}
              />
              <div
                className="h-12 flex-1 rounded-lg"
                style={{ backgroundColor: secondaryColor ?? "#f97316" }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Font preset</Label>
            <Controller
              name="fontPreset"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onChange={field.onChange}>
                  <option value="default">Default (Geist)</option>
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                </Select>
              )}
            />
          </div>
        </>
      )}

      {group === "footer" && (
        <>
          <Field label="Copyright text" name="copyright" register={register} />
          <div className="space-y-2">
            <Label>Footer description</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          <label className="flex items-center gap-3">
            <Controller
              name="showPaymentIcons"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 accent-primary"
                />
              )}
            />
            <span className="text-sm">Show payment icons in footer</span>
          </label>
        </>
      )}

      {group === "mail" && (
        <>
          <p className="text-sm text-muted-foreground">
            SMTP credentials used for booking, payment, and lead emails. Leave password blank to keep the current value.
          </p>
          <div className="space-y-2">
            <Label>Mailer</Label>
            <Controller
              name="mailer"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onChange={field.onChange}>
                  <option value="smtp">SMTP</option>
                  <option value="log">Log (dev)</option>
                  <option value="sendmail">Sendmail</option>
                  <option value="array">Array (testing)</option>
                </Select>
              )}
            />
          </div>
          <Field label="SMTP host" name="host" register={register} placeholder="smtp.gmail.com" />
          <Field label="Port" name="port" type="number" register={register} />
          <div className="space-y-2">
            <Label>Encryption</Label>
            <Controller
              name="encryption"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onChange={field.onChange}>
                  <option value="tls">TLS</option>
                  <option value="ssl">SSL</option>
                  <option value="null">None</option>
                </Select>
              )}
            />
          </div>
          <Field label="Username" name="username" register={register} />
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" placeholder={(data as SiteSettings["mail"]).passwordSet ? "•••••••• (leave blank to keep)" : "SMTP password"} {...register("password")} />
          </div>
          <Field label="From address" name="fromAddress" type="email" register={register} />
          <Field label="From name" name="fromName" register={register} />
        </>
      )}

      {group === "payments" && (
        <>
          <p className="text-sm text-muted-foreground">
            Enable gateways and paste keys here. Leave secret fields blank to keep existing values.
          </p>

          <label className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Enable Stripe</p>
              <p className="text-xs text-muted-foreground">Card payments via Stripe</p>
            </div>
            <Controller
              name="stripeEnabled"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 accent-primary"
                />
              )}
            />
          </label>

          {stripeEnabled ? (
            <div className="space-y-4 rounded-lg border bg-slate-50 p-4">
              <Field label="Publishable key" name="stripeKey" register={register} placeholder="pk_live_…" />
              <div className="space-y-2">
                <Label>Secret key</Label>
                <Input type="password" placeholder={(data as SiteSettings["payments"]).stripeSecretSet ? "•••••••• (leave blank to keep)" : "sk_live_…"} {...register("stripeSecret")} />
              </div>
              <div className="space-y-2">
                <Label>Webhook secret</Label>
                <Input type="password" placeholder={(data as SiteSettings["payments"]).stripeWebhookSecretSet ? "•••••••• (leave blank to keep)" : "whsec_…"} {...register("stripeWebhookSecret")} />
              </div>
              <Field label="Currency" name="stripeCurrency" register={register} placeholder="inr" />
              <Field label="Deposit percent" name="depositPercent" type="number" register={register} />
            </div>
          ) : null}

          <label className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Enable Razorpay</p>
              <p className="text-xs text-muted-foreground">UPI / cards via Razorpay</p>
            </div>
            <Controller
              name="razorpayEnabled"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 accent-primary"
                />
              )}
            />
          </label>

          {razorpayEnabled ? (
            <div className="space-y-4 rounded-lg border bg-slate-50 p-4">
              <Field label="Key ID" name="razorpayKeyId" register={register} placeholder="rzp_live_…" />
              <div className="space-y-2">
                <Label>Key secret</Label>
                <Input type="password" placeholder={(data as SiteSettings["payments"]).razorpayKeySecretSet ? "•••••••• (leave blank to keep)" : "Secret"} {...register("razorpayKeySecret")} />
              </div>
              <div className="space-y-2">
                <Label>Webhook secret</Label>
                <Input type="password" placeholder={(data as SiteSettings["payments"]).razorpayWebhookSecretSet ? "•••••••• (leave blank to keep)" : "Webhook secret"} {...register("razorpayWebhookSecret")} />
              </div>
              <Field label="Currency" name="razorpayCurrency" register={register} placeholder="INR" />
            </div>
          ) : null}
        </>
      )}

      {group === "notifications" && (
        <>
          <p className="text-sm text-muted-foreground">
            Control which emails customers and ops receive.
          </p>
          {(
            [
              {
                name: "bookingCreated" as const,
                label: "Booking created email",
                hint: "Sent to customer when a booking is placed",
              },
              {
                name: "paymentReceived" as const,
                label: "Payment received email",
                hint: "Sent after a successful payment",
              },
              {
                name: "attachInvoice" as const,
                label: "Attach invoice PDF",
                hint: "Include the invoice PDF on payment emails",
              },
              {
                name: "leadConfirmation" as const,
                label: "Lead confirmation email",
                hint: "Confirmation sent to the person who submitted a form",
              },
              {
                name: "leadOpsNotify" as const,
                label: "Lead ops notification",
                hint: "Notify the contact email when a new lead arrives",
              },
            ] as const
          ).map(({ name, label, hint }) => (
            <label
              key={name}
              className="flex items-center justify-between gap-4 rounded-lg border p-4"
            >
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{hint}</p>
              </div>
              <Controller
                name={name}
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 accent-primary"
                  />
                )}
              />
            </label>
          ))}
        </>
      )}

      {group === "integrations" && (
        <div className="space-y-4 opacity-75">
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Integrations will be available in Milestone 4
          </div>
          {[
            { name: "whatsappWidget" as const, label: "WhatsApp widget" },
            { name: "tawkToEnabled" as const, label: "Tawk.to live chat" },
          ].map(({ name, label }) => (
            <label
              key={name}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <span className="text-sm font-medium">{label}</span>
              <div className="flex items-center gap-2">
                <Badge variant="warning">M4</Badge>
                <Controller
                  name={name}
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={field.value}
                      disabled
                      className="h-4 w-4"
                    />
                  )}
                />
              </div>
            </label>
          ))}
          <Field label="Tawk.to Property ID" name="tawkToId" register={register} disabled />
          <Field label="Google Tag Manager ID" name="gtmId" register={register} disabled />
        </div>
      )}

      {group === "maintenance" && (
        <>
          <label className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <Controller
              name="enabled"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 accent-primary"
                />
              )}
            />
            <div>
              <p className="text-sm font-medium text-amber-900">Enable maintenance mode</p>
              <p className="text-xs text-amber-700">
                Visitors will see the maintenance message instead of the site
              </p>
            </div>
          </label>
          <div className="space-y-2">
            <Label>Maintenance message</Label>
            <Controller
              name="message"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </>
      )}

      {group !== "integrations" && (
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      )}
    </form>
  );
}

function Field({
  label,
  name,
  register,
  type = "text",
  placeholder,
  disabled = false,
}: {
  label: string;
  name: string;
  register: ReturnType<typeof useForm>["register"];
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        {...register(name as never)}
      />
    </div>
  );
}
