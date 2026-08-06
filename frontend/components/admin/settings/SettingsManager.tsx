"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, Controller, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { MediaPicker } from "@/components/forms/MediaPicker";
import { RichTextEditor } from "@/components/forms/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
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
        description="Configure branding, email, payments, notifications, and third-party integrations."
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

  const defaultValues = useMemo(() => {
    if (group === "integrations") {
      const integrations = data as SiteSettings["integrations"];
      return {
        whatsappWidget: !!integrations.whatsappWidget,
        tawkToEnabled: !!integrations.tawkToEnabled,
        tawkToId: integrations.tawkToId ?? "",
        gtmId: integrations.gtmId ?? "",
      } as FieldValues;
    }
    if (group !== "payments") return data as FieldValues;
    const payments = data as SiteSettings["payments"];
    return {
      ...payments,
      stripeEnabled: !!payments.stripeEnabled,
      stripeKey: payments.stripeKey ?? "",
      stripeSecret: payments.stripeSecret ?? "",
      stripeWebhookSecret: payments.stripeWebhookSecret ?? "",
      stripeCurrency: payments.stripeCurrency || "inr",
      depositPercent: payments.depositPercent ?? 30,
      razorpayEnabled: !!payments.razorpayEnabled,
      razorpayKeyId: payments.razorpayKeyId ?? "",
      razorpayKeySecret: payments.razorpayKeySecret ?? "",
      razorpayWebhookSecret: payments.razorpayWebhookSecret ?? "",
      razorpayCurrency: payments.razorpayCurrency || "INR",
      cashfreeEnabled: !!payments.cashfreeEnabled,
      cashfreeAppId: payments.cashfreeAppId ?? "",
      cashfreeSecretKey: payments.cashfreeSecretKey ?? "",
      cashfreeWebhookSecret: payments.cashfreeWebhookSecret ?? "",
      cashfreeCurrency: payments.cashfreeCurrency || "INR",
      cashfreeEnv: payments.cashfreeEnv === "production" ? "production" : "sandbox",
    } as FieldValues;
  }, [group, data]);

  const form = useForm<FieldValues>({
    resolver: zodResolver(schemaMap[group]) as never,
    defaultValues,
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isDirty, errors },
  } = form;

  function firstErrorMessage(fieldErrors: typeof errors): string | null {
    for (const err of Object.values(fieldErrors)) {
      if (!err) continue;
      if (typeof err === "object" && "message" in err && err.message) {
        return String(err.message);
      }
    }
    return null;
  }

  useUnsavedChanges(isDirty);

  const primaryColor = watch("primaryColor" as never) as unknown as string | undefined;
  const secondaryColor = watch("secondaryColor" as never) as unknown as string | undefined;
  const stripeEnabled = watch("stripeEnabled" as never) as unknown as boolean | undefined;
  const razorpayEnabled = watch("razorpayEnabled" as never) as unknown as boolean | undefined;
  const cashfreeEnabled = watch("cashfreeEnabled" as never) as unknown as boolean | undefined;
  const whatsappWidget = watch("whatsappWidget" as never) as unknown as boolean | undefined;
  const tawkToEnabled = watch("tawkToEnabled" as never) as unknown as boolean | undefined;

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
    <form
      onSubmit={handleSubmit(onSubmit, (fieldErrors) => {
        toast.error(firstErrorMessage(fieldErrors) ?? "Please fix the highlighted fields");
      })}
      className="space-y-5"
    >
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
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
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
          ) : (
            <>
              <input type="hidden" {...register("stripeCurrency")} />
              <input type="hidden" {...register("depositPercent")} />
              <input type="hidden" {...register("stripeKey")} />
              <input type="hidden" {...register("stripeSecret")} />
              <input type="hidden" {...register("stripeWebhookSecret")} />
            </>
          )}

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
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
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
          ) : (
            <>
              <input type="hidden" {...register("razorpayCurrency")} />
              <input type="hidden" {...register("razorpayKeyId")} />
              <input type="hidden" {...register("razorpayKeySecret")} />
              <input type="hidden" {...register("razorpayWebhookSecret")} />
            </>
          )}

          <label className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Enable Cashfree</p>
              <p className="text-xs text-muted-foreground">Hosted checkout via Cashfree</p>
            </div>
            <Controller
              name="cashfreeEnabled"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
              )}
            />
          </label>

          {/* Keep required Cashfree fields registered even when the gateway is disabled */}
          {!cashfreeEnabled ? (
            <>
              <input type="hidden" {...register("cashfreeCurrency")} />
              <input type="hidden" {...register("cashfreeEnv")} />
              <input type="hidden" {...register("cashfreeAppId")} />
              <input type="hidden" {...register("cashfreeSecretKey")} />
              <input type="hidden" {...register("cashfreeWebhookSecret")} />
            </>
          ) : null}

          {cashfreeEnabled ? (
            <div className="space-y-4 rounded-lg border bg-slate-50 p-4">
              <Field label="App ID" name="cashfreeAppId" register={register} placeholder="TEST… or prod App ID" />
              <div className="space-y-2">
                <Label>Secret key</Label>
                <Input type="password" placeholder={(data as SiteSettings["payments"]).cashfreeSecretKeySet ? "•••••••• (leave blank to keep)" : "Secret key"} {...register("cashfreeSecretKey")} />
              </div>
              <div className="space-y-2">
                <Label>Webhook secret</Label>
                <Input type="password" placeholder={(data as SiteSettings["payments"]).cashfreeWebhookSecretSet ? "•••••••• (leave blank to keep)" : "Optional — defaults to secret key"} {...register("cashfreeWebhookSecret")} />
              </div>
              <Field label="Currency" name="cashfreeCurrency" register={register} placeholder="INR" />
              <div className="space-y-2">
                <Label>Environment</Label>
                <Controller
                  name="cashfreeEnv"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || "sandbox"}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      <option value="sandbox">Sandbox</option>
                      <option value="production">Production</option>
                    </Select>
                  )}
                />
              </div>
            </div>
          ) : null}

          {Object.keys(errors).length > 0 ? (
            <p className="text-sm text-destructive">
              {Object.entries(errors)
                .slice(0, 3)
                .map(([key, err]) => `${key}: ${(err as { message?: string })?.message ?? "invalid"}`)
                .join(" · ")}
            </p>
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
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect analytics and support widgets. Scripts load on the public site and customer
            account pages only — not in the admin panel.
          </p>

          <label className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">WhatsApp floating widget</p>
              <p className="text-xs text-muted-foreground">
                Shows a chat button using the WhatsApp number from Social settings
              </p>
            </div>
            <Controller
              name="whatsappWidget"
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
          {whatsappWidget ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
              Set your WhatsApp number under the <strong>Social</strong> tab if the widget does not
              appear.
            </p>
          ) : null}

          <label className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Tawk.to live chat</p>
              <p className="text-xs text-muted-foreground">
                Embed the Tawk.to widget for real-time visitor support
              </p>
            </div>
            <Controller
              name="tawkToEnabled"
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
          <Field
            label="Tawk.to Property / Widget ID"
            name="tawkToId"
            register={register}
            placeholder="633605c554f06e12d8979f6c/1ge5gd3ld"
            disabled={!tawkToEnabled}
            error={errors.tawkToId?.message as string | undefined}
          />
          <p className="-mt-2 text-xs text-muted-foreground">
            Paste <code className="mx-1 rounded bg-muted px-1">propertyId/widgetId</code>
            or the full embed URL.
          </p>

          <Field
            label="Google Tag Manager container ID"
            name="gtmId"
            register={register}
            placeholder="GTM-XXXXXXX"
            error={errors.gtmId?.message as string | undefined}
          />
          <p className="-mt-2 text-xs text-muted-foreground">
            Leave blank to disable GTM. Configure GA4, Meta Pixel, and other tags inside GTM.
          </p>
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

      {group !== "integrations" ? (
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
      ) : (
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="animate-spin" />
              Saving...
            </>
          ) : (
            "Save integrations"
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
  error,
}: {
  label: string;
  name: string;
  register: ReturnType<typeof useForm>["register"];
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        className={error ? "border-destructive focus-visible:ring-destructive" : undefined}
        {...register(name as never)}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
