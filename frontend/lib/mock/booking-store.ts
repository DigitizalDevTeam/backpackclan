import type { Booking, BookingDocument, DocumentCategory } from "@/types/booking";
import { loadMockData, saveMockData } from "@/lib/mock/persistence";

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
    status: booking.balanceDue - amount === 0 ? "confirmed" : booking.status,
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
