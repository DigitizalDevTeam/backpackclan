import type { Booking } from "@/types/booking";
import type { BookingPayment, PaymentMode, PaymentOptions } from "@/types/payment";
import { getBookingForCustomer, recordBookingPayment } from "@/lib/mock/booking-store";

const DEPOSIT_PERCENT = 30;

export function getMockPaymentOptions(
  bookingId: string,
  customerId: string
): PaymentOptions | null {
  const booking = getBookingForCustomer(bookingId, customerId);
  if (!booking) return null;

  const canDeposit = booking.paidAmount === 0 && booking.balanceDue > 0;
  const depositAmount = canDeposit
    ? Math.min(
        booking.balanceDue,
        Math.max(1, Math.floor((booking.totalAmount * DEPOSIT_PERCENT) / 100))
      )
    : 0;

  return {
    currency: "inr",
    stripeConfigured: false,
    razorpayConfigured: false,
    providers: [],
    publishableKey: null,
    razorpayKeyId: null,
    depositPercent: DEPOSIT_PERCENT,
    depositAmount,
    balanceDue: booking.balanceDue,
    totalAmount: booking.totalAmount,
    paidAmount: booking.paidAmount,
    canDeposit,
  };
}

export function createMockPaymentIntent(
  bookingId: string,
  customerId: string,
  mode: PaymentMode
):
  | { ok: true; amount: number; payment: BookingPayment; booking: Booking }
  | { ok: false; error: string; status: number } {
  const booking = getBookingForCustomer(bookingId, customerId);
  if (!booking) {
    return { ok: false, error: "Booking not found", status: 404 };
  }
  if (booking.balanceDue <= 0) {
    return { ok: false, error: "This booking has no balance due", status: 422 };
  }

  let amount = booking.balanceDue;
  let resolvedMode: PaymentMode = mode === "full" ? "full" : "balance";

  if (mode === "deposit") {
    if (booking.paidAmount > 0) {
      return {
        ok: false,
        error: "Deposit is only available on unpaid bookings",
        status: 422,
      };
    }
    amount = Math.min(
      booking.balanceDue,
      Math.max(1, Math.floor((booking.totalAmount * DEPOSIT_PERCENT) / 100))
    );
    resolvedMode = "deposit";
  }

  const payment: BookingPayment = {
    id: `pay${Date.now()}`,
    bookingId: booking.id,
    amount,
    currency: "inr",
    status: "pending",
    provider: "mock",
    mode: resolvedMode,
    stripePaymentIntentId: `mock_pi_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return { ok: true, amount, payment, booking };
}

export function confirmMockPayment(
  bookingId: string,
  customerId: string,
  amount: number
): { ok: true; booking: Booking } | { ok: false; error: string; status: number } {
  const updated = recordBookingPayment(bookingId, customerId, amount);
  if (!updated) {
    return { ok: false, error: "Invalid payment amount or booking not found", status: 400 };
  }
  return { ok: true, booking: updated };
}
