import type {
  Booking,
  BookingDocument,
  BookingTraveler,
  CreateBookingPayload,
  DocumentCategory,
} from "@/types/booking";
import type {
  AdminBooking,
  AdminBookingInput,
  AdminBookingUpdateInput,
} from "@/types/admin-booking";
import { loadMockData, saveMockData } from "@/lib/mock/persistence";
import { getAllTrips, getTripBySlug } from "@/lib/mock/trip-store";
import { getTripDetail } from "@/lib/mock/trip-detail-store";
import { getDepartureById } from "@/lib/mock/departure-store";
import { DEFAULT_TRIP_ADDONS, validateMockCoupon } from "@/lib/booking/pricing";
import { getCustomerById } from "@/lib/mock/customer-store";

const SEED_BOOKINGS: Booking[] = [
  {
    id: "bk1",
    bookingRef: "BC-2026-1042",
    customerId: "c1",
    tripSlug: "leh-ladakh-bike-expedition",
    tripTitle: "11 Days Value Edition Ladakh Bike Tour",
    destination: "Leh Ladakh",
    batchDate: "2026-07-08",
    travelers: 2,
    status: "confirmed",
    totalAmount: 49998,
    paidAmount: 20000,
    balanceDue: 29998,
    invoiceNumber: "INV-2026-1042",
    voucherCode: "VCH-LAD-1042",
    documents: [
      {
        id: "d1",
        name: "passport-amit.pdf",
        mimeType: "application/pdf",
        category: "passport",
        uploadedAt: "2026-03-15T10:00:00.000Z",
      },
    ],
    createdAt: "2026-03-01T10:00:00.000Z",
    updatedAt: "2026-03-15T10:00:00.000Z",
  },
  {
    id: "bk2",
    bookingRef: "BC-2026-1088",
    customerId: "c1",
    tripSlug: "spiti-valley-road-trip",
    tripTitle: "Spiti Valley Road Trip — Chandratal Edition",
    destination: "Spiti Valley",
    batchDate: "2026-08-12",
    travelers: 1,
    status: "pending",
    totalAmount: 18999,
    paidAmount: 5000,
    balanceDue: 13999,
    invoiceNumber: "INV-2026-1088",
    voucherCode: "VCH-SPI-1088",
    documents: [],
    createdAt: "2026-04-10T10:00:00.000Z",
    updatedAt: "2026-04-10T10:00:00.000Z",
  },
  {
    id: "bk3",
    bookingRef: "BC-2025-0891",
    customerId: "c1",
    tripSlug: "kashmir-great-lakes-trek",
    tripTitle: "Kashmir Great Lakes Trek",
    destination: "Kashmir",
    batchDate: "2025-08-05",
    travelers: 1,
    status: "completed",
    totalAmount: 15999,
    paidAmount: 15999,
    balanceDue: 0,
    invoiceNumber: "INV-2025-0891",
    voucherCode: "VCH-KAS-0891",
    documents: [
      {
        id: "d2",
        name: "aadhaar-amit.pdf",
        mimeType: "application/pdf",
        category: "id_proof",
        uploadedAt: "2025-06-20T10:00:00.000Z",
      },
    ],
    createdAt: "2025-05-12T10:00:00.000Z",
    updatedAt: "2025-08-10T10:00:00.000Z",
  },
  {
    id: "bk4",
    bookingRef: "BC-2026-1105",
    customerId: "c2",
    tripSlug: "bhutan-cultural-escape",
    tripTitle: "Bhutan Cultural Escape — 5N/6D",
    destination: "Bhutan",
    batchDate: "2026-09-20",
    travelers: 2,
    status: "confirmed",
    totalAmount: 89998,
    paidAmount: 30000,
    balanceDue: 59998,
    invoiceNumber: "INV-2026-1105",
    voucherCode: "VCH-BHU-1105",
    documents: [],
    createdAt: "2026-05-01T10:00:00.000Z",
    updatedAt: "2026-05-01T10:00:00.000Z",
  },
];

let bookings: Booking[] | null = null;

function getBookings(): Booking[] {
  if (!bookings) {
    bookings = loadMockData("bookings", structuredClone(SEED_BOOKINGS));
  }
  return bookings;
}

function persistBookings(): void {
  if (bookings) saveMockData("bookings", bookings);
}

export function getBookingsByCustomerId(customerId: string): Booking[] {
  return getBookings()
    .filter((b) => b.customerId === customerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getBookingById(id: string): Booking | null {
  return getBookings().find((b) => b.id === id) ?? null;
}

export function getBookingForCustomer(
  bookingId: string,
  customerId: string
): Booking | null {
  const booking = getBookingById(bookingId);
  if (!booking || booking.customerId !== customerId) return null;
  return booking;
}

export function addBookingDocument(
  bookingId: string,
  customerId: string,
  doc: { name: string; mimeType: string; category: DocumentCategory }
): BookingDocument | null {
  const index = getBookings().findIndex(
    (b) => b.id === bookingId && b.customerId === customerId
  );
  if (index === -1) return null;

  const newDoc: BookingDocument = {
    id: `d${Date.now()}`,
    name: doc.name,
    mimeType: doc.mimeType,
    category: doc.category,
    uploadedAt: new Date().toISOString(),
  };

  const updated: Booking = {
    ...getBookings()[index],
    documents: [...getBookings()[index].documents, newDoc],
    updatedAt: new Date().toISOString(),
  };

  bookings = [
    ...getBookings().slice(0, index),
    updated,
    ...getBookings().slice(index + 1),
  ];
  persistBookings();
  return newDoc;
}

function parseBatchDateToIso(display: string): string {
  const parsed = new Date(display);
  if (Number.isNaN(parsed.getTime())) {
    return display;
  }
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export type CreateBookingResult =
  | { ok: true; booking: Booking }
  | { ok: false; error: string; status: number };

export function createBooking(
  customerId: string,
  payload: CreateBookingPayload,
  contact?: { phone?: string | null; email?: string | null }
): CreateBookingResult {
  const trip = getTripBySlug(payload.tripSlug);
  if (!trip) {
    return { ok: false, error: "Trip not found", status: 404 };
  }

  const detail = getTripDetail(trip);
  const batch = detail.batches.find((b) => b.id === payload.departureId);
  if (!batch) {
    return { ok: false, error: "Selected batch not found", status: 404 };
  }
  if (batch.status === "sold_out") {
    return { ok: false, error: "This batch is no longer available for booking", status: 422 };
  }

  const pax = payload.adults + payload.children;
  if (payload.travelers.length !== pax) {
    return {
      ok: false,
      error: "Traveler details must match the number of adults and children",
      status: 422,
    };
  }
  if (batch.seatsLeft < pax) {
    return { ok: false, error: "Not enough seats left for this batch", status: 422 };
  }

  const tripSubtotal = batch.price * pax;
  const catalog = detail.addons?.length ? detail.addons : DEFAULT_TRIP_ADDONS;
  const selectedAddons = (payload.addonIds ?? [])
    .map((id) => catalog.find((a) => a.id === id))
    .filter(Boolean)
    .map((addon) => {
      const a = addon!;
      const quantity = a.pricingType === "flat" ? 1 : pax;
      return {
        id: a.id,
        name: a.name,
        price: a.price,
        pricingType: a.pricingType,
        quantity,
        lineTotal: a.price * quantity,
      };
    });
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.lineTotal, 0);
  const subtotal = tripSubtotal + addonsTotal;

  let discountAmount = 0;
  let couponCode: string | null = null;
  if (payload.couponCode) {
    const coupon = validateMockCoupon(payload.couponCode, subtotal, trip.slug);
    if (!coupon.ok) {
      return { ok: false, error: coupon.error, status: 422 };
    }
    discountAmount = coupon.data.discount;
    couponCode = coupon.data.code;
  }

  const totalAmount = Math.max(0, subtotal - discountAmount);

  const seq = getBookings().length + 1100;
  const year = new Date().getFullYear();
  const now = new Date().toISOString();
  const slugCode = trip.slug.replace(/[^a-z]/gi, "").slice(0, 3).toUpperCase() || "TRP";

  const booking: Booking = {
    id: `bk${Date.now()}`,
    bookingRef: `BC-${year}-${seq}`,
    customerId,
    tripId: trip.id,
    departureId: batch.id,
    tripSlug: trip.slug,
    tripTitle: trip.title,
    destination: trip.destination,
    batchDate: parseBatchDateToIso(batch.date),
    travelers: pax,
    adults: payload.adults,
    children: payload.children,
    travelerDetails: payload.travelers as BookingTraveler[],
    contactPhone: payload.contactPhone ?? contact?.phone ?? null,
    contactEmail: payload.contactEmail ?? contact?.email ?? null,
    status: "pending",
    subtotalAmount: tripSubtotal,
    addonsTotal,
    discountAmount,
    selectedAddons,
    couponCode,
    totalAmount,
    paidAmount: 0,
    balanceDue: totalAmount,
    invoiceNumber: `INV-${year}-${seq}`,
    voucherCode: `VCH-${slugCode}-${seq}`,
    documents: [],
    createdAt: now,
    updatedAt: now,
  };

  bookings = [booking, ...getBookings()];
  persistBookings();
  return { ok: true, booking };
}

export function recordBookingPayment(
  bookingId: string,
  customerId: string,
  amount: number
): Booking | null {
  const index = getBookings().findIndex(
    (b) => b.id === bookingId && b.customerId === customerId
  );
  if (index === -1) return null;

  const booking = getBookings()[index];
  if (amount <= 0 || amount > booking.balanceDue) return null;

  const updated: Booking = {
    ...booking,
    paidAmount: booking.paidAmount + amount,
    balanceDue: booking.balanceDue - amount,
    status: booking.paidAmount + amount >= booking.totalAmount || booking.balanceDue - amount === 0
      ? "confirmed"
      : booking.paidAmount + amount > 0
        ? "confirmed"
        : booking.status,
    updatedAt: new Date().toISOString(),
  };

  bookings = [
    ...getBookings().slice(0, index),
    updated,
    ...getBookings().slice(index + 1),
  ];
  persistBookings();
  return updated;
}

export function getAdminBookings(): AdminBooking[] {
  return getBookings().map((b) => ({
    ...b,
    customer: {
      id: b.customerId,
      name: getCustomerById(b.customerId)?.name ?? "Customer",
      email: getCustomerById(b.customerId)?.email ?? b.contactEmail ?? "",
      phone: getCustomerById(b.customerId)?.phone ?? b.contactPhone ?? null,
    },
    payments: [],
  }));
}

export function getAdminBookingById(id: string): AdminBooking | null {
  return getAdminBookings().find((b) => b.id === id) ?? null;
}

export function adminCreateBooking(
  input: AdminBookingInput
): { ok: true; booking: AdminBooking } | { ok: false; error: string; status: number } {
  const trip = getAllTrips().find((t) => t.id === input.tripId);
  if (!trip) return { ok: false, error: "Trip not found", status: 404 };

  const detail = getTripDetail(trip);
  const batch = detail.batches.find((b) => b.id === input.departureId);
  if (!batch) return { ok: false, error: "Departure not found", status: 404 };

  const pax = input.adults + input.children;
  const total = batch.price * pax;
  const paid = Math.min(total, input.paidAmount ?? 0);
  const seq = getBookings().length + 1200;
  const year = new Date().getFullYear();
  const now = new Date().toISOString();
  const slugCode = trip.slug.replace(/[^a-z]/gi, "").slice(0, 3).toUpperCase() || "TRP";

  const booking: Booking = {
    id: `bk${Date.now()}`,
    bookingRef: `BC-${year}-${seq}`,
    customerId: input.customerId,
    tripId: trip.id,
    departureId: batch.id,
    tripSlug: trip.slug,
    tripTitle: trip.title,
    destination: trip.destination,
    batchDate: parseBatchDateToIso(batch.date),
    travelers: pax,
    adults: input.adults,
    children: input.children,
    travelerDetails: input.travelerDetails ?? [],
    contactPhone: input.contactPhone ?? null,
    contactEmail: input.contactEmail ?? null,
    status: input.status ?? "confirmed",
    subtotalAmount: total,
    addonsTotal: 0,
    discountAmount: 0,
    selectedAddons: [],
    couponCode: null,
    totalAmount: total,
    paidAmount: paid,
    balanceDue: total - paid,
    invoiceNumber: `INV-${year}-${seq}`,
    voucherCode: `VCH-${slugCode}-${seq}`,
    documents: [],
    createdAt: now,
    updatedAt: now,
  };

  bookings = [booking, ...getBookings()];
  persistBookings();
  return { ok: true, booking: getAdminBookingById(booking.id)! };
}

export function adminUpdateBooking(
  id: string,
  input: AdminBookingUpdateInput
): { ok: true; booking: AdminBooking } | { ok: false; error: string; status: number } {
  const index = getBookings().findIndex((b) => b.id === id);
  if (index === -1) return { ok: false, error: "Booking not found", status: 404 };

  const current = getBookings()[index];
  let customerId = current.customerId;
  let tripId = current.tripId ?? null;
  let departureId = current.departureId ?? null;
  let tripSlug = current.tripSlug;
  let tripTitle = current.tripTitle;
  let destination = current.destination;
  let batchDate = current.batchDate;
  let totalAmount = current.totalAmount;
  let subtotalAmount = current.subtotalAmount ?? current.totalAmount;

  if (input.customerId) {
    const customer = getCustomerById(input.customerId);
    if (!customer) return { ok: false, error: "Customer not found", status: 404 };
    customerId = customer.id;
  }

  const adults = input.adults ?? current.adults ?? current.travelers;
  const children = input.children ?? current.children ?? 0;
  const pax = adults + children;

  const nextTripId = input.tripId ?? tripId;
  const nextDepartureId = input.departureId ?? departureId;
  const applyTripFields =
    input.tripId !== undefined || input.departureId !== undefined;

  if (applyTripFields && nextTripId && nextDepartureId) {
    const trip = getAllTrips().find((t) => t.id === nextTripId);
    if (!trip) return { ok: false, error: "Trip not found", status: 404 };

    const departure = getDepartureById(nextDepartureId);
    const detail = getTripDetail(trip);
    const batch = detail.batches.find((b) => b.id === nextDepartureId);

    if (!departure && !batch) {
      return { ok: false, error: "Departure not found", status: 404 };
    }

    tripId = trip.id;
    departureId = nextDepartureId;
    tripSlug = trip.slug;
    tripTitle = trip.title;
    destination = trip.destination;
    batchDate = departure?.startDate ?? parseBatchDateToIso(batch!.date);

    const shouldRecalc =
      (input.recalculatePricing ?? true) === true &&
      typeof input.totalAmount !== "number";

    if (shouldRecalc) {
      const unit =
        departure?.pricingOverride?.salePrice ||
        departure?.pricingOverride?.basePrice ||
        batch?.price ||
        trip.price ||
        0;
      if (unit <= 0) {
        return { ok: false, error: "Trip pricing is not configured", status: 422 };
      }
      const addons = current.addonsTotal ?? 0;
      const discount = current.discountAmount ?? 0;
      subtotalAmount = unit * pax;
      totalAmount = Math.max(0, subtotalAmount + addons - discount);
    }
  } else if (
    (input.recalculatePricing ?? false) === true &&
    typeof input.totalAmount !== "number" &&
    (input.adults !== undefined || input.children !== undefined)
  ) {
    const unit = Math.round(
      (current.subtotalAmount ?? current.totalAmount) /
        Math.max(1, current.travelers)
    );
    const addons = current.addonsTotal ?? 0;
    const discount = current.discountAmount ?? 0;
    subtotalAmount = unit * pax;
    totalAmount = Math.max(0, subtotalAmount + addons - discount);
  }

  if (typeof input.totalAmount === "number") {
    totalAmount = input.totalAmount;
  }

  let paidAmount = current.paidAmount;
  let status = input.status ?? current.status;

  if (typeof input.paidAmount === "number") {
    paidAmount = Math.min(totalAmount, input.paidAmount);
  }
  if (typeof input.recordPaymentAmount === "number") {
    paidAmount = Math.min(totalAmount, paidAmount + input.recordPaymentAmount);
  }
  if (paidAmount > 0 && status === "pending") status = "confirmed";

  const updated: Booking = {
    ...current,
    customerId,
    tripId,
    departureId,
    tripSlug,
    tripTitle,
    destination,
    batchDate,
    adults,
    children,
    travelers: pax,
    contactPhone:
      input.contactPhone !== undefined ? input.contactPhone : current.contactPhone,
    contactEmail:
      input.contactEmail !== undefined ? input.contactEmail : current.contactEmail,
    travelerDetails: input.travelerDetails ?? current.travelerDetails,
    subtotalAmount,
    totalAmount,
    paidAmount,
    balanceDue: Math.max(0, totalAmount - paidAmount),
    status,
    updatedAt: new Date().toISOString(),
  };

  bookings = [
    ...getBookings().slice(0, index),
    updated,
    ...getBookings().slice(index + 1),
  ];
  persistBookings();
  return { ok: true, booking: getAdminBookingById(id)! };
}

export function adminCancelBooking(
  id: string
): { ok: true; booking: AdminBooking } | { ok: false; error: string; status: number } {
  return adminUpdateBooking(id, { status: "cancelled" });
}
