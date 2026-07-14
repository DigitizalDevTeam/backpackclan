"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Download,
  FileText,
  Loader2,
  MapPin,
  Receipt,
  Upload,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import type { Booking, BookingDocument, DocumentCategory } from "@/types/booking";
import { formatDate } from "@/lib/site/format";
import { formatInr } from "@/lib/site/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const statusStyles: Record<Booking["status"], string> = {
  confirmed: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-slate-100 text-slate-700",
};

interface BookingsListProps {
  initialBookings?: Booking[];
}

export function BookingsList({ initialBookings }: BookingsListProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings ?? []);
  const [loading, setLoading] = useState(!initialBookings);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/customer/bookings");
      const data = await res.json();
      if (data.success) setBookings(data.data);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialBookings) loadBookings();
  }, [initialBookings, loadBookings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border bg-white py-16 text-center">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">No bookings yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Browse our trips and start your next Himalayan adventure.
        </p>
        <Button asChild className="mt-6 bg-orange-500 hover:bg-orange-600">
          <Link href="/trips">Browse trips</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Link
          key={booking.id}
          href={`/account/bookings/${booking.id}`}
          className="group block rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge className={cn("border-0", statusStyles[booking.status])}>
                  {booking.status}
                </Badge>
                <span className="text-xs text-muted-foreground">{booking.bookingRef}</span>
              </div>
              <h3 className="text-lg font-bold group-hover:text-primary">{booking.tripTitle}</h3>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-primary" />
                  {booking.destination}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-primary" />
                  {formatDate(booking.batchDate)}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-primary" />
                  {booking.travelers} traveler{booking.travelers > 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-bold">{formatInr(booking.totalAmount)}</p>
              {booking.balanceDue > 0 ? (
                <p className="mt-1 text-sm font-medium text-orange-600">
                  {formatInr(booking.balanceDue)} due
                </p>
              ) : (
                <p className="mt-1 text-sm font-medium text-green-600">Fully paid</p>
              )}
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                View details
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

interface BookingDetailViewProps {
  bookingId: string;
}

export function BookingDetailView({ bookingId }: BookingDetailViewProps) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState<DocumentCategory>("passport");
  const [file, setFile] = useState<File | null>(null);

  const loadBooking = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customer/bookings/${bookingId}`);
      const data = await res.json();
      if (data.success) setBooking(data.data);
      else toast.error("Booking not found");
    } catch {
      toast.error("Failed to load booking");
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  async function handleDownload(type: "invoice" | "voucher") {
    try {
      const res = await fetch(`/api/customer/bookings/${bookingId}/${type}`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="(.+)"/);
      const filename = match?.[1] ?? `${type}.txt`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success(`${type === "invoice" ? "Invoice" : "Voucher"} downloaded`);
    } catch {
      toast.error("Download failed");
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      const res = await fetch(`/api/customer/bookings/${bookingId}/documents`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.errors?.form);
      toast.success("Document uploaded");
      setFile(null);
      loadBooking();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="rounded-2xl border bg-white py-16 text-center">
        <p className="text-muted-foreground">Booking not found.</p>
        <Button asChild variant="link" className="mt-2">
          <Link href="/account/bookings">Back to bookings</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/account/bookings" className="text-sm text-primary hover:underline">
          ← Back to bookings
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge className={cn("border-0", statusStyles[booking.status])}>
                {booking.status}
              </Badge>
              <span className="text-sm text-muted-foreground">{booking.bookingRef}</span>
            </div>
            <h1 className="text-2xl font-bold">{booking.tripTitle}</h1>
            <p className="mt-1 text-muted-foreground">{booking.destination}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => handleDownload("invoice")}>
              <Receipt className="h-4 w-4" />
              Download Invoice
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDownload("voucher")}>
              <Download className="h-4 w-4" />
              Download Voucher
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border bg-white p-6">
            <h2 className="font-semibold">Trip details</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Batch date</dt>
                <dd className="font-medium">{formatDate(booking.batchDate)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Travelers</dt>
                <dd className="font-medium">{booking.travelers}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Invoice</dt>
                <dd className="font-medium">{booking.invoiceNumber}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Voucher code</dt>
                <dd className="font-medium">{booking.voucherCode}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border bg-white p-6">
            <h2 className="font-semibold">Uploaded documents</h2>
            {booking.documents.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No documents uploaded yet. Upload passport or ID below.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {booking.documents.map((doc: BookingDocument) => (
                  <li
                    key={doc.id}
                    className="flex items-center gap-3 rounded-lg border bg-slate-50 px-4 py-3 text-sm"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.category.replace("_", " ")} · {formatDate(doc.uploadedAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={handleUpload} className="mt-6 space-y-4 border-t pt-6">
              <h3 className="text-sm font-semibold">Upload document</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                  >
                    <option value="passport">Passport</option>
                    <option value="id_proof">ID Proof</option>
                    <option value="medical">Medical certificate</option>
                    <option value="other">Other</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">File</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              </div>
              <Button type="submit" disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload document
                  </>
                )}
              </Button>
            </form>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border bg-white p-6">
            <h2 className="font-semibold">Payment summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total</dt>
                <dd className="font-medium">{formatInr(booking.totalAmount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Paid</dt>
                <dd className="font-medium text-green-600">{formatInr(booking.paidAmount)}</dd>
              </div>
              <div className="flex justify-between border-t pt-3">
                <dt className="font-medium">Balance due</dt>
                <dd className="text-lg font-bold text-orange-600">
                  {formatInr(booking.balanceDue)}
                </dd>
              </div>
            </dl>
            {booking.balanceDue > 0 ? (
              <div className="mt-6 space-y-3">
                <Button asChild className="w-full gap-2 bg-orange-500 hover:bg-orange-600">
                  <Link href={`/book/pay/${booking.id}`}>
                    <Wallet className="h-4 w-4" />
                    Pay {formatInr(booking.balanceDue)}
                  </Link>
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Secure card / UPI checkout via Stripe
                </p>
              </div>
            ) : (
              <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-center text-sm font-medium text-green-700">
                Fully paid — you&apos;re all set!
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
