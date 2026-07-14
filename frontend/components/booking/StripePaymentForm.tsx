"use client";

import { useMemo, useState } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatInr } from "@/lib/site/format";

const stripePromises = new Map<string, Promise<Stripe | null>>();

function getStripe(publishableKey: string) {
  if (!stripePromises.has(publishableKey)) {
    stripePromises.set(publishableKey, loadStripe(publishableKey));
  }
  return stripePromises.get(publishableKey)!;
}

interface StripeCheckoutFormProps {
  amount: number;
  returnUrl: string;
  onPaid: (paymentIntentId: string) => Promise<void>;
}

function StripeCheckoutForm({ amount, returnUrl, onPaid }: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: "if_required",
      });

      if (error) {
        toast.error(error.message || "Payment failed");
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        await onPaid(paymentIntent.id);
        return;
      }

      toast.message("Payment requires additional steps. Follow the prompts from your bank.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />
      <Button type="submit" disabled={!stripe || submitting} className="w-full gap-2">
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing…
          </>
        ) : (
          <>Pay {formatInr(amount)}</>
        )}
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
        Secured by Stripe · Cards, UPI & more
      </p>
    </form>
  );
}

interface StripePaymentFormProps {
  clientSecret: string;
  publishableKey: string;
  amount: number;
  returnUrl: string;
  onPaid: (paymentIntentId: string) => Promise<void>;
}

export function StripePaymentForm({
  clientSecret,
  publishableKey,
  amount,
  returnUrl,
  onPaid,
}: StripePaymentFormProps) {
  const stripePromise = useMemo(() => getStripe(publishableKey), [publishableKey]);

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#0f766e",
            borderRadius: "12px",
          },
        },
      }}
    >
      <StripeCheckoutForm amount={amount} returnUrl={returnUrl} onPaid={onPaid} />
    </Elements>
  );
}
