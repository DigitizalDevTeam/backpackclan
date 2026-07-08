<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Departure;
use App\Models\Trip;
use App\Support\ActivityLogger;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartureController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Departure::query()->with('trip')->orderBy('start_date');

        if ($tripId = $request->query('trip')) {
            $query->where('trip_id', $tripId);
        }

        if ($month = $request->query('month')) {
            $query->whereYear('start_date', substr($month, 0, 4))
                ->whereMonth('start_date', substr($month, 5, 2));
        }

        $departures = $query->get();

        return response()->json([
            'success' => true,
            'data' => $departures->map(fn (Departure $d) => array_merge(
                $d->toApiArray(),
                ['tripTitle' => $d->trip?->title ?? '']
            ))->values(),
        ]);
    }

    public function calendar(Request $request): JsonResponse
    {
        $month = $request->query('month', now()->format('Y-m'));

        $departures = Departure::query()
            ->with('trip')
            ->whereYear('start_date', substr($month, 0, 4))
            ->whereMonth('start_date', substr($month, 5, 2))
            ->orderBy('start_date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $departures->map(fn (Departure $d) => [
                'id' => (string) $d->id,
                'tripId' => (string) $d->trip_id,
                'tripTitle' => $d->trip?->title ?? '',
                'startDate' => $d->start_date?->format('Y-m-d'),
                'endDate' => $d->end_date?->format('Y-m-d'),
                'totalSeats' => $d->total_seats,
                'bookedSeats' => $d->booked_seats,
                'status' => $d->resolveEffectiveStatus(),
            ])->values(),
        ]);
    }

    public function show(Departure $departure): JsonResponse
    {
        $departure->load('trip');

        return response()->json([
            'success' => true,
            'data' => array_merge($departure->toApiArray(), [
                'tripTitle' => $departure->trip?->title ?? '',
            ]),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $departure = Departure::query()->create($this->validated($request));
        $departure->load('trip');
        ActivityLogger::log("New departure for trip \"{$departure->trip?->title}\"", 'departures');

        return response()->json(['success' => true, 'data' => $departure->toApiArray()], 201);
    }

    public function update(Request $request, Departure $departure): JsonResponse
    {
        $departure->update($this->validated($request));
        $departure->load('trip');
        ActivityLogger::log("Departure updated for \"{$departure->trip?->title}\"", 'departures');

        return response()->json(['success' => true, 'data' => $departure->fresh()->toApiArray()]);
    }

    public function destroy(Departure $departure): JsonResponse
    {
        $title = $departure->trip?->title ?? 'trip';
        $departure->delete();
        ActivityLogger::log("Departure deleted for \"{$title}\"", 'departures');

        return response()->json(['success' => true]);
    }

    public function bulk(Request $request): JsonResponse
    {
        $data = $request->validate([
            'tripId' => ['required', 'integer', 'exists:trips,id'],
            'rangeStart' => ['required', 'date'],
            'rangeEnd' => ['required', 'date', 'after_or_equal:rangeStart'],
            'recurrence' => ['required', 'in:weekly,biweekly'],
            'totalSeats' => ['required', 'integer', 'min:1'],
        ]);

        $trip = Trip::query()->findOrFail($data['tripId']);
        $stepWeeks = $data['recurrence'] === 'weekly' ? 1 : 2;
        $current = Carbon::parse($data['rangeStart'])->startOfDay();
        $end = Carbon::parse($data['rangeEnd'])->startOfDay();
        $created = [];

        while ($current->lte($end)) {
            $start = $current->copy();
            $endDate = $start->copy()->addDays($trip->duration_nights);

            $departure = Departure::query()->create([
                'trip_id' => $trip->id,
                'start_date' => $start->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'total_seats' => $data['totalSeats'],
                'booked_seats' => 0,
            ]);
            $created[] = $departure->toApiArray();
            $current->addWeeks($stepWeeks);
        }

        ActivityLogger::log('Bulk created '.count($created).' departures', 'departures');

        return response()->json(['success' => true, 'data' => $created], 201);
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        $data = $request->validate([
            'tripId' => ['required', 'integer', 'exists:trips,id'],
            'startDate' => ['required', 'date'],
            'endDate' => ['required', 'date'],
            'totalSeats' => ['required', 'integer', 'min:1'],
            'bookedSeats' => ['nullable', 'integer', 'min:0'],
            'isGuaranteed' => ['nullable', 'boolean'],
            'isBookingClosedManual' => ['nullable', 'boolean'],
            'bookingClosedAt' => ['nullable', 'date'],
            'isCancelled' => ['nullable', 'boolean'],
            'cancellationDeadline' => ['nullable', 'date'],
            'pricingOverride' => ['nullable', 'array'],
            'internalNotes' => ['nullable', 'string'],
            'statusOverride' => ['nullable', 'string'],
            'statusOverrideReason' => ['nullable', 'string'],
        ]);

        $booked = $data['bookedSeats'] ?? 0;
        if ($booked > $data['totalSeats']) {
            abort(422, 'Booked seats cannot exceed total seats');
        }

        return [
            'trip_id' => $data['tripId'],
            'start_date' => $data['startDate'],
            'end_date' => $data['endDate'],
            'total_seats' => $data['totalSeats'],
            'booked_seats' => $booked,
            'is_guaranteed' => $data['isGuaranteed'] ?? false,
            'is_booking_closed_manual' => $data['isBookingClosedManual'] ?? false,
            'booking_closed_at' => $data['bookingClosedAt'] ?? null,
            'is_cancelled' => $data['isCancelled'] ?? false,
            'cancellation_deadline' => $data['cancellationDeadline'] ?? null,
            'pricing_override' => $this->mapPricingOverride($data['pricingOverride'] ?? null),
            'internal_notes' => $data['internalNotes'] ?? '',
            'status_override' => $data['statusOverride'] ?? null,
            'status_override_reason' => $data['statusOverrideReason'] ?? '',
        ];
    }

    /**
     * @param  array<string, mixed>|null  $pricing
     * @return array<string, mixed>|null
     */
    private function mapPricingOverride(?array $pricing): ?array
    {
        if (! $pricing) {
            return null;
        }

        return [
            'base_price' => $pricing['basePrice'] ?? $pricing['base_price'] ?? 0,
            'sale_price' => $pricing['salePrice'] ?? $pricing['sale_price'] ?? null,
            'show_strike_through' => $pricing['showStrikeThrough'] ?? $pricing['show_strike_through'] ?? false,
            'offer_label' => $pricing['offerLabel'] ?? $pricing['offer_label'] ?? '',
            'offer_valid_until' => $pricing['offerValidUntil'] ?? $pricing['offer_valid_until'] ?? null,
            'currency' => $pricing['currency'] ?? 'INR',
            'price_per' => $pricing['pricePer'] ?? $pricing['price_per'] ?? 'person',
        ];
    }
}
