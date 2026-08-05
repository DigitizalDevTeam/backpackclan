"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatInr } from "@/lib/site/format";

declare global {
  interface Window {
    Cashfree?: (options: { mode: "sandbox" | "production" }) => {
      checkout: (options: {
        paymentSessionId: string;
        redirectTarget?: "_self" | "_blank" | "_top" | "_modal";
      }) => Promise<unknown> | void;
    };
  }
}

interface CashfreePaymentButtonProps {
  paymentSessionId: string;
  mode: "sandbox" | "production";
  amount: number;
  onError?: (message: string) => void;
}

function loadCashfreeScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject();
  if (window.Cashfree) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Cashfree failed to load"))
      );
      return;
    }
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Cashfree failed to load"));
    document.body.appendChild(script);
  });
}

export function CashfreePaymentButton({
  paymentSessionId,
  mode,
  amount,
  onError,
}: CashfreePaymentButtonProps) {
  const [ready, setReady] = useState(false);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadCashfreeScript()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((err) => {
        onError?.(err instanceof Error ? err.message : "Cashfree failed to load");
      });
    return () => {
      cancelled = true;
    };
  }, [onError]);

  function openCheckout() {
    if (!window.Cashfree || opening) return;
    setOpening(true);

    try {
      const cashfree = window.Cashfree({ mode });
      cashfree.checkout({
        paymentSessionId,
        redirectTarget: "_self",
      });
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Could not open Cashfree checkout");
      setOpening(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
        Charging <strong>{formatInr(amount)}</strong> via Cashfree
      </div>
      <Button className="w-full" disabled={!ready || opening} onClick={openCheckout}>
        {opening || !ready ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {ready ? "Opening Cashfree…" : "Loading Cashfree…"}
          </>
        ) : (
          `Pay ${formatInr(amount)} with Cashfree`
        )}
      </Button>
    </div>
  );
}
