import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BookingPayPanel } from "@/components/booking/BookingPayPanel";
import { SitePageShell } from "@/components/site/SitePageShell";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { isCustomerUser } from "@/lib/auth/user-kind";
import { laravelFetch, useLaravelApi } from "@/lib/api/backend";
import { getBookingForCustomer } from "@/lib/mock/booking-store";
import type { Booking } from "@/types/booking";

interface BookPayPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pay for booking | Backpackclan",
  description: "Complete your trip payment securely with Stripe.",
};

async function getBooking(id: string, token: string, customerId: string): Promise<Booking | null> {
  if (useLaravelApi()) {
    const { res, data } = await laravelFetch<{
      success: boolean;
      data?: Booking;
    }>(`/v1/customer/bookings/${id}`, { token });
    if (!res.ok || !data.success || !data.data) return null;
    return data.data;
  }
  return getBookingForCustomer(id, customerId);
}

export default async function BookPayPage({ params }: BookPayPageProps) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    redirect(`/login?redirect=${encodeURIComponent(`/book/pay/${id}`)}`);
  }
  if (!isCustomerUser(session.user)) {
    redirect("/admin/dashboard");
  }

  const booking = await getBooking(id, session.token, session.user.id);
  if (!booking) notFound();

  const successHref = `/book/success?booking=${encodeURIComponent(booking.id)}&ref=${encodeURIComponent(booking.bookingRef)}&paid=1`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const returnUrl = `${siteUrl}/book/pay/${booking.id}`;

  return (
    <SitePageShell>
      <div className="border-b bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
            <Link href={`/account/bookings/${booking.id}`}>
              <ArrowLeft className="h-4 w-4" />
              Booking details
            </Link>
          </Button>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">{booking.bookingRef}</p>
          <h1 className="mt-1 text-2xl font-bold">{booking.tripTitle}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{booking.destination}</p>
        </div>
        <BookingPayPanel
          booking={booking}
          returnUrl={returnUrl}
          successHref={successHref}
          heading="Secure checkout"
        />
      </div>
    </SitePageShell>
  );
}
