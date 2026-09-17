"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Loader2,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import type { AuthUser } from "@/types/auth";
import type {
  BookingTraveler,
  TravelerGender,
  TravelerIdType,
} from "@/types/booking";
import type { PublicTrip, TripBatch, TripDetailContent } from "@/types/trip";
import type { TravelOptionKey, RoomOptionKey } from "@/types/travel";
import { DEFAULT_TRIP_ADDONS, type CouponValidation } from "@/lib/booking/pricing";
import {
  isInternationalTrip,
  maxTravelersForBatch,
  normalizeInternationalPax,
  travelerCountOptions,
} from "@/lib/booking/travelers";
import {
  enabledTravelOptions,
  enabledRoomOptions,
  normalizeDynamicPricing,
  resolveDynamicUnitPrice,
  TRAVEL_OPTION_LABELS,
  ROOM_OPTION_LABELS,
} from "@/lib/pricing/dynamic-options";
import { formatInr } from "@/lib/site/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Review" },
  { id: 2, label: "Travelers" },
  { id: 3, label: "Extras" },
] as const;

function emptyTraveler(
  seedName = "",
  defaults?: {
    travelOption?: TravelOptionKey | "" | null;
    roomOption?: RoomOptionKey | "" | null;
  }
): BookingTraveler {
  return {
    fullName: seedName,
    age: 25,
    gender: "male",
    idType: "aadhaar",
    idNumber: "",
    travelOption: defaults?.travelOption || null,
    roomOption: defaults?.roomOption || null,
  };
}

interface BookingCheckoutWizardProps {
  trip: PublicTrip;
  detail: TripDetailContent;
  initialDepartureId: string;
  initialAdults: number;
  initialChildren: number;
  initialTravelOption?: TravelOptionKey;
  initialRoomOption?: RoomOptionKey;
  user: AuthUser;
  imageUrl?: string | null;
}

export function BookingCheckoutWizard({
  trip,
  detail,
  initialDepartureId,
  initialAdults,
  initialChildren,
  initialTravelOption,
  initialRoomOption,
  user,
  imageUrl,
}: BookingCheckoutWizardProps) {
  const router = useRouter();
  const isInternational = isInternationalTrip(trip);
  const availableBatches = detail.batches.filter((b) => b.status !== "sold_out");

  const dynamicConfig = useMemo(() => {
    const opts = detail.pricingOptions;
    if (!opts?.enabled) return null;
    return normalizeDynamicPricing({
      enabled: opts.enabled,
      travelEnabled: opts.travelEnabled ?? opts.riderEnabled ?? false,
      roomEnabled: opts.roomEnabled,
      travel: opts.travelPrices ?? opts.riderPrices,
      rooms: opts.roomPrices,
      matrix: opts.matrix,
    });
  }, [detail.pricingOptions]);

  const travelChoices = useMemo(
    () => (dynamicConfig ? enabledTravelOptions(dynamicConfig) : []),
    [dynamicConfig]
  );

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [departureId, setDepartureId] = useState(
    availableBatches.some((b) => b.id === initialDepartureId)
      ? initialDepartureId
      : availableBatches[0]?.id ?? ""
  );
  const initialPax = isInternational
    ? normalizeInternationalPax(initialAdults, initialChildren)
    : {
        adults: Math.max(1, Math.min(12, initialAdults)),
        children: Math.max(0, Math.min(6, initialChildren)),
      };
  const [adults, setAdults] = useState(initialPax.adults);
  const [children, setChildren] = useState(initialPax.children);
  const [contactPhone, setContactPhone] = useState(user.phone ?? "");
  const [contactEmail, setContactEmail] = useState(user.email);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [travelers, setTravelers] = useState<BookingTraveler[]>(() => {
    const pax = Math.max(1, initialAdults) + Math.max(0, initialChildren);
    const seedTravel =
      initialTravelOption && travelChoices.includes(initialTravelOption)
        ? initialTravelOption
        : travelChoices[0] ?? null;
    const seedRooms = dynamicConfig
      ? enabledRoomOptions(dynamicConfig, seedTravel)
      : [];
    const seedRoom =
      initialRoomOption && seedRooms.includes(initialRoomOption)
        ? initialRoomOption
        : seedRooms[0] ?? null;
    return Array.from({ length: pax }, (_, i) =>
      emptyTraveler(i === 0 ? user.name : "", {
        travelOption: seedTravel,
        roomOption: seedRoom,
      })
    );
  });

  const addons = detail.addons?.length ? detail.addons : DEFAULT_TRIP_ADDONS;

  const selectedBatch: TripBatch | undefined = availableBatches.find(
    (b) => b.id === departureId
  );
  const maxTravelers = maxTravelersForBatch(selectedBatch?.seatsLeft);
  const travelerOptions = travelerCountOptions(maxTravelers);
  const pax = adults + children;
  const baseUnitPrice = selectedBatch?.price ?? trip.price;

  const travelerLinePrices = useMemo(() => {
    return travelers.map((t) => {
      if (!dynamicConfig?.enabled) return baseUnitPrice;
      return resolveDynamicUnitPrice(dynamicConfig, {
        travel: t.travelOption ?? null,
        room: t.roomOption ?? null,
      });
    });
  }, [travelers, dynamicConfig, baseUnitPrice]);

  const tripSubtotal = travelerLinePrices.reduce<number>(
    (sum, price) => sum + (price ?? 0),
    0
  );
  const mixedPricing =
    Boolean(dynamicConfig?.enabled) &&
    new Set(travelerLinePrices.filter((p): p is number => p != null)).size > 1;
  const sharedTravel =
    travelers.length > 0 &&
    travelers.every((t) => t.travelOption === travelers[0]?.travelOption)
      ? travelers[0]?.travelOption ?? null
      : null;
  const sharedRoom =
    travelers.length > 0 &&
    travelers.every((t) => t.roomOption === travelers[0]?.roomOption)
      ? travelers[0]?.roomOption ?? null
      : null;
  const addonsTotal = addons
    .filter((a) => selectedAddonIds.includes(a.id))
    .reduce((sum, a) => {
      const qty = a.pricingType === "flat" ? 1 : pax;
      return sum + a.price * qty;
    }, 0);
  const preDiscountTotal = tripSubtotal + addonsTotal;
  const discountAmount = appliedCoupon?.discount ?? 0;
  const totalAmount = Math.max(0, preDiscountTotal - discountAmount);

  const seatsOk = (selectedBatch?.seatsLeft ?? 0) >= pax;

  useEffect(() => {
    if (!isInternational) return;
    const next = normalizeInternationalPax(Math.min(pax, maxTravelers), 0);
    if (next.adults !== adults || next.children !== children) {
      setAdults(next.adults);
      setChildren(next.children);
      syncTravelerCount(next.adults, next.children);
    }
  }, [isInternational, maxTravelers, departureId, pax, adults, children]);

  const reviewIssues = useMemo(() => {
    const issues: string[] = [];
    if (!selectedBatch) issues.push("Select a departure batch");
    if (!seatsOk) issues.push("Not enough seats for this party size");
    return issues;
  }, [selectedBatch, seatsOk]);

  function syncTravelerCount(nextAdults: number, nextChildren: number) {
    const nextPax = nextAdults + nextChildren;
    setTravelers((prev) => {
      if (prev.length === nextPax) return prev;
      if (prev.length < nextPax) {
        const fromExisting = prev[0];
        const travel =
          fromExisting?.travelOption ?? travelChoices[0] ?? null;
        const rooms = dynamicConfig
          ? enabledRoomOptions(dynamicConfig, travel)
          : [];
        const room =
          fromExisting?.roomOption &&
          (!rooms.length || rooms.includes(fromExisting.roomOption))
            ? fromExisting.roomOption
            : rooms[0] ?? null;
        const extras = Array.from({ length: nextPax - prev.length }, (_, i) =>
          emptyTraveler(prev.length + i === 0 ? user.name : "", {
            travelOption: travel,
            roomOption: room,
          })
        );
        return [...prev, ...extras];
      }
      return prev.slice(0, nextPax);
    });
  }

  function updateTraveler<K extends keyof BookingTraveler>(
    index: number,
    key: K,
    value: BookingTraveler[K]
  ) {
    setTravelers((prev) =>
      prev.map((t, i) => {
        if (i !== index) return t;
        const next = { ...t, [key]: value };
        if (key === "travelOption" && dynamicConfig) {
          const rooms = enabledRoomOptions(
            dynamicConfig,
            (value as TravelOptionKey | null) ?? null
          );
          if (next.roomOption && !rooms.includes(next.roomOption)) {
            next.roomOption = rooms[0] ?? null;
          }
        }
        return next;
      })
    );
    setAppliedCoupon(null);
  }

  function validateTravelers(): string | null {
    for (let i = 0; i < travelers.length; i++) {
      const t = travelers[i];
      if (!t.fullName.trim()) return `Enter full name for traveler ${i + 1}`;
      if (!t.age || t.age < 1) return `Enter a valid age for traveler ${i + 1}`;
      if (!t.idNumber.trim()) return `Enter ID number for traveler ${i + 1}`;
      if (dynamicConfig?.enabled) {
        if (dynamicConfig.travelEnabled && !t.travelOption) {
          return `Select a travel option for traveler ${i + 1}`;
        }
        if (dynamicConfig.roomEnabled && !t.roomOption) {
          return `Select a room sharing option for traveler ${i + 1}`;
        }
        if (travelerLinePrices[i] == null) {
          return `Pricing not available for traveler ${i + 1}'s options`;
        }
      }
    }
    if (!contactPhone.trim()) return "Enter a contact phone number";
    if (!contactEmail.trim()) return "Enter a contact email";
    if (!acceptedTerms) return "Please accept the terms and cancellation policy";
    return null;
  }

  function toggleAddon(id: string) {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setAppliedCoupon(null);
  }

  async function applyCoupon() {
    if (!couponInput.trim()) {
      toast.error("Enter a coupon code");
      return;
    }
    setCouponLoading(true);
    try {
      const res = await fetch("/api/customer/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponInput.trim(),
          subtotal: preDiscountTotal,
          tripSlug: trip.slug,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAppliedCoupon(null);
        toast.error(data.errors?.form || "Invalid coupon");
        return;
      }
      setAppliedCoupon(data.data);
      toast.success(`Coupon applied — saved ${formatInr(data.data.discount)}`);
    } catch {
      toast.error("Could not validate coupon");
    } finally {
      setCouponLoading(false);
    }
  }

  async function handleSubmit() {
    const error = validateTravelers();
    if (error) {
      toast.error(error);
      return;
    }
    if (!selectedBatch) {
      toast.error("Select a departure batch");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/customer/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripSlug: trip.slug,
          departureId,
          adults,
          children,
          travelers: travelers.map((t, i) => ({
            fullName: t.fullName,
            age: t.age,
            gender: t.gender,
            idType: t.idType,
            idNumber: t.idNumber,
            travelOption: t.travelOption || undefined,
            roomOption: t.roomOption || undefined,
            unitPrice: travelerLinePrices[i] ?? undefined,
          })),
          contactPhone: contactPhone.trim(),
          contactEmail: contactEmail.trim(),
          acceptedTerms: true,
          couponCode: appliedCoupon?.code,
          addonIds: selectedAddonIds,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.errors?.form || "Could not create booking");
        return;
      }

      toast.success("Booking created — complete payment to confirm");
      router.push(`/book/pay/${encodeURIComponent(data.data.id)}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (availableBatches.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center">
        <h1 className="text-xl font-bold">No open batches</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This trip currently has no available departures to book.
        </p>
        <Button asChild className="mt-6">
          <Link href={`/trips/${trip.slug}`}>Back to trip</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="min-w-0 space-y-6">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                  step === s.id
                    ? "bg-primary text-white"
                    : step > s.id
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 text-slate-500"
                )}
              >
                {step > s.id ? <Check className="h-4 w-4" /> : s.id}
              </div>
              <span
                className={cn(
                  "text-sm font-medium",
                  step === s.id ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 ? (
                <div className="mx-2 h-px w-8 bg-slate-200 sm:w-12" />
              ) : null}
            </div>
          ))}
        </div>

        {step === 1 ? (
          <section className="rounded-2xl border bg-white p-5 sm:p-6">
            <h1 className="text-xl font-bold sm:text-2xl">Review your trip</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Confirm batch and party size before adding guest details
              {dynamicConfig?.enabled
                ? ". Travel and room options are chosen per person next."
                : "."}
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <Label htmlFor="batch">Departure batch</Label>
                <select
                  id="batch"
                  value={departureId}
                  onChange={(e) => setDepartureId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {availableBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.date}
                      {!dynamicConfig?.enabled ? ` — ${formatInr(b.price)}` : ""} (
                      {b.seatsLeft} seats left)
                    </option>
                  ))}
                </select>
              </div>

              {isInternational ? (
                <div>
                  <Label htmlFor="travelers">Number of travellers</Label>
                  <select
                    id="travelers"
                    value={Math.min(pax, maxTravelers)}
                    onChange={(e) => {
                      const next = normalizeInternationalPax(Number(e.target.value), 0);
                      setAdults(next.adults);
                      setChildren(next.children);
                      syncTravelerCount(next.adults, next.children);
                    }}
                    className="mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm"
                  >
                    {travelerOptions.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="adults">Adults</Label>
                    <select
                      id="adults"
                      value={adults}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        setAdults(next);
                        syncTravelerCount(next, children);
                      }}
                      className="mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="children">Children</Label>
                    <select
                      id="children"
                      value={children}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        setChildren(next);
                        syncTravelerCount(adults, next);
                      }}
                      className="mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm"
                    >
                      {[0, 1, 2, 3, 4].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {reviewIssues.length > 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {reviewIssues.join(". ")}
                </div>
              ) : null}

              <div className="rounded-xl border bg-slate-50 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Cancellation snapshot</p>
                <ul className="mt-2 space-y-1">
                  {detail.cancellationPolicy.slice(0, 3).map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-primary">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <Button asChild variant="ghost">
                <Link href={`/trips/${trip.slug}`}>
                  <ArrowLeft className="h-4 w-4" />
                  Back to trip
                </Link>
              </Button>
              <Button
                disabled={reviewIssues.length > 0}
                onClick={() => setStep(2)}
                className="gap-2"
              >
                Continue to travelers
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </section>
        ) : step === 2 ? (
          <section className="rounded-2xl border bg-white p-5 sm:p-6">
            <h1 className="text-xl font-bold sm:text-2xl">Traveler details</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Add details for all {pax} traveler{pax > 1 ? "s" : ""}. Lead traveler
              will be the primary contact
              {dynamicConfig?.enabled
                ? ". Each person can choose their own travel and room option."
                : "."}
            </p>

            <div className="mt-6 space-y-6">
              {travelers.map((traveler, index) => {
                const travelerRooms = dynamicConfig
                  ? enabledRoomOptions(dynamicConfig, traveler.travelOption ?? null)
                  : [];
                const linePrice = travelerLinePrices[index];
                return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 p-4 sm:p-5"
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-semibold">
                      Traveler {index + 1}
                      {index === 0 ? (
                        <span className="ml-2 text-xs font-normal text-primary">
                          Lead
                        </span>
                      ) : null}
                    </h2>
                    {dynamicConfig?.enabled && linePrice != null ? (
                      <span className="text-sm font-semibold text-primary">
                        {formatInr(linePrice)}
                      </span>
                    ) : null}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label>Full name</Label>
                      <Input
                        className="mt-1.5"
                        value={traveler.fullName}
                        onChange={(e) =>
                          updateTraveler(index, "fullName", e.target.value)
                        }
                        placeholder="As on government ID"
                      />
                    </div>
                    <div>
                      <Label>Age</Label>
                      <Input
                        className="mt-1.5"
                        type="number"
                        min={1}
                        max={100}
                        value={traveler.age}
                        onChange={(e) =>
                          updateTraveler(index, "age", Number(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div>
                      <Label>Gender</Label>
                      <select
                        className="mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm"
                        value={traveler.gender}
                        onChange={(e) =>
                          updateTraveler(
                            index,
                            "gender",
                            e.target.value as TravelerGender
                          )
                        }
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <Label>ID type</Label>
                      <select
                        className="mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm"
                        value={traveler.idType}
                        onChange={(e) =>
                          updateTraveler(
                            index,
                            "idType",
                            e.target.value as TravelerIdType
                          )
                        }
                      >
                        <option value="aadhaar">Aadhaar</option>
                        <option value="passport">Passport</option>
                        <option value="dl">Driving licence</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <Label>ID number</Label>
                      <Input
                        className="mt-1.5"
                        value={traveler.idNumber}
                        onChange={(e) =>
                          updateTraveler(index, "idNumber", e.target.value)
                        }
                        placeholder="ID number"
                      />
                    </div>
                    {travelChoices.length > 0 ? (
                      <div className="sm:col-span-2">
                        <Label>Travel option</Label>
                        <div className="mt-1.5 grid grid-cols-2 gap-2">
                          {travelChoices.map((key) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() =>
                                updateTraveler(index, "travelOption", key)
                              }
                              className={cn(
                                "rounded-xl border px-3 py-2 text-sm font-semibold transition",
                                traveler.travelOption === key
                                  ? "border-primary bg-primary/5 text-primary"
                                  : "border-slate-200 hover:border-slate-300"
                              )}
                            >
                              {TRAVEL_OPTION_LABELS[key]}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {travelerRooms.length > 0 ? (
                      <div className="sm:col-span-2">
                        <Label>Room sharing</Label>
                        <div className="mt-1.5 grid gap-2 sm:grid-cols-3">
                          {travelerRooms.map((key) => {
                            const price = dynamicConfig
                              ? resolveDynamicUnitPrice(dynamicConfig, {
                                  travel: traveler.travelOption ?? null,
                                  room: key,
                                })
                              : null;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() =>
                                  updateTraveler(index, "roomOption", key)
                                }
                                className={cn(
                                  "flex flex-col items-start rounded-xl border px-3 py-2 text-left text-sm font-semibold transition",
                                  traveler.roomOption === key
                                    ? "border-primary bg-primary/5 text-primary"
                                    : "border-slate-200 hover:border-slate-300"
                                )}
                              >
                                <span>{ROOM_OPTION_LABELS[key]}</span>
                                {price ? (
                                  <span className="mt-0.5 text-xs font-normal opacity-80">
                                    {formatInr(price)}
                                  </span>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
                );
              })}

              <div className="rounded-xl border border-slate-200 p-4 sm:p-5">
                <h2 className="mb-4 font-semibold">Lead contact</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Phone</Label>
                    <Input
                      className="mt-1.5"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91…"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      className="mt-1.5"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-3 rounded-xl border bg-slate-50 p-4 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />
                <span>
                  I agree to the{" "}
                  <Link href="/terms" className="font-medium text-primary underline">
                    terms
                  </Link>{" "}
                  and understand the cancellation policy for this trip.
                </span>
              </label>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <Button variant="ghost" onClick={() => setStep(1)} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={() => {
                  const error = validateTravelers();
                  if (error) {
                    toast.error(error);
                    return;
                  }
                  setStep(3);
                }}
                className="gap-2 bg-primary"
              >
                Continue to extras
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border bg-white p-5 sm:p-6">
            <h1 className="text-xl font-bold sm:text-2xl">Add-ons & coupon</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Optional upgrades and promo codes before payment.
            </p>

            <div className="mt-6 space-y-4">
              {addons.map((addon) => {
                const checked = selectedAddonIds.includes(addon.id);
                const qty = addon.pricingType === "flat" ? 1 : pax;
                return (
                  <label
                    key={addon.id}
                    className={cn(
                      "flex cursor-pointer gap-3 rounded-xl border p-4 transition",
                      checked
                        ? "border-primary bg-primary/5 ring-2 ring-primary/15"
                        : "hover:border-slate-300"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={checked}
                      onChange={() => toggleAddon(addon.id)}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="font-semibold">{addon.name}</p>
                        <p className="text-sm font-bold">
                          {formatInr(addon.price)}
                          <span className="ml-1 text-xs font-normal text-muted-foreground">
                            {addon.pricingType === "flat" ? "flat" : "× person"}
                          </span>
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {addon.description}
                      </p>
                      {checked ? (
                        <p className="mt-2 text-xs text-primary">
                          Adds {formatInr(addon.price * qty)} to your total
                        </p>
                      ) : null}
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="mt-6 rounded-xl border p-4">
              <Label htmlFor="coupon">Promo code</Label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <Input
                  id="coupon"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME10"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={applyCoupon}
                  disabled={couponLoading}
                  className="shrink-0"
                >
                  {couponLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Apply"
                  )}
                </Button>
              </div>
              {appliedCoupon ? (
                <p className="mt-2 text-sm text-emerald-700">
                  {appliedCoupon.code} applied — {formatInr(appliedCoupon.discount)} off
                  <button
                    type="button"
                    className="ml-2 underline"
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponInput("");
                    }}
                  >
                    Remove
                  </button>
                </p>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">
                  Try WELCOME10 or EARLYBIRD500
                </p>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <Button variant="ghost" onClick={() => setStep(2)} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="gap-2 bg-primary"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating booking…
                  </>
                ) : (
                  <>
                    Confirm booking & pay
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </section>
        )}
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="overflow-hidden rounded-2xl border bg-white shadow-lg ring-1 ring-slate-100">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="h-36 w-full object-cover" />
          ) : (
            <div className="h-36 bg-slate-100" />
          )}
          <div className="space-y-4 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Booking summary
              </p>
              <h2 className="mt-1 text-lg font-bold leading-snug">{trip.title}</h2>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {trip.destination}
              </p>
              {mixedPricing ? (
                <p className="text-xs text-muted-foreground">
                  Mixed options — price is the sum of each traveler&apos;s package.
                </p>
              ) : sharedTravel ? (
                <p className="text-xs">
                  Travel:{" "}
                  <span className="font-medium text-foreground">
                    {TRAVEL_OPTION_LABELS[sharedTravel]}
                  </span>
                  {sharedRoom ? (
                    <>
                      {" · "}
                      Room:{" "}
                      <span className="font-medium text-foreground">
                        {ROOM_OPTION_LABELS[sharedRoom]}
                      </span>
                    </>
                  ) : null}
                </p>
              ) : dynamicConfig?.enabled ? (
                <p className="text-xs text-muted-foreground">
                  Travel &amp; room options are chosen per person on the Travelers step.
                </p>
              ) : null}
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                {selectedBatch?.date ?? "Select batch"}
              </p>
              <p className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                {adults} adult{adults > 1 ? "s" : ""}
                {children > 0 ? `, ${children} child${children > 1 ? "ren" : ""}` : ""}
              </p>
            </div>
            <div className="space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {mixedPricing || dynamicConfig?.enabled
                    ? `Trip package (${pax} traveler${pax > 1 ? "s" : ""})`
                    : `Trip (${formatInr(baseUnitPrice)} × ${pax})`}
                </span>
                <span className="font-medium">{formatInr(tripSubtotal)}</span>
              </div>
              {dynamicConfig?.enabled && travelers.length > 1 ? (
                <ul className="space-y-1 border-l-2 border-slate-100 pl-3 text-xs text-muted-foreground">
                  {travelers.map((t, i) => (
                    <li key={i} className="flex justify-between gap-2">
                      <span className="truncate">
                        T{i + 1}
                        {t.travelOption
                          ? ` · ${TRAVEL_OPTION_LABELS[t.travelOption]}`
                          : ""}
                        {t.roomOption
                          ? ` / ${ROOM_OPTION_LABELS[t.roomOption]}`
                          : ""}
                      </span>
                      <span className="shrink-0 font-medium text-foreground">
                        {travelerLinePrices[i] != null
                          ? formatInr(travelerLinePrices[i]!)
                          : "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {addonsTotal > 0 ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Add-ons</span>
                  <span className="font-medium">{formatInr(addonsTotal)}</span>
                </div>
              ) : null}
              {discountAmount > 0 ? (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span className="font-medium">−{formatInr(discountAmount)}</span>
                </div>
              ) : null}
              <div className="mt-2 flex items-baseline justify-between border-t pt-3">
                <span className="font-semibold">Total due</span>
                <span className="text-2xl font-bold">{formatInr(totalAmount)}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Next: Stripe payment (deposit or full).
              </p>
            </div>
            <div className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs text-emerald-800">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              Secure checkout — seats reserved when your booking is confirmed.
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
