import type { Booking } from "@/types/booking";
import type { CustomerUser } from "@/types/customer";
import { formatDate } from "@/lib/site/format";
import { formatInr } from "@/lib/site/format";

export function buildInvoiceText(booking: Booking, customer: CustomerUser): string {
  return [
    "BACKPACKCLAN — TAX INVOICE",
    "================================",
    `Invoice No: ${booking.invoiceNumber}`,
    `Booking Ref: ${booking.bookingRef}`,
    `Date: ${formatDate(booking.createdAt)}`,
    "",
    "BILLED TO",
    customer.name,
    customer.email,
    customer.phone,
    "",
    "TRIP DETAILS",
    booking.tripTitle,
    `Destination: ${booking.destination}`,
    `Batch Date: ${formatDate(booking.batchDate)}`,
    `Travelers: ${booking.travelers}`,
    "",
    "PAYMENT SUMMARY",
    `Total Amount: ${formatInr(booking.totalAmount)}`,
    `Paid: ${formatInr(booking.paidAmount)}`,
    `Balance Due: ${formatInr(booking.balanceDue)}`,
    "",
    "Thank you for choosing Backpackclan!",
    "hello@backpackclan.com | +91 98765 43210",
  ].join("\n");
}

export function buildVoucherText(booking: Booking, customer: CustomerUser): string {
  return [
    "BACKPACKCLAN — TRAVEL VOUCHER",
    "================================",
    `Voucher Code: ${booking.voucherCode}`,
    `Booking Ref: ${booking.bookingRef}`,
    `Status: ${booking.status.toUpperCase()}`,
    "",
    "GUEST",
    customer.name,
    `Travelers: ${booking.travelers}`,
    "",
    "TRIP",
    booking.tripTitle,
    booking.destination,
    `Departure: ${formatDate(booking.batchDate)}`,
    "",
    "Present this voucher at check-in.",
    "For support: hello@backpackclan.com",
  ].join("\n");
}

export function triggerTextDownload(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
