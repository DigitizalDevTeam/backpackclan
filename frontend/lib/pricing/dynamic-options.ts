import type {
  DynamicPricingConfig,
  TravelOptionKey,
  RoomOptionKey,
  TripPricing,
} from "@/types/travel";

export const TRAVEL_OPTION_LABELS: Record<TravelOptionKey, string> = {
  own_bike: "Own Bike",
  solo: "Solo Rider",
  dual: "Dual Rider",
  coach: "Seat in Coach",
};

/** @deprecated use TRAVEL_OPTION_LABELS */
export const RIDER_OPTION_LABELS = TRAVEL_OPTION_LABELS;

export const ROOM_OPTION_LABELS: Record<RoomOptionKey, string> = {
  single: "Single Sharing",
  double: "Double Sharing",
  triple: "Triple Sharing",
};

export const TRAVEL_OPTION_KEYS: TravelOptionKey[] = [
  "own_bike",
  "solo",
  "dual",
  "coach",
];

/** @deprecated use TRAVEL_OPTION_KEYS */
export const RIDER_OPTION_KEYS = TRAVEL_OPTION_KEYS;

export const ROOM_OPTION_KEYS: RoomOptionKey[] = ["single", "double", "triple"];

export function emptyRoomPrices(): DynamicPricingConfig["rooms"] {
  return { single: null, double: null, triple: null };
}

function emptyTravelPrices(
  seed: number | null = null
): Record<TravelOptionKey, number | null> {
  return {
    own_bike: seed,
    solo: seed,
    dual: seed,
    coach: seed,
  };
}

function emptyMatrix(
  seed: number | null = null
): Record<TravelOptionKey, DynamicPricingConfig["rooms"]> {
  return {
    own_bike: { single: seed, double: seed, triple: seed },
    solo: { single: seed, double: seed, triple: seed },
    dual: { single: seed, double: seed, triple: seed },
    coach: { single: seed, double: seed, triple: seed },
  };
}

export function defaultDynamicPricing(
  basePrice = 0,
  opts?: { forBike?: boolean }
): DynamicPricingConfig {
  const seed = basePrice > 0 ? basePrice : null;
  const forBike = opts?.forBike ?? true;
  return {
    enabled: false,
    travelEnabled: forBike,
    roomEnabled: true,
    travel: emptyTravelPrices(seed),
    rooms: emptyRoomPrices(),
    matrix: emptyMatrix(seed),
  };
}

export function defaultDynamicPricingForTripType(
  tripType: string | undefined,
  basePrice = 0
): DynamicPricingConfig {
  const isBike = (tripType ?? "").toLowerCase() === "bike";
  return defaultDynamicPricing(basePrice, { forBike: isBike });
}

function roomFrom(
  obj: Record<string, unknown> | undefined,
  num: (v: unknown) => number | null
) {
  return {
    single: num(obj?.single),
    double: num(obj?.double),
    triple: num(obj?.triple),
  };
}

export function normalizeDynamicPricing(
  raw: unknown,
  basePrice = 0
): DynamicPricingConfig {
  const fallback = defaultDynamicPricing(basePrice);
  if (!raw || typeof raw !== "object") return fallback;
  const d = raw as Record<string, unknown>;

  const travelRaw = (d.travel ?? d.riders ?? {}) as Record<string, unknown>;
  const roomsRaw = (d.rooms ?? {}) as Record<string, unknown>;
  const matrixRaw = (d.matrix ?? {}) as Record<string, unknown>;

  const num = (v: unknown): number | null => {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
  };

  const matrix: DynamicPricingConfig["matrix"] = emptyMatrix(null);
  for (const key of TRAVEL_OPTION_KEYS) {
    matrix[key] = roomFrom(
      (matrixRaw[key] ?? {}) as Record<string, unknown>,
      num
    );
  }

  // Legacy solo/dual-only matrix → keep values on solo/dual rows
  if (!matrixRaw.own_bike && !matrixRaw.coach) {
    // already read solo/dual above if present
  }

  const travelEnabled =
    d.travelEnabled !== undefined
      ? Boolean(d.travelEnabled)
      : d.riderEnabled !== false;

  return {
    enabled: Boolean(d.enabled),
    travelEnabled,
    roomEnabled: d.roomEnabled !== false,
    travel: {
      own_bike:
        num(travelRaw.own_bike) ??
        matrix.own_bike.triple ??
        fallback.travel.own_bike,
      solo: num(travelRaw.solo) ?? matrix.solo.triple ?? fallback.travel.solo,
      dual: num(travelRaw.dual) ?? matrix.dual.triple ?? fallback.travel.dual,
      coach: num(travelRaw.coach) ?? matrix.coach.triple ?? fallback.travel.coach,
    },
    rooms: {
      single: num(roomsRaw.single) ?? matrix.solo.single,
      double: num(roomsRaw.double) ?? matrix.solo.double,
      triple: num(roomsRaw.triple) ?? matrix.solo.triple,
    },
    matrix,
  };
}

export function enabledTravelOptions(
  config: DynamicPricingConfig
): TravelOptionKey[] {
  if (!config.enabled || !config.travelEnabled) return [];
  if (config.roomEnabled) {
    return TRAVEL_OPTION_KEYS.filter((travel) =>
      ROOM_OPTION_KEYS.some((room) => (config.matrix[travel][room] ?? 0) > 0)
    );
  }
  return TRAVEL_OPTION_KEYS.filter((travel) => (config.travel[travel] ?? 0) > 0);
}

/** @deprecated use enabledTravelOptions */
export const enabledRiderOptions = enabledTravelOptions;

export function enabledRoomOptions(
  config: DynamicPricingConfig,
  travel?: TravelOptionKey | null
): RoomOptionKey[] {
  if (!config.enabled || !config.roomEnabled) return [];
  if (config.travelEnabled) {
    const t =
      travel && enabledTravelOptions(config).includes(travel) ? travel : null;
    if (!t) {
      return ROOM_OPTION_KEYS.filter((room) =>
        TRAVEL_OPTION_KEYS.some((tk) => (config.matrix[tk][room] ?? 0) > 0)
      );
    }
    return ROOM_OPTION_KEYS.filter((room) => (config.matrix[t][room] ?? 0) > 0);
  }
  return ROOM_OPTION_KEYS.filter((room) => (config.rooms[room] ?? 0) > 0);
}

export function resolveDynamicUnitPrice(
  config: DynamicPricingConfig | null | undefined,
  selection: { travel?: TravelOptionKey | null; room?: RoomOptionKey | null; rider?: TravelOptionKey | null }
): number | null {
  if (!config?.enabled) return null;

  const travel = selection.travel ?? selection.rider ?? null;
  const { room } = selection;

  if (config.travelEnabled && config.roomEnabled) {
    if (!travel || !room) return null;
    const price = config.matrix[travel]?.[room] ?? null;
    return price && price > 0 ? price : null;
  }

  if (config.travelEnabled) {
    if (!travel) return null;
    const price = config.travel[travel] ?? null;
    return price && price > 0 ? price : null;
  }

  if (config.roomEnabled) {
    if (!room) return null;
    const price = config.rooms[room] ?? null;
    return price && price > 0 ? price : null;
  }

  return null;
}

export function minDynamicPrice(
  config: DynamicPricingConfig | null | undefined
): number | null {
  if (!config?.enabled) return null;
  const prices: number[] = [];

  if (config.travelEnabled && config.roomEnabled) {
    for (const travel of TRAVEL_OPTION_KEYS) {
      for (const room of ROOM_OPTION_KEYS) {
        const p = config.matrix[travel][room];
        if (p && p > 0) prices.push(p);
      }
    }
  } else if (config.travelEnabled) {
    for (const travel of TRAVEL_OPTION_KEYS) {
      const p = config.travel[travel];
      if (p && p > 0) prices.push(p);
    }
  } else if (config.roomEnabled) {
    for (const room of ROOM_OPTION_KEYS) {
      const p = config.rooms[room];
      if (p && p > 0) prices.push(p);
    }
  }

  if (!prices.length) return null;
  return Math.min(...prices);
}

export function resolveTripUnitPrice(
  pricing: TripPricing,
  selection?: {
    travel?: TravelOptionKey | null;
    room?: RoomOptionKey | null;
    rider?: TravelOptionKey | null;
  }
): number {
  const dynamic = normalizeDynamicPricing(
    pricing.dynamicPricing,
    pricing.basePrice
  );
  if (dynamic.enabled && selection) {
    const optionPrice = resolveDynamicUnitPrice(dynamic, selection);
    if (optionPrice != null) return optionPrice;
  }

  const min = minDynamicPrice(dynamic);
  if (dynamic.enabled && min != null) return min;

  if (
    pricing.salePrice != null &&
    pricing.salePrice > 0 &&
    pricing.salePrice < pricing.basePrice
  ) {
    return pricing.salePrice;
  }
  return pricing.basePrice;
}
