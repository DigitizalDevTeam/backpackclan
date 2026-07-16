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

function filterRelatedTrips(trips: PublicTrip[], current: PublicTrip, limit = 3): PublicTrip[] {
  const minPrice = current.price;
  const maxPrice = current.price * 2;

  const matched = trips.filter(
    (t) =>
      t.slug !== current.slug &&
      (t.destination === current.destination || t.category === current.category) &&
      t.price >= minPrice &&
      t.price <= maxPrice
  );

  if (matched.length >= limit) {
    return matched.slice(0, limit);
  }

  const fallback = trips.filter(
    (t) =>
      t.slug !== current.slug &&
      (t.destination === current.destination || t.category === current.category)
  );

  const seen = new Set<string>();
  return [...matched, ...fallback]
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
    trips = trips.filter(
      (t) =>
        t.category.toLowerCase() === params.category!.toLowerCase() ||
        t.category.toLowerCase().includes(params.category!.toLowerCase())
    );
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
        return {
          trip: normalizeTrip(data.data.trip),
          detail: data.data.detail,
          related: (data.data.related ?? []).map(normalizeTrip),
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
    related: filterRelatedTrips(getMockTrips(), trip),
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
