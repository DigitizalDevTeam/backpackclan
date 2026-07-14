export type PaymentMode = "deposit" | "full" | "balance";

export type PaymentProvider = "stripe" | "razorpay";

export type PaymentStatus = "pending" | "succeeded" | "failed" | "canceled";

export interface BookingPayment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string;
  mode: PaymentMode;
  stripePaymentIntentId?: string | null;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  paidAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentOptions {
  currency: string;
  stripeConfigured: boolean;
  razorpayConfigured?: boolean;
  providers?: PaymentProvider[];
  publishableKey?: string | null;
  razorpayKeyId?: string | null;
  depositPercent: number;
  depositAmount: number;
  balanceDue: number;
  totalAmount: number;
  paidAmount: number;
  canDeposit: boolean;
}

export interface PaymentIntentResponse {
  provider?: PaymentProvider;
  clientSecret: string | null;
  publishableKey?: string | null;
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  payment: BookingPayment;
  booking: import("@/types/booking").Booking;
  mock?: boolean;
}
