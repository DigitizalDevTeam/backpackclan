"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatInr } from "@/lib/site/format";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

interface RazorpayPaymentButtonProps {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  bookingRef: string;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  onPaid: (payload: {
    orderId: string;
    paymentId: string;
    signature: string;
  }) => void;
  onError?: (message: string) => void;
}

function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject();
  if (window.Razorpay) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Razorpay failed to load"))
      );
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Razorpay failed to load"));
    document.body.appendChild(script);
  });
}

export function RazorpayPaymentButton({
  keyId,
  orderId,
  amount,
  currency,
  bookingRef,
  customerName,
  customerEmail,
  customerPhone,
  onPaid,
  onError,
}: RazorpayPaymentButtonProps) {
  const [ready, setReady] = useState(false);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadRazorpayScript()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((err) => {
        onError?.(err instanceof Error ? err.message : "Razorpay failed to load");
      });
    return () => {
      cancelled = true;
    };
  }, [onError]);

  function openCheckout() {
    if (!window.Razorpay || opening) return;
    setOpening(true);

    const rzp = new window.Razorpay({
      key: keyId,
      amount: amount * 100,
      currency: currency.toUpperCase(),
      name: "Backpackclan",
      description: `Booking ${bookingRef}`,
      order_id: orderId,
      prefill: {
        name: customerName || undefined,
        email: customerEmail || undefined,
        contact: customerPhone || undefined,
      },
      handler: (response: unknown) => {
        const res = response as {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        };
        onPaid({
          orderId: res.razorpay_order_id,
          paymentId: res.razorpay_payment_id,
          signature: res.razorpay_signature,
        });
        setOpening(false);
      },
      modal: {
        ondismiss: () => setOpening(false),
      },
    });

    rzp.on("payment.failed", (response: unknown) => {
      const err = response as { error?: { description?: string } };
      onError?.(err.error?.description || "Payment failed");
      setOpening(false);
    });

    rzp.open();
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
        Charging <strong>{formatInr(amount)}</strong> via Razorpay
      </div>
      <Button className="w-full" disabled={!ready || opening} onClick={openCheckout}>
        {opening || !ready ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {ready ? "Opening Razorpay…" : "Loading Razorpay…"}
          </>
        ) : (
          `Pay ${formatInr(amount)} with Razorpay`
        )}
      </Button>
    </div>
  );
}
