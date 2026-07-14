import type {
  PublicTrip,
  TripBatch,
  TripDetailContent,
  TripItineraryDay,
  TripReview,
} from "@/types/trip";
import { DEFAULT_TRIP_ADDONS } from "@/lib/booking/pricing";

const LADAKH_ITINERARY: TripItineraryDay[] = [
  {
    day: 1,
    title: "Arrival in Manali — Briefing & Bike Allocation",
    description:
      "Arrive in Manali and check into the hotel. Evening team briefing, bike allocation, and a short orientation ride. Explore Mall Road and prepare for the epic journey ahead.",
    meals: "Dinner",
    overnight: "Manali",
  },
  {
    day: 2,
    title: "Manali to Jispa via Rohtang Pass",
    description:
      "Ride through the iconic Rohtang Pass (3,978m) into the Lahaul valley. Witness dramatic landscape changes from green hills to barren mountains. Overnight in Jispa.",
    meals: "Breakfast, Dinner",
    overnight: "Jispa",
  },
  {
    day: 3,
    title: "Jispa to Sarchu — Baralacha La",
    description:
      "Cross Baralacha La (4,890m) — one of the most scenic passes on the route. Ride through vast high-altitude plains with snow-capped peaks on all sides.",
    meals: "Breakfast, Dinner",
    overnight: "Sarchu (Camp)",
  },
  {
    day: 4,
    title: "Sarchu to Leh — Gata Loops & Tanglang La",
    description:
      "Conquer Tanglang La (5,328m), the second-highest motorable pass. Descend into the Indus valley and arrive in Leh. Rest and acclimatize.",
    meals: "Breakfast, Dinner",
    overnight: "Leh",
  },
  {
    day: 5,
    title: "Leh — Acclimatization & Local Sightseeing",
    description:
      "Rest day in Leh. Visit Shanti Stupa, Leh Palace, and local markets. Light walking to aid acclimatization before high-altitude rides ahead.",
    meals: "Breakfast",
    overnight: "Leh",
  },
  {
    day: 6,
    title: "Leh to Nubra Valley via Khardung La",
    description:
      "Ride over Khardung La (5,359m) — world's highest motorable pass. Descend into the Nubra Valley, visit Diskit Monastery and ride the sand dunes on double-humped camels.",
    meals: "Breakfast, Dinner",
    overnight: "Nubra Valley",
  },
  {
    day: 7,
    title: "Nubra Valley to Pangong Lake",
    description:
      "Scenic ride to the legendary Pangong Lake — the lake that changes colours. Watch the sunset over the turquoise waters with the Chang Chenmo range in the backdrop.",
    meals: "Breakfast, Dinner",
    overnight: "Pangong Lake (Camp)",
  },
  {
    day: 8,
    title: "Pangong Lake to Leh",
    description:
      "Return to Leh via Chang La. Optional stop at Hemis Monastery. Evening free to explore Leh market and shop for souvenirs.",
    meals: "Breakfast, Dinner",
    overnight: "Leh",
  },
  {
    day: 9,
    title: "Leh to Kargil",
    description:
      "Ride west through the dramatic Indus gorge. Visit Lamayuru Monastery — the moonland of Ladakh. Overnight in Kargil.",
    meals: "Breakfast, Dinner",
    overnight: "Kargil",
  },
  {
    day: 10,
    title: "Kargil to Srinagar via Zoji La",
    description:
      "Cross Zoji La pass and descend into the lush Kashmir valley. Arrive in Srinagar — the journey of a lifetime complete.",
    meals: "Breakfast, Dinner",
    overnight: "Srinagar",
  },
  {
    day: 11,
    title: "Departure from Srinagar",
    description:
      "Morning Shikara ride on Dal Lake (optional). Trip concludes after breakfast. Transfer to airport for onward journey.",
    meals: "Breakfast",
    overnight: "—",
  },
];

const DEFAULT_REVIEWS: TripReview[] = [
  {
    id: "r1",
    name: "Rahul Sharma",
    date: "2026-05-12",
    rating: 5,
    text: "Absolutely incredible experience! The team handled everything perfectly — bikes, permits, accommodation. Ladakh on a motorcycle is a dream come true.",
  },
  {
    id: "r2",
    name: "Priya Mehta",
    date: "2026-04-28",
    rating: 5,
    text: "Best travel company for Himalayan adventures. Our trip leader was knowledgeable and safety was always the priority. Highly recommended!",
  },
  {
    id: "r3",
    name: "Arjun Patel",
    date: "2026-03-15",
    rating: 4,
    text: "Great guides, beautiful scenery, and seamless organization throughout. The only reason for 4 stars is I wanted one more day in Leh!",
  },
];

function defaultBatches(trip: PublicTrip): TripBatch[] {
  const statuses: TripBatch["status"][] = ["available", "filling_fast", "available"];
  return trip.departureDates.map((date, i) => ({
    id: `b${i}`,
    date,
    status: statuses[i % statuses.length],
    price: trip.price + i * 1000,
    seatsLeft: 12 - i * 3,
  }));
}

function defaultItinerary(trip: PublicTrip): TripItineraryDay[] {
  const days = trip.nights + 1;
  return Array.from({ length: Math.min(days, 7) }, (_, i) => ({
    day: i + 1,
    title: `Day ${i + 1}: Exploring ${trip.destination}`,
    description: `Experience the highlights of ${trip.destination} on day ${i + 1}. Our expert guides ensure a safe and memorable adventure along ${trip.route}.`,
    meals: i === 0 ? "Dinner" : i === days - 1 ? "Breakfast" : "Breakfast, Dinner",
    overnight: trip.destination.split(" ")[0],
  }));
}

const DETAIL_OVERRIDES: Record<string, Partial<TripDetailContent>> = {
  "leh-ladakh-bike-expedition": {
    overview:
      "Experience the ultimate Himalayan motorcycle adventure — ride from Manali to Srinagar through the world's highest motorable passes, turquoise lakes, and ancient monasteries. This 11-day value edition covers Ladakh's most iconic routes with expert guides, quality bikes, and comfortable stays.",
    overviewExtended:
      "This is not just a bike trip — it's a rite of passage for every adventure seeker. Cross Rohtang, Baralacha La, Tanglang La, Khardung La, and more. Camp under starlit skies at Pangong Lake, ride through Nubra's sand dunes, and witness landscapes that feel otherworldly. Our experienced road captains, mechanic support vehicle, and oxygen cylinders ensure your safety at every altitude.",
    galleryImageIds: ["1", "2", "7", "5", "3"],
    quickFacts: [
      { label: "Duration", value: "10N / 11D" },
      { label: "Max Altitude", value: "5,359m" },
      { label: "Difficulty", value: "Moderate–Challenging" },
      { label: "Start / End", value: "Manali → Srinagar" },
    ],
    startPoint: "Manali",
    endPoint: "Srinagar",
    maxAltitude: "5,359m (Khardung La)",
    difficulty: "Moderate to Challenging",
    itinerary: LADAKH_ITINERARY,
    inclusions: [
      "Royal Enfield Himalayan 411cc bike with fuel",
      "Accommodation on twin-sharing basis (hotels + camps)",
      "11 breakfasts & 9 dinners as per itinerary",
      "Experienced road captain & mechanic",
      "Support vehicle with oxygen cylinder",
      "Inner Line Permits & all tolls",
      "Riding gear (helmet, gloves, knee guards)",
    ],
    exclusions: [
      "Flights / train to Manali & from Srinagar",
      "Lunch on all days",
      "Personal expenses & tips",
      "Travel insurance (mandatory)",
      "Damage to bike beyond normal wear",
      "Anything not mentioned in inclusions",
    ],
    thingsToCarry: [
      "Valid driving license & 4 passport-size photos",
      "Warm layers, rain jacket, riding gloves",
      "Sunscreen SPF 50+, sunglasses, lip balm",
      "Personal medicines & Diamox (consult doctor)",
      "Power bank, camera, dry bag for electronics",
    ],
    faqs: [
      {
        id: "f1",
        question: "Do I need prior motorcycle riding experience?",
        answer:
          "Yes, you should be comfortable riding a 350cc+ motorcycle for 6–8 hours daily. We recommend at least 1 year of riding experience on highways and hills.",
      },
      {
        id: "f2",
        question: "What happens if I can't ride due to altitude sickness?",
        answer:
          "Our support vehicle can accommodate riders who need to rest. We carry oxygen cylinders and our team is trained in high-altitude first aid.",
      },
      {
        id: "f3",
        question: "Can I ride pillion?",
        answer:
          "Yes, pillion riders are welcome at an additional cost. The pillion can switch to the support vehicle on difficult days if needed.",
      },
      {
        id: "f4",
        question: "What is the cancellation policy?",
        answer:
          "Free cancellation up to 30 days before departure. 50% refund between 15–30 days. No refund within 15 days of departure.",
      },
    ],
    cancellationPolicy: [
      "30+ days before departure: Full refund minus ₹2,000 processing fee",
      "15–30 days before departure: 50% refund",
      "7–14 days before departure: 25% refund",
      "Less than 7 days: No refund",
    ],
    refundPolicy: [
      "Refunds processed within 7–10 business days to original payment method",
      "Date change allowed once, subject to availability (₹3,000 fee)",
      "Force majeure cancellations: Full credit for future trip within 12 months",
    ],
    batches: [
      { id: "b1", date: "8 Jul 2026", status: "filling_fast", price: 24999, seatsLeft: 4 },
      { id: "b2", date: "11 Jul 2026", status: "available", price: 24999, seatsLeft: 12 },
      { id: "b3", date: "18 Jul 2026", status: "available", price: 25999, seatsLeft: 10 },
      { id: "b4", date: "25 Jul 2026", status: "filling_fast", price: 25999, seatsLeft: 3 },
      { id: "b5", date: "1 Aug 2026", status: "available", price: 26999, seatsLeft: 14 },
    ],
    reviews: DEFAULT_REVIEWS,
  },
};

export function getTripDetail(trip: PublicTrip): TripDetailContent {
  const override = DETAIL_OVERRIDES[trip.slug];
  const routeParts = trip.route.split(" - ");
  const start = routeParts[0] ?? trip.destination;
  const end = routeParts[routeParts.length - 1] ?? trip.destination;

  return {
    slug: trip.slug,
    overview:
      override?.overview ??
      `Discover the magic of ${trip.destination} on this ${trip.duration} ${trip.category.toLowerCase()}. ${trip.route} — expertly curated by Backpackclan with comfortable stays, experienced guides, and unforgettable experiences.`,
    overviewExtended:
      override?.overviewExtended ??
      `Join fellow travelers on an adventure across ${trip.destination}. Our team handles logistics, permits, and safety so you can focus on the experience. With a ${trip.rating}★ rating from ${trip.reviewCount}+ travelers, this trip is one of our most loved Himalayan experiences.`,
    galleryImageIds: override?.galleryImageIds ?? [trip.imageId, "2", "7", "3"],
    quickFacts: override?.quickFacts ?? [
      { label: "Duration", value: trip.duration },
      { label: "Category", value: trip.category },
      { label: "Region", value: trip.region === "domestic" ? "India" : "International" },
      { label: "Route", value: trip.route },
    ],
    startPoint: override?.startPoint ?? start,
    endPoint: override?.endPoint ?? end,
    maxAltitude: override?.maxAltitude,
    difficulty: override?.difficulty ?? "Moderate",
    itinerary: override?.itinerary ?? defaultItinerary(trip),
    inclusions: override?.inclusions ?? [
      "Accommodation on twin-sharing basis",
      "Meals as per itinerary",
      "Experienced trip leader & local guides",
      "All permits and entry fees",
      "Transport as per itinerary",
    ],
    exclusions: override?.exclusions ?? [
      "Flights / train tickets",
      "Personal expenses & tips",
      "Travel insurance",
      "Anything not mentioned in inclusions",
    ],
    thingsToCarry: override?.thingsToCarry ?? [
      "Valid government ID",
      "Warm clothing & rain gear",
      "Comfortable trekking shoes",
      "Personal medicines",
      "Sunscreen & sunglasses",
    ],
    faqs: override?.faqs ?? [
      {
        id: "f1",
        question: "What fitness level is required?",
        answer: "A moderate fitness level is recommended. You should be able to walk 5–8 km comfortably.",
      },
      {
        id: "f2",
        question: "Is this trip suitable for solo travelers?",
        answer: "Absolutely! 60% of our travelers join solo and leave with new friends.",
      },
    ],
    cancellationPolicy: override?.cancellationPolicy ?? [
      "30+ days before departure: Full refund minus processing fee",
      "15–30 days: 50% refund",
      "Less than 15 days: No refund",
    ],
    refundPolicy: override?.refundPolicy ?? [
      "Refunds processed within 7–10 business days",
      "Date change allowed once, subject to availability",
    ],
    batches: override?.batches ?? defaultBatches(trip),
    reviews: override?.reviews ?? DEFAULT_REVIEWS,
    addons: override?.addons ?? DEFAULT_TRIP_ADDONS,
  };
}

export function getTripDetailBySlug(slug: string, trip: PublicTrip | null): TripDetailContent | null {
  if (!trip) return null;
  return getTripDetail(trip);
}
