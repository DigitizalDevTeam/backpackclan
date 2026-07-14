import type { Booking, BookingStatus, BookingTraveler } from "@/types/booking";
import type { BookingPayment } from "@/types/payment";

export type AdminBookingStatus = BookingStatus;

export interface AdminBookingCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
}

export interface AdminBooking extends Booking {
  customer?: AdminBookingCustomer | null;
  payments?: BookingPayment[];
}

export interface AdminBookingInput {
  customerId: string;
  tripId: string;
  departureId: string;
  adults: number;
  children: number;
  status?: AdminBookingStatus;
  paidAmount?: number;
  contactPhone?: string;
  contactEmail?: string;
  travelerDetails?: BookingTraveler[];
  notes?: string;
}

export interface AdminBookingUpdateInput {
  status?: AdminBookingStatus;
  customerId?: string;
  tripId?: string;
  departureId?: string;
  adults?: number;
  children?: number;
  contactPhone?: string | null;
  contactEmail?: string | null;
  travelerDetails?: BookingTraveler[];
  paidAmount?: number;
  totalAmount?: number;
  recordPaymentAmount?: number;
  recalculatePricing?: boolean;
}
