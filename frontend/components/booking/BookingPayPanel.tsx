"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { StripePaymentForm } from "@/components/booking/StripePaymentForm";
import { RazorpayPaymentButton } from "@/components/booking/RazorpayPaymentButton";
import { CashfreePaymentButton } from "@/components/booking/CashfreePaymentButton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatInr } from "@/lib/site/format";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types/booking";
import type {
  PaymentIntentResponse,
  PaymentMode,
  PaymentOptions,
  PaymentProvider,
} from "@/types/payment";

interface BookingPayPanelProps {
  booking: Booking;
  returnUrl: string;
  successHref: string;
  heading?: string;
  onBookingUpdated?: (booking: Booking) => void;
}

const PROVIDER_HINTS: Record<PaymentProvider, string> = {
  stripe: "Cards & wallets via Stripe",
  razorpay: "UPI, cards & more via Razorpay",
  cashfree: "UPI, cards & more via Cashfree",
};

export function BookingPayPanel({
  booking: initialBooking,
  returnUrl,
  successHref,
  heading = "Complete payment",
  onBookingUpdated,
}: BookingPayPanelProps) {
  const router = useRouter();
  const [booking, setBooking] = useState(initialBooking);
  const [options, setOptions] = useState<PaymentOptions | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [mode, setMode] = useState<PaymentMode>("full");
  const [provider, setProvider] = useState<PaymentProvider>("stripe");
  const [intent, setIntent] = useState<PaymentIntentResponse | null>(null);
  const [starting, setStarting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const loadOptions = useCallback(async () => {
    setLoadingOptions(true);
    try {
      const res = await fetch(`/api/customer/bookings/${booking.id}/payment-options`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.errors?.form || "Failed to load payment options");
      }
      const opts = data.data as PaymentOptions;
      setOptions(opts);
      setMode(opts.canDeposit ? "deposit" : "balance");
      const providers = opts.providers?.length
        ? opts.providers
        : [
            ...(opts.stripeConfigured ? (["stripe"] as const) : []),
            ...(opts.razorpayConfigured ? (["razorpay"] as const) : []),
            ...(opts.cashfreeConfigured ? (["cashfree"] as const) : []),
          ];
      if (providers.includes("stripe")) setProvider("stripe");
      else if (providers.includes("razorpay")) setProvider("razorpay");
      else if (providers.includes("cashfree")) setProvider("cashfree");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load payment options");
    } finally {
      setLoadingOptions(false);
    }
  }, [booking.id]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  useEffect(() => {
    setBooking(initialBooking);
  }, [initialBooking]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentIntentId = params.get("payment_intent");
    const status = params.get("redirect_status");
    const cashfreeOrderId = params.get("cashfree_order_id");

    if (cashfreeOrderId) {
      void (async () => {
        setConfirming(true);
        try {
          const res = await fetch(`/api/customer/bookings/${booking.id}/payments/confirm`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              provider: "cashfree",
              orderId: cashfreeOrderId,
              cashfree_order_id: cashfreeOrderId,
            }),
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.errors?.form || "Could not confirm payment");
          }
          setBooking(data.data.booking);
          onBookingUpdated?.(data.data.booking);
          toast.success("Payment successful");
          router.replace(successHref);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Payment confirmation failed");
        } finally {
          setConfirming(false);
        }
      })();
      return;
    }

    if (!paymentIntentId || status !== "succeeded") return;

    void (async () => {
      setConfirming(true);
      try {
        const res = await fetch(`/api/customer/bookings/${booking.id}/payments/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider: "stripe", paymentIntentId }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.errors?.form || "Could not confirm payment");
        }
        setBooking(data.data.booking);
        onBookingUpdated?.(data.data.booking);
        toast.success("Payment successful");
        router.replace(successHref);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Payment confirmation failed");
      } finally {
        setConfirming(false);
      }
    })();
  }, [booking.id, onBookingUpdated, router, successHref]);

  const payableAmount = useMemo(() => {
    if (!options) return 0;
    if (mode === "deposit") return options.depositAmount;
    return options.balanceDue;
  }, [mode, options]);

  const availableProviders = useMemo((): PaymentProvider[] => {
    if (!options) return [];
    if (options.providers?.length) return options.providers;
    const list: PaymentProvider[] = [];
    if (options.stripeConfigured) list.push("stripe");
    if (options.razorpayConfigured) list.push("razorpay");
    if (options.cashfreeConfigured) list.push("cashfree");
    return list;
  }, [options]);

  const anyGatewayConfigured = availableProviders.length > 0;

  async function startPayment() {
    setStarting(true);
    setIntent(null);
    try {
      const res = await fetch(`/api/customer/bookings/${booking.id}/payments/intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, provider }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.errors?.form || "Could not start payment");
      }
      setIntent(data.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start payment");
    } finally {
      setStarting(false);
    }
  }

  async function startMockPayment() {
    setStarting(true);
    try {
      const res = await fetch(`/api/customer/bookings/${booking.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: payableAmount }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.errors?.form || "Payment failed");
      }
      setBooking(data.data);
      onBookingUpdated?.(data.data);
      toast.success("Demo payment recorded");
      router.push(successHref);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setStarting(false);
    }
  }

  async function handleStripePaid(paymentIntentId: string) {
    setConfirming(true);
    try {
      const res = await fetch(`/api/customer/bookings/${booking.id}/payments/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "stripe", paymentIntentId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.errors?.form || "Could not confirm payment");
      }
      setBooking(data.data.booking);
      onBookingUpdated?.(data.data.booking);
      toast.success("Payment successful");
      router.push(successHref);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Payment confirmation failed");
    } finally {
      setConfirming(false);
    }
  }

  async function handleRazorpayPaid(payload: {
    orderId: string;
    paymentId: string;
    signature: string;
  }) {
    setConfirming(true);
    try {
      const res = await fetch(`/api/customer/bookings/${booking.id}/payments/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "razorpay",
          orderId: payload.orderId,
          paymentId: payload.paymentId,
          signature: payload.signature,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.errors?.form || "Could not confirm payment");
      }
      setBooking(data.data.booking);
      onBookingUpdated?.(data.data.booking);
      toast.success("Payment successful");
      router.push(successHref);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Payment confirmation failed");
    } finally {
      setConfirming(false);
    }
  }

  async function handleMockPay() {
    if (!intent?.payment) return;
    setConfirming(true);
    try {
      const res = await fetch(`/api/customer/bookings/${booking.id}/payments/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mock: true,
          mockAmount: intent.payment.amount,
          paymentIntentId: intent.payment.stripePaymentIntentId,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.errors?.form || "Mock payment failed");
      }
      setBooking(data.data.booking);
      onBookingUpdated?.(data.data.booking);
      toast.success("Mock payment recorded");
      router.push(successHref);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setConfirming(false);
    }
  }

  if (booking.balanceDue <= 0) {
    return (
      <div className="rounded-2xl border bg-emerald-50 p-6 text-center text-sm text-emerald-800">
        This booking is fully paid.
      </div>
    );
  }

  if (loadingOptions || confirming) {
    return (
      <div className="flex items-center justify-center rounded-2xl border bg-white py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!options) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-center text-sm text-muted-foreground">
        Unable to load payment options.
      </div>
    );
  }

  const publishableKey =
    intent?.publishableKey ||
    options.publishableKey ||
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    "";

  const intentProvider = intent?.provider || provider;
  const cashfreeMode =
    intent?.mode === "production" || options.cashfreeMode === "production"
      ? "production"
      : "sandbox";

  return (
    <div className="space-y-6 rounded-2xl border bg-white p-5 sm:p-6">
      <div>
        <h2 className="text-xl font-bold">{heading}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {booking.bookingRef} · Balance {formatInr(booking.balanceDue)}
        </p>
      </div>

      {!intent ? (
        <>
          <div className="space-y-3">
            <Label>Payment amount</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {options.canDeposit ? (
                <button
                  type="button"
                  onClick={() => setMode("deposit")}
                  className={cn(
                    "rounded-xl border p-4 text-left transition",
                    mode === "deposit"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "hover:border-slate-300"
                  )}
                >
                  <p className="text-sm font-semibold">
                    Pay deposit ({options.depositPercent}%)
                  </p>
                  <p className="mt-1 text-lg font-bold">
                    {formatInr(options.depositAmount)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Remaining {formatInr(options.balanceDue - options.depositAmount)} later
                  </p>
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setMode(options.canDeposit ? "full" : "balance")}
                className={cn(
                  "rounded-xl border p-4 text-left transition",
                  mode === "full" || mode === "balance"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "hover:border-slate-300"
                )}
              >
                <p className="text-sm font-semibold">
                  {options.canDeposit ? "Pay in full" : "Pay balance"}
                </p>
                <p className="mt-1 text-lg font-bold">{formatInr(options.balanceDue)}</p>
                <p className="mt-1 text-xs text-muted-foreground">Clear remaining amount now</p>
              </button>
            </div>
          </div>

          {availableProviders.length > 1 ? (
            <div className="space-y-3">
              <Label>Payment method</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {availableProviders.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProvider(p)}
                    className={cn(
                      "rounded-xl border p-4 text-left capitalize transition",
                      provider === p
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "hover:border-slate-300"
                    )}
                  >
                    <p className="text-sm font-semibold">{p}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{PROVIDER_HINTS[p]}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <Button
            className="w-full gap-2"
            onClick={() => {
              if (anyGatewayConfigured) void startPayment();
              else void startMockPayment();
            }}
            disabled={starting || payableAmount <= 0}
          >
            {starting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Preparing payment…
              </>
            ) : anyGatewayConfigured ? (
              <>
                <Wallet className="h-4 w-4" />
                Continue to pay {formatInr(payableAmount)}
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4" />
                Record demo payment {formatInr(payableAmount)}
              </>
            )}
          </Button>
          {!anyGatewayConfigured ? (
            <p className="text-center text-xs text-muted-foreground">
              No payment gateway configured — demo mode records payment without charging.
            </p>
          ) : null}
        </>
      ) : intent.mock ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Using demo mock payment for <strong>{formatInr(intent.payment.amount)}</strong>.
          </div>
          <Button className="w-full gap-2" onClick={handleMockPay} disabled={confirming}>
            Record mock payment
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setIntent(null)}>
            Change amount
          </Button>
        </div>
      ) : intentProvider === "cashfree" && intent.paymentSessionId ? (
        <div className="space-y-4">
          <CashfreePaymentButton
            paymentSessionId={intent.paymentSessionId}
            mode={cashfreeMode}
            amount={intent.amount ?? intent.payment.amount}
            onError={(message) => toast.error(message)}
          />
          <Button variant="ghost" className="w-full" onClick={() => setIntent(null)}>
            Cancel / change amount
          </Button>
        </div>
      ) : intentProvider === "razorpay" && intent.orderId && intent.keyId ? (
        <div className="space-y-4">
          <RazorpayPaymentButton
            keyId={intent.keyId}
            orderId={intent.orderId}
            amount={intent.amount ?? intent.payment.amount}
            currency={intent.currency ?? options.currency}
            bookingRef={booking.bookingRef}
            customerEmail={booking.contactEmail}
            customerPhone={booking.contactPhone}
            onPaid={handleRazorpayPaid}
            onError={(message) => toast.error(message)}
          />
          <Button variant="ghost" className="w-full" onClick={() => setIntent(null)}>
            Cancel / change amount
          </Button>
        </div>
      ) : intent.clientSecret ? (
        <div className="space-y-4">
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
            Charging <strong>{formatInr(intent.payment.amount)}</strong> via Stripe
          </div>
          <StripePaymentForm
            clientSecret={intent.clientSecret}
            publishableKey={publishableKey}
            amount={intent.payment.amount}
            returnUrl={returnUrl}
            onPaid={handleStripePaid}
          />
          <Button variant="ghost" className="w-full" onClick={() => setIntent(null)}>
            Cancel / change amount
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-destructive">Unable to start payment. Try again.</p>
          <Button variant="ghost" className="w-full" onClick={() => setIntent(null)}>
            Back
          </Button>
        </div>
      )}
    </div>
  );
}
