export type BookingStatus = "confirmed" | "pending" | "cancelled" | "completed";

export type DocumentCategory = "passport" | "id_proof" | "medical" | "other";

export interface BookingDocument {
  id: string;
  name: string;
  mimeType: string;
  category: DocumentCategory;
  uploadedAt: string;
}

export interface Booking {
  id: string;
  bookingRef: string;
  customerId: string;
  tripSlug: string;
  tripTitle: string;
  destination: string;
  batchDate: string;
  travelers: number;
  status: BookingStatus;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  invoiceNumber: string;
  voucherCode: string;
  documents: BookingDocument[];
  createdAt: string;
  updatedAt: string;
}
