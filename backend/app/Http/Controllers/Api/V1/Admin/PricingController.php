<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Departure;
use App\Models\Trip;
use App\Support\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PricingController extends Controller
{
    public function index(): JsonResponse
    {
        $trips = Trip::query()
            ->orderBy('title')
            ->get();

        $departureOverrides = Departure::query()
            ->with('trip')
            ->whereNotNull('pricing_override')
            ->orderBy('start_date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'trips' => $trips->map(function (Trip $trip) {
                    $overrideCount = $trip->departures()
                        ->whereNotNull('pricing_override')
                        ->count();

                    return [
                        'id' => (string) $trip->id,
                        'title' => $trip->title,
                        'slug' => $trip->slug,
                        'status' => $trip->status,
                        'pricing' => $this->mapPricing($trip->pricing ?? []),
                        'departuresWithOverride' => $overrideCount,
                        'resolved' => $this->resolvePricing($trip->pricing ?? []),
                    ];
                })->values(),
                'departureOverrides' => $departureOverrides->map(function (Departure $departure) {
                    $tripPricing = $this->mapPricing($departure->trip?->pricing ?? []);
                    $override = $this->mapPricing($departure->pricing_override ?? []);

                    return [
                        'id' => (string) $departure->id,
                        'tripId' => (string) $departure->trip_id,
                        'tripTitle' => $departure->trip?->title ?? '',
                        'startDate' => $departure->start_date?->format('Y-m-d'),
                        'endDate' => $departure->end_date?->format('Y-m-d'),
                        'tripPricing' => $tripPricing,
                        'pricingOverride' => $override,
                        'resolved' => $this->resolvePricing($tripPricing, $override),
                    ];
                })->values(),
            ],
        ]);
    }

    public function updateTrip(Request $request, Trip $trip): JsonResponse
    {
        $data = $request->validate([
            'pricing' => ['required', 'array'],
            'pricing.basePrice' => ['required', 'integer', 'min:0'],
            'pricing.salePrice' => ['nullable', 'integer', 'min:0'],
            'pricing.showStrikeThrough' => ['required', 'boolean'],
            'pricing.offerLabel' => ['nullable', 'string'],
            'pricing.offerValidUntil' => ['nullable', 'date'],
            'pricing.currency' => ['required', 'string', 'in:INR'],
            'pricing.pricePer' => ['required', 'string', 'in:person,bike,couple'],
            'pricing.dynamicPricing' => ['nullable', 'array'],
            'pricing.dynamicPricing.enabled' => ['nullable', 'boolean'],
            'pricing.dynamicPricing.riderEnabled' => ['nullable', 'boolean'],
            'pricing.dynamicPricing.roomEnabled' => ['nullable', 'boolean'],
            'pricing.dynamicPricing.riders' => ['nullable', 'array'],
            'pricing.dynamicPricing.rooms' => ['nullable', 'array'],
            'pricing.dynamicPricing.matrix' => ['nullable', 'array'],
        ]);

        $trip->update([
            'pricing' => $this->mapPricingInput($data['pricing']),
        ]);

        ActivityLogger::log("Pricing updated for \"{$trip->title}\"", 'pricing');

        $trip->load(['destination', 'categories']);

        return response()->json(['success' => true, 'data' => $trip->toApiArray()]);
    }

    /**
     * @param  array<string, mixed>  $pricing
     * @return array<string, mixed>
     */
    private function mapPricing(array $pricing): array
    {
        $mapped = [
            'basePrice' => (int) ($pricing['base_price'] ?? $pricing['basePrice'] ?? 0),
            'salePrice' => isset($pricing['sale_price']) || isset($pricing['salePrice'])
                ? (int) ($pricing['sale_price'] ?? $pricing['salePrice'])
                : null,
            'showStrikeThrough' => (bool) ($pricing['show_strike_through'] ?? $pricing['showStrikeThrough'] ?? false),
            'offerLabel' => (string) ($pricing['offer_label'] ?? $pricing['offerLabel'] ?? ''),
            'offerValidUntil' => $pricing['offer_valid_until'] ?? $pricing['offerValidUntil'] ?? null,
            'currency' => 'INR',
            'pricePer' => (string) ($pricing['price_per'] ?? $pricing['pricePer'] ?? 'person'),
        ];

        $dynamic = $pricing['dynamic_pricing'] ?? $pricing['dynamicPricing'] ?? null;
        if (is_array($dynamic)) {
            $mapped['dynamicPricing'] = \App\Support\DynamicPricing::mapInput(
                $dynamic,
                $mapped['basePrice']
            );
        }

        return $mapped;
    }

    /**
     * @param  array<string, mixed>  $pricing
     * @return array<string, mixed>
     */
    private function mapPricingInput(array $pricing): array
    {
        $basePrice = (int) $pricing['basePrice'];
        $mapped = [
            'base_price' => $basePrice,
            'sale_price' => $pricing['salePrice'] ?? null,
            'show_strike_through' => $pricing['showStrikeThrough'],
            'offer_label' => $pricing['offerLabel'] ?? '',
            'offer_valid_until' => $pricing['offerValidUntil'] ?? null,
            'currency' => 'INR',
            'price_per' => $pricing['pricePer'],
        ];

        if (array_key_exists('dynamicPricing', $pricing) && is_array($pricing['dynamicPricing'])) {
            $mapped['dynamic_pricing'] = \App\Support\DynamicPricing::mapInput(
                $pricing['dynamicPricing'],
                $basePrice
            );
        }

        return $mapped;
    }

    /**
     * @param  array<string, mixed>  $tripPricing
     * @param  array<string, mixed>|null  $override
     * @return array<string, mixed>
     */
    private function resolvePricing(array $tripPricing, ?array $override = null): array
    {
        $pricing = $this->mapPricing($override ?? $tripPricing);
        $offerActive = $this->isSaleActive($pricing);

        return [
            'basePrice' => $pricing['basePrice'],
            'displayPrice' => $offerActive ? $pricing['salePrice'] : $pricing['basePrice'],
            'salePrice' => $offerActive ? $pricing['salePrice'] : null,
            'showStrikeThrough' => $offerActive && $pricing['showStrikeThrough'],
            'offerLabel' => $offerActive ? $pricing['offerLabel'] : null,
            'offerActive' => $offerActive,
            'pricePer' => $pricing['pricePer'],
            'currency' => 'INR',
            'source' => $override ? 'departure' : 'trip',
        ];
    }

    /**
     * @param  array<string, mixed>  $pricing
     */
    private function isSaleActive(array $pricing): bool
    {
        if (! empty($pricing['offerValidUntil']) && now()->gt($pricing['offerValidUntil'])) {
            return false;
        }

        $sale = $pricing['salePrice'] ?? null;

        return $sale !== null && $sale > 0 && $sale < $pricing['basePrice'];
    }
}
