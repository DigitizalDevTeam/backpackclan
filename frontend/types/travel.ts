export type PublishStatus = "draft" | "published" | "archived";

export type DepartureStatus =
  | "available"
  | "limited"
  | "last_few"
  | "sold_out"
  | "guaranteed"
  | "booking_closed"
  | "cancelled";

export interface ItineraryDay {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  meals: { breakfast: boolean; lunch: boolean; dinner: boolean };
  overnight: string;
  distance?: string;
  altitude?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  tripTaken: string;
  rating: number;
  text: string;
  avatarId: string | null;
}

export interface RepeaterItem {
  id: string;
  text: string;
  icon?: string;
}

export interface TripPricing {
  basePrice: number;
  salePrice?: number | null;
  showStrikeThrough: boolean;
  offerLabel?: string;
  offerValidUntil?: string | null;
  currency: "INR";
  pricePer: "person" | "bike" | "couple";
  /**
   * Biking: travel option (Own Bike / Solo / Dual / Coach) × room sharing.
   * Treks & backpacking: room sharing only.
   */
  dynamicPricing?: DynamicPricingConfig | null;
}

/** Biking travel / bike options */
export type TravelOptionKey = "own_bike" | "solo" | "dual" | "coach";
/** @deprecated use TravelOptionKey */
export type RiderOptionKey = TravelOptionKey;

export type RoomOptionKey = "triple" | "double" | "single";

export interface DynamicPricingRoomPrices {
  triple: number | null;
  double: number | null;
  single: number | null;
}

export interface DynamicPricingConfig {
  enabled: boolean;
  /** Own Bike / Solo / Dual / Seat in Coach — for biking trips */
  travelEnabled: boolean;
  /** Single / Double / Triple — biking + treks + backpacking */
  roomEnabled: boolean;
  /**
   * Absolute per-person package prices.
   * travel + room → matrix[travel][room]
   * room only → rooms[room]
   * travel only → travel[travel]
   */
  travel: Record<TravelOptionKey, number | null>;
  rooms: DynamicPricingRoomPrices;
  matrix: Record<TravelOptionKey, DynamicPricingRoomPrices>;
  /** Legacy aliases kept while loading older saved trips */
  riderEnabled?: boolean;
  riders?: Record<string, number | null>;
}

export interface WeatherMonth {
  month: number;
  avgHigh: number | null;
  avgLow: number | null;
  conditions: string;
  note: string;
}

export interface CalendarDeparture {
  id: string;
  tripId: string;
  tripTitle: string;
  startDate: string;
  endDate: string;
  totalSeats: number;
  bookedSeats: number;
  status: DepartureStatus;
}

export const PUBLISH_STATUS_LABELS: Record<
  PublishStatus,
  { label: string; variant: "secondary" | "success" | "outline" }
> = {
  draft: { label: "Draft", variant: "secondary" },
  published: { label: "Published", variant: "success" },
  archived: { label: "Archived", variant: "outline" },
};

export const DEPARTURE_STATUS_LABELS: Record<
  DepartureStatus,
  { label: string; className: string }
> = {
  available: { label: "Available", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  limited: { label: "Limited Seats", className: "bg-amber-100 text-amber-800 border-amber-200" },
  last_few: { label: "Last Few Seats", className: "bg-orange-100 text-orange-800 border-orange-200" },
  sold_out: { label: "Sold Out", className: "bg-red-100 text-red-800 border-red-200" },
  guaranteed: { label: "Guaranteed", className: "bg-teal-100 text-teal-800 border-teal-200" },
  booking_closed: { label: "Booking Closed", className: "bg-gray-100 text-gray-700 border-gray-200" },
  cancelled: { label: "Cancelled", className: "bg-red-50 text-red-700 border-red-300 border-dashed" },
};

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;
