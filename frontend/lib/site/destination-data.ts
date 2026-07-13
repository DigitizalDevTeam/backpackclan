import { laravelFetch, useLaravelApi } from "@/lib/api/backend";
import type { Destination } from "@/types/destination";
import type { PublicTrip } from "@/types/trip";
import {
  getDestinationBySlug as getMockBySlug,
  getPublishedDestinations,
} from "@/lib/mock/destination-store";

type LaravelListResponse = {
  success?: boolean;
  data?: Destination[];
};

type LaravelDetailResponse = {
  success?: boolean;
  data?: {
    destination?: Destination;
    trips?: PublicTrip[];
  };
};

export interface DestinationDetailData {
  destination: Destination;
  trips: PublicTrip[];
}

export async function getPublishedDestinationsAsync(
  params?: { featured?: boolean }
): Promise<Destination[]> {
  if (useLaravelApi()) {
    try {
      const query = new URLSearchParams();
      if (params?.featured) query.set("featured", "1");
      const qs = query.toString();
      const { res, data } = await laravelFetch<LaravelListResponse>(
        `/v1/destinations${qs ? `?${qs}` : ""}`
      );
      if (res.ok && data.success && Array.isArray(data.data)) {
        return data.data;
      }
    } catch {
      // fall through
    }
  }

  let destinations = getPublishedDestinations();
  if (params?.featured) {
    destinations = destinations.filter((d) => d.isFeatured);
  }
  return destinations.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getDestinationDetail(
  slug: string
): Promise<DestinationDetailData | null> {
  if (useLaravelApi()) {
    try {
      const { res, data } = await laravelFetch<LaravelDetailResponse>(
        `/v1/destinations/${encodeURIComponent(slug)}`
      );
      if (res.ok && data.success && data.data?.destination) {
        return {
          destination: data.data.destination,
          trips: data.data.trips ?? [],
        };
      }
    } catch {
      // fall through
    }
  }

  const destination = getMockBySlug(slug);
  if (!destination || destination.status !== "published") return null;
  return { destination, trips: [] };
}

export async function getDestinationByIdAsync(
  id: string,
  catalog?: Destination[]
): Promise<Destination | null> {
  const list = catalog ?? (await getPublishedDestinationsAsync());
  return list.find((d) => d.id === id) ?? null;
}
