import type { RoomOptionKey, TravelOptionKey } from "@/types/travel";

export type BookingStatus = "confirmed" | "pending" | "cancelled" | "completed";

export type DocumentCategory = "passport" | "id_proof" | "medical" | "other";

export type TravelerGender = "male" | "female" | "other";

export type TravelerIdType = "aadhaar" | "passport" | "dl" | "other";

export interface BookingAddonLine {
  id: string;
  name: string;
  price: number;
  pricingType: "per_person" | "flat";
  quantity: number;
  lineTotal: number;
}

export interface BookingDocument {
  id: string;
  name: string;
  mimeType: string;
  category: DocumentCategory;
  uploadedAt: string;
}

export interface BookingTraveler {
  fullName: string;
  age: number;
  gender: TravelerGender;
  idType: TravelerIdType;
  idNumber: string;
  /** Per-person travel option (biking) */
  travelOption?: TravelOptionKey | null;
  /** Per-person room sharing */
  roomOption?: RoomOptionKey | null;
  /** Resolved package price for this traveler */
  unitPrice?: number | null;
}

export interface Booking {
  id: string;
  bookingRef: string;
  customerId: string;
  tripId?: string | null;
  departureId?: string | null;
  tripSlug: string;
  tripTitle: string;
  destination: string;
  batchDate: string;
  travelers: number;
  adults?: number;
  children?: number;
  riderOption?: TravelOptionKey | null;
  roomOption?: RoomOptionKey | null;
  unitPrice?: number | null;
  travelerDetails?: BookingTraveler[];
  contactPhone?: string | null;
  contactEmail?: string | null;
  status: BookingStatus;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  invoiceNumber: string;
  voucherCode: string;
  couponCode?: string | null;
  discountAmount?: number;
  addonsTotal?: number;
  subtotalAmount?: number;
  selectedAddons?: BookingAddonLine[];
  documents: BookingDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingPayload {
  tripSlug: string;
  departureId: string;
  adults: number;
  children: number;
  travelOption?: TravelOptionKey;
  riderOption?: TravelOptionKey;
  roomOption?: RoomOptionKey;
  travelers: BookingTraveler[];
  contactPhone?: string;
  contactEmail?: string;
  acceptedTerms: boolean;
  couponCode?: string;
  addonIds?: string[];
}
