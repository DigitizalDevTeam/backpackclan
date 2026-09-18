import { laravelFetch, useLaravelApi } from "@/lib/api/backend";
import type { PublicTrip, TripDetailContent } from "@/types/trip";
import {
  getAllTrips as getMockTrips,
  getFeaturedTrips as getMockFeaturedTrips,
  getTripBySlug as getMockTripBySlug,
} from "@/lib/mock/trip-store";
import { getTripDetail as getMockTripDetail } from "@/lib/mock/trip-detail-store";
import {
  emptyPaginationMeta,
  paginateArray,
  type PaginationMeta,
} from "@/lib/site/pagination";

type LaravelListResponse = {
  success?: boolean;
  data?:
    | PublicTrip[]
    | {
        items?: PublicTrip[];
        meta?: PaginationMeta;
        facets?: {
          destinations?: string[];
          categories?: string[];
        };
      };
};

type LaravelDetailResponse = {
  success?: boolean;
  data?: {
    trip?: PublicTrip;
    detail?: TripDetailContent;
    related?: PublicTrip[];
  };
};

type LaravelSlugsResponse = {
  success?: boolean;
  data?: string[];
};

export interface TripDetailData {
  trip: PublicTrip;
  detail: TripDetailContent;
  related: PublicTrip[];
  mediaMap?: Record<string, string>;
}

export interface TripListParams {
  page?: number;
  perPage?: number;
  featured?: boolean;
  destination?: string;
  category?: string;
  region?: string;
  search?: string;
  month?: string;
  minNights?: number;
  maxNights?: number;
}

export interface TripListData {
  trips: PublicTrip[];
  meta: PaginationMeta;
  facets: {
    destinations: string[];
    categories: string[];
  };
}

function normalizeTrip(trip: PublicTrip): PublicTrip {
  return {
    ...trip,
    imageId: trip.imageId || "1",
    departureDates: trip.departureDates ?? [],
    availableMonths: trip.availableMonths ?? [],
  };
}

/** Prefer same destination/category within ±35% price, then nearest price overall. */
export function filterRelatedTrips(
  trips: PublicTrip[],
  current: PublicTrip,
  limit = 4
): PublicTrip[] {
  const spread = 0.35;
  const minPrice = Math.round(current.price * (1 - spread));
  const maxPrice = Math.round(current.price * (1 + spread));
  const byPriceProximity = (a: PublicTrip, b: PublicTrip) =>
    Math.abs(a.price - current.price) - Math.abs(b.price - current.price);

  const others = trips.filter((t) => t.slug !== current.slug);
  const sameFamily = (t: PublicTrip) =>
    t.destination === current.destination || t.category === current.category;
  const inPriceBand = (t: PublicTrip) => t.price >= minPrice && t.price <= maxPrice;

  const primary = others.filter((t) => sameFamily(t) && inPriceBand(t)).sort(byPriceProximity);
  if (primary.length >= limit) return primary.slice(0, limit);

  const priceOnly = others.filter(inPriceBand).sort(byPriceProximity);
  const familyOnly = others.filter(sameFamily).sort(byPriceProximity);
  const nearestPrice = [...others].sort(byPriceProximity);

  const seen = new Set<string>();
  return [...primary, ...priceOnly, ...familyOnly, ...nearestPrice]
    .filter((t) => {
      if (seen.has(t.slug)) return false;
      seen.add(t.slug);
      return true;
    })
    .slice(0, limit);
}

function buildTripQuery(params?: TripListParams): string {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.perPage) query.set("per_page", String(params.perPage));
  if (params?.featured) query.set("featured", "1");
  if (params?.destination) query.set("destination", params.destination);
  if (params?.category) query.set("category", params.category);
  if (params?.region && params.region !== "all") query.set("region", params.region);
  if (params?.search) query.set("search", params.search);
  if (params?.month) query.set("month", params.month);
  if (params?.minNights != null) query.set("min_nights", String(params.minNights));
  if (params?.maxNights != null) query.set("max_nights", String(params.maxNights));
  return query.toString();
}

function normalizeCategoryValue(value: string): string {
  return value
    .toLowerCase()
    .replace(/[_/\\]+/g, " ")
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function categoryMatchesFilter(trip: PublicTrip, filter: string): boolean {
  const tripValue = normalizeCategoryValue(trip.category);
  const filterValue = normalizeCategoryValue(filter);

  if (!filterValue) return true;
  if (tripValue === filterValue) return true;
  if (tripValue.includes(filterValue) || filterValue.includes(tripValue)) return true;

  if (filterValue.includes("international") && trip.region === "international") return true;
  if (filterValue.includes("custom") && tripValue.includes("custom")) return true;

  return false;
}

function mockFilterTrips(params?: TripListParams): PublicTrip[] {
  let trips = getMockTrips();
  if (params?.featured) trips = trips.filter((t) => t.isFeatured);
  if (params?.destination) {
    trips = trips.filter(
      (t) =>
        t.destination.toLowerCase() === params.destination!.toLowerCase() ||
        t.destinationSlug === params.destination
    );
  }
  if (params?.category) {
    trips = trips.filter((t) => categoryMatchesFilter(t, params.category!));
  }
  if (params?.region && params.region !== "all") {
    trips = trips.filter((t) => t.region === params.region);
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    trips = trips.filter((t) =>
      `${t.title} ${t.destination} ${t.route} ${t.category}`.toLowerCase().includes(q)
    );
  }
  if (params?.month) {
    trips = trips.filter((t) => t.availableMonths.includes(params.month!));
  }
  if (params?.minNights != null) {
    trips = trips.filter((t) => t.nights >= params.minNights!);
  }
  if (params?.maxNights != null) {
    trips = trips.filter((t) => t.nights <= params.maxNights!);
  }
  return trips;
}

export async function getPublicTripsPage(
  params?: TripListParams
): Promise<TripListData> {
  const perPage = params?.perPage ?? 12;
  const page = params?.page ?? 1;

  if (useLaravelApi()) {
    try {
      const qs = buildTripQuery({ ...params, page, perPage });
      const { res, data } = await laravelFetch<LaravelListResponse>(
        `/v1/trips${qs ? `?${qs}` : ""}`
      );
      if (res.ok && data.success && data.data && !Array.isArray(data.data)) {
        return {
          trips: (data.data.items ?? []).map(normalizeTrip),
          meta: data.data.meta ?? emptyPaginationMeta(perPage),
          facets: {
            destinations: data.data.facets?.destinations ?? [],
            categories: data.data.facets?.categories ?? [],
          },
        };
      }
      if (res.ok && data.success && Array.isArray(data.data)) {
        const all = data.data.map(normalizeTrip);
        const paged = paginateArray(all, page, perPage);
        return {
          trips: paged.items,
          meta: paged.meta,
          facets: {
            destinations: [...new Set(all.map((t) => t.destination))].sort(),
            categories: [...new Set(all.map((t) => t.category))].sort(),
          },
        };
      }
    } catch {
      // fall through
    }
  }

  const filtered = mockFilterTrips(params);
  const paged = paginateArray(filtered, page, perPage);
  return {
    trips: paged.items,
    meta: paged.meta,
    facets: {
      destinations: [...new Set(getMockTrips().map((t) => t.destination))].sort(),
      categories: [...new Set(getMockTrips().map((t) => t.category))].sort(),
    },
  };
}

/** Convenience for non-listing callers (homepage featured, etc.). */
export async function getPublicTrips(params?: {
  featured?: boolean;
  destination?: string;
  category?: string;
  limit?: number;
}): Promise<PublicTrip[]> {
  const result = await getPublicTripsPage({
    featured: params?.featured,
    destination: params?.destination,
    category: params?.category,
    page: 1,
    perPage: params?.limit ?? 48,
  });
  return result.trips;
}

export async function getFeaturedPublicTrips(limit = 8): Promise<PublicTrip[]> {
  const trips = await getPublicTrips({ featured: true, limit });
  if (trips.length > 0) return trips.slice(0, limit);
  return getMockFeaturedTrips(limit);
}

export async function getPublicTripBySlug(slug: string): Promise<PublicTrip | null> {
  const detail = await getPublicTripDetail(slug);
  return detail?.trip ?? null;
}

export async function getPublicTripDetail(
  slug: string
): Promise<TripDetailData | null> {
  if (useLaravelApi()) {
    try {
      const { res, data } = await laravelFetch<LaravelDetailResponse>(
        `/v1/trips/${encodeURIComponent(slug)}`
      );
      if (res.ok && data.success && data.data?.trip && data.data.detail) {
        const trip = normalizeTrip(data.data.trip);
        const apiRelated = (data.data.related ?? []).map(normalizeTrip);
        return {
          trip,
          detail: data.data.detail,
          related: filterRelatedTrips(
            apiRelated.length > 0 ? apiRelated : [trip],
            trip,
            4
          ),
        };
      }
    } catch {
      // fall through
    }
  }

  const trip = getMockTripBySlug(slug);
  if (!trip) return null;
  return {
    trip,
    detail: getMockTripDetail(trip),
    related: filterRelatedTrips(getMockTrips(), trip, 4),
  };
}

export async function getPublicTripSlugs(): Promise<string[]> {
  if (useLaravelApi()) {
    try {
      const { res, data } = await laravelFetch<LaravelSlugsResponse>(
        "/v1/trips/slugs"
      );
      if (res.ok && data.success && Array.isArray(data.data)) {
        return data.data;
      }
    } catch {
      // fall through
    }
  }
  return getMockTrips().map((t) => t.slug);
}
