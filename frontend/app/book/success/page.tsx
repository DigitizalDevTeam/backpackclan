import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, ArrowRight, Calendar } from "lucide-react";
import { SitePageShell } from "@/components/site/SitePageShell";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { isCustomerUser } from "@/lib/auth/user-kind";

export const metadata: Metadata = {
  title: "Booking confirmed | Backpackclan",
  description: "Your trip booking was created successfully.",
};

interface BookSuccessPageProps {
  searchParams: Promise<{ booking?: string; ref?: string; paid?: string }>;
}

export default async function BookSuccessPage({
  searchParams,
}: BookSuccessPageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login?redirect=/account/bookings");
  }
  if (!isCustomerUser(session.user)) {
    redirect("/admin/dashboard");
  }

  const { booking, ref, paid } = await searchParams;
  const bookingHref = booking
    ? `/account/bookings/${booking}`
    : "/account/bookings";
  const wasPaid = paid === "1";

  return (
    <SitePageShell>
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="mt-6 text-2xl font-bold sm:text-3xl">
          {wasPaid ? "Payment successful" : "Booking created"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          Thanks, {session.user.name}.
          {ref ? (
            <>
              {" "}
              Booking <span className="font-semibold text-foreground">{ref}</span>
            </>
          ) : null}
          {wasPaid
            ? " is confirmed. You can download your invoice and upload travel documents anytime."
            : " is saved. Complete payment and upload documents from your booking page."}
        </p>
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="gap-2">
            <Link href={bookingHref}>
              View booking
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/account/bookings">
              <Calendar className="h-4 w-4" />
              All bookings
            </Link>
          </Button>
        </div>
        <Link
          href="/trips"
          className="mt-6 text-sm font-medium text-primary hover:underline"
        >
          Browse more trips
        </Link>
      </div>
    </SitePageShell>
  );
}
