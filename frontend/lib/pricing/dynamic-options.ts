import type {
  DynamicPricingConfig,
  RiderOptionKey,
  RoomOptionKey,
  TripPricing,
} from "@/types/travel";

export const RIDER_OPTION_LABELS: Record<RiderOptionKey, string> = {
  solo: "Solo Rider",
  dual: "Dual Rider",
};

export const ROOM_OPTION_LABELS: Record<RoomOptionKey, string> = {
  triple: "Triple Sharing",
  double: "Double Sharing",
  single: "Single Sharing",
};

export const RIDER_OPTION_KEYS: RiderOptionKey[] = ["solo", "dual"];
export const ROOM_OPTION_KEYS: RoomOptionKey[] = ["triple", "double", "single"];

export function emptyRoomPrices(): DynamicPricingConfig["rooms"] {
  return { triple: null, double: null, single: null };
}

export function defaultDynamicPricing(
  basePrice = 0
): DynamicPricingConfig {
  const seed = basePrice > 0 ? basePrice : null;
  return {
    enabled: false,
    riderEnabled: true,
    roomEnabled: true,
    riders: { solo: seed, dual: seed },
    rooms: emptyRoomPrices(),
    matrix: {
      solo: { triple: seed, double: seed, single: seed },
      dual: { triple: seed, double: seed, single: seed },
    },
  };
}

export function normalizeDynamicPricing(
  raw: unknown,
  basePrice = 0
): DynamicPricingConfig {
  const fallback = defaultDynamicPricing(basePrice);
  if (!raw || typeof raw !== "object") return fallback;
  const d = raw as Record<string, unknown>;
  const ridersRaw = (d.riders ?? {}) as Record<string, unknown>;
  const roomsRaw = (d.rooms ?? {}) as Record<string, unknown>;
  const matrixRaw = (d.matrix ?? {}) as Record<string, unknown>;

  const num = (v: unknown): number | null => {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
  };

  const roomFrom = (obj: Record<string, unknown> | undefined) => ({
    triple: num(obj?.triple),
    double: num(obj?.double),
    single: num(obj?.single),
  });

  const soloMatrix = roomFrom(
    (matrixRaw.solo ?? {}) as Record<string, unknown>
  );
  const dualMatrix = roomFrom(
    (matrixRaw.dual ?? {}) as Record<string, unknown>
  );

  return {
    enabled: Boolean(d.enabled),
    riderEnabled: d.riderEnabled !== false,
    roomEnabled: d.roomEnabled !== false,
    riders: {
      solo: num(ridersRaw.solo) ?? soloMatrix.triple ?? fallback.riders.solo,
      dual: num(ridersRaw.dual) ?? dualMatrix.triple ?? fallback.riders.dual,
    },
    rooms: {
      triple: num(roomsRaw.triple) ?? soloMatrix.triple,
      double: num(roomsRaw.double) ?? soloMatrix.double,
      single: num(roomsRaw.single) ?? soloMatrix.single,
    },
    matrix: {
      solo: {
        triple: soloMatrix.triple ?? num(ridersRaw.solo),
        double: soloMatrix.double ?? num(ridersRaw.solo),
        single: soloMatrix.single ?? num(ridersRaw.solo),
      },
      dual: {
        triple: dualMatrix.triple ?? num(ridersRaw.dual),
        double: dualMatrix.double ?? num(ridersRaw.dual),
        single: dualMatrix.single ?? num(ridersRaw.dual),
      },
    },
  };
}

export function enabledRiderOptions(
  config: DynamicPricingConfig
): RiderOptionKey[] {
  if (!config.enabled || !config.riderEnabled) return [];
  if (config.roomEnabled) {
    return RIDER_OPTION_KEYS.filter((rider) =>
      ROOM_OPTION_KEYS.some((room) => (config.matrix[rider][room] ?? 0) > 0)
    );
  }
  return RIDER_OPTION_KEYS.filter((rider) => (config.riders[rider] ?? 0) > 0);
}

export function enabledRoomOptions(
  config: DynamicPricingConfig,
  rider?: RiderOptionKey | null
): RoomOptionKey[] {
  if (!config.enabled || !config.roomEnabled) return [];
  if (config.riderEnabled) {
    const r = rider && enabledRiderOptions(config).includes(rider) ? rider : null;
    if (!r) {
      return ROOM_OPTION_KEYS.filter((room) =>
        RIDER_OPTION_KEYS.some((rk) => (config.matrix[rk][room] ?? 0) > 0)
      );
    }
    return ROOM_OPTION_KEYS.filter((room) => (config.matrix[r][room] ?? 0) > 0);
  }
  return ROOM_OPTION_KEYS.filter((room) => (config.rooms[room] ?? 0) > 0);
}

export function resolveDynamicUnitPrice(
  config: DynamicPricingConfig | null | undefined,
  selection: { rider?: RiderOptionKey | null; room?: RoomOptionKey | null }
): number | null {
  if (!config?.enabled) return null;

  const { rider, room } = selection;

  if (config.riderEnabled && config.roomEnabled) {
    if (!rider || !room) return null;
    const price = config.matrix[rider]?.[room] ?? null;
    return price && price > 0 ? price : null;
  }

  if (config.riderEnabled) {
    if (!rider) return null;
    const price = config.riders[rider] ?? null;
    return price && price > 0 ? price : null;
  }

  if (config.roomEnabled) {
    if (!room) return null;
    const price = config.rooms[room] ?? null;
    return price && price > 0 ? price : null;
  }

  return null;
}

/** Lowest configured package price for "starting from" cards */
export function minDynamicPrice(
  config: DynamicPricingConfig | null | undefined
): number | null {
  if (!config?.enabled) return null;
  const prices: number[] = [];

  if (config.riderEnabled && config.roomEnabled) {
    for (const rider of RIDER_OPTION_KEYS) {
      for (const room of ROOM_OPTION_KEYS) {
        const p = config.matrix[rider][room];
        if (p && p > 0) prices.push(p);
      }
    }
  } else if (config.riderEnabled) {
    for (const rider of RIDER_OPTION_KEYS) {
      const p = config.riders[rider];
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
  selection?: { rider?: RiderOptionKey | null; room?: RoomOptionKey | null }
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
