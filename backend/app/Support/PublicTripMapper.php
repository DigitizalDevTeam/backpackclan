<?php

namespace App\Support;

use App\Models\Departure;
use App\Models\Trip;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class PublicTripMapper
{
    /**
     * @return array<string, mixed>
     */
    public static function toCard(Trip $trip): array
    {
        $destination = $trip->relationLoaded('destination')
            ? $trip->destination
            : $trip->destination()->first();

        if (! $trip->relationLoaded('categories')) {
            $trip->load('categories');
        }
        if (! $trip->relationLoaded('departures')) {
            $trip->load('departures');
        }

        $destinationName = $destination?->name ?? 'Unknown';
        $region = ($destination?->country ?? 'India') === 'India' ? 'domestic' : 'international';
        $primaryCategory = $trip->categories->first()?->name ?? 'Group Tour';

        $pricing = CamelCase::convert($trip->pricing ?? []);
        $basePrice = (int) ($pricing['basePrice'] ?? $pricing['base_price'] ?? 0);
        $salePrice = isset($pricing['salePrice'])
            ? (int) $pricing['salePrice']
            : (isset($pricing['sale_price']) ? (int) $pricing['sale_price'] : null);
        $showStrike = (bool) ($pricing['showStrikeThrough'] ?? $pricing['show_strike_through'] ?? false);
        $saleActive = $salePrice !== null && $salePrice > 0 && $salePrice < $basePrice;
        $displayPrice = $saleActive ? $salePrice : $basePrice;

        $futureDepartures = $trip->departures
            ->filter(fn (Departure $d) => ! $d->is_cancelled && $d->start_date && $d->start_date->isFuture())
            ->sortBy('start_date')
            ->values();

        $departureDates = $futureDepartures
            ->take(3)
            ->map(fn (Departure $d) => $d->start_date->format('j M Y'))
            ->values()
            ->all();

        $availableMonths = $futureDepartures
            ->map(fn (Departure $d) => strtolower($d->start_date->format('M')))
            ->unique()
            ->values()
            ->all();

        $testimonials = $trip->testimonials ?? [];
        $reviewCount = max(count($testimonials) * 40 + 20, 20);
        $rating = collect($testimonials)->avg('rating') ?: 4.8;

        return [
            'id' => (string) $trip->id,
            'slug' => $trip->slug,
            'title' => $trip->title,
            'destination' => $destinationName,
            'destinationId' => (string) $trip->destination_id,
            'destinationSlug' => $destination?->slug,
            'duration' => $trip->duration_nights.'N/'.$trip->duration_days.'D',
            'nights' => (int) $trip->duration_nights,
            'route' => Str::limit($trip->summary ?? '', 120, ''),
            'price' => $displayPrice,
            'originalPrice' => $saleActive && $showStrike ? $basePrice : null,
            'imageId' => $trip->cover_image_id ? (string) $trip->cover_image_id : null,
            'category' => $primaryCategory,
            'categoryIds' => $trip->categories->pluck('id')->map(fn ($id) => (string) $id)->values()->all(),
            'region' => $region,
            'rating' => round((float) $rating, 1),
            'reviewCount' => $reviewCount,
            'isFeatured' => (bool) $trip->is_featured,
            'departureDates' => $departureDates,
            'extraBatches' => max($futureDepartures->count() - 3, 0) ?: null,
            'availableMonths' => $availableMonths,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function toDetail(Trip $trip): array
    {
        $card = self::toCard($trip);
        $overview = CamelCase::convert($trip->overview ?? []);
        $overviewContent = (string) ($overview['content'] ?? '');
        $highlights = collect($overview['highlights'] ?? [])
            ->map(fn ($h) => is_array($h) ? (string) ($h['text'] ?? '') : (string) $h)
            ->filter()
            ->values()
            ->all();

        $itinerary = collect($trip->itinerary ?? [])->map(function ($day, $index) {
            $day = CamelCase::convert(is_array($day) ? $day : []);
            $meals = $day['meals'] ?? [];
            $mealParts = [];
            if (is_array($meals)) {
                if (! empty($meals['breakfast'])) {
                    $mealParts[] = 'Breakfast';
                }
                if (! empty($meals['lunch'])) {
                    $mealParts[] = 'Lunch';
                }
                if (! empty($meals['dinner'])) {
                    $mealParts[] = 'Dinner';
                }
            } elseif (is_string($meals) && $meals !== '') {
                $mealParts[] = $meals;
            }

            return [
                'day' => (int) ($day['dayNumber'] ?? $day['day'] ?? ($index + 1)),
                'title' => (string) ($day['title'] ?? 'Day '.($index + 1)),
                'description' => (string) ($day['description'] ?? ''),
                'meals' => $mealParts ? implode(', ', $mealParts) : null,
                'overnight' => $day['overnight'] ?? null,
            ];
        })->values()->all();

        $mapRepeater = fn ($items) => collect($items ?? [])
            ->map(fn ($item) => is_array($item) ? (string) ($item['text'] ?? '') : (string) $item)
            ->filter()
            ->values()
            ->all();

        $faqs = collect($trip->faqs ?? [])->map(function ($faq, $index) {
            $faq = CamelCase::convert(is_array($faq) ? $faq : []);

            return [
                'id' => (string) ($faq['id'] ?? 'f'.($index + 1)),
                'question' => (string) ($faq['question'] ?? ''),
                'answer' => (string) ($faq['answer'] ?? ''),
            ];
        })->values()->all();

        $reviews = collect($trip->testimonials ?? [])->map(function ($t, $index) {
            $t = CamelCase::convert(is_array($t) ? $t : []);

            return [
                'id' => (string) ($t['id'] ?? 'r'.($index + 1)),
                'name' => (string) ($t['name'] ?? 'Traveler'),
                'date' => Carbon::parse($t['createdAt'] ?? $t['date'] ?? now())->format('Y-m-d'),
                'rating' => (int) ($t['rating'] ?? 5),
                'text' => (string) ($t['text'] ?? ''),
            ];
        })->values()->all();

        $batches = $trip->departures
            ->filter(fn (Departure $d) => ! $d->is_cancelled && $d->start_date && $d->start_date->isFuture())
            ->sortBy('start_date')
            ->values()
            ->map(function (Departure $d) use ($card) {
                $status = match ($d->resolveEffectiveStatus()) {
                    'limited', 'last_few' => 'filling_fast',
                    'sold_out', 'cancelled', 'booking_closed' => 'sold_out',
                    default => 'available',
                };
                $override = CamelCase::convert($d->pricing_override ?? []);
                $price = (int) ($override['salePrice'] ?? $override['basePrice'] ?? $card['price']);

                return [
                    'id' => (string) $d->id,
                    'date' => $d->start_date->format('j M Y'),
                    'status' => $status,
                    'price' => $price > 0 ? $price : $card['price'],
                    'seatsLeft' => $d->availableSeats(),
                ];
            })
            ->all();

        $difficulty = ucfirst(str_replace('_', ' ', (string) $trip->difficulty));

        return [
            'slug' => $trip->slug,
            'overview' => $overviewContent !== '' ? $overviewContent : $card['route'],
            'overviewExtended' => $highlights
                ? implode(' ', $highlights)
                : ($trip->summary ?? ''),
            'galleryImageIds' => array_map('strval', $trip->gallery ?? []),
            'quickFacts' => [
                ['label' => 'Duration', 'value' => $card['duration']],
                ['label' => 'Difficulty', 'value' => $difficulty],
                ['label' => 'Category', 'value' => $card['category']],
                ['label' => 'Max group', 'value' => (string) ($trip->max_group_size ?: '—')],
            ],
            'startPoint' => $card['destination'],
            'endPoint' => $card['destination'],
            'maxAltitude' => null,
            'difficulty' => $difficulty,
            'itinerary' => $itinerary,
            'inclusions' => $mapRepeater($trip->inclusions),
            'exclusions' => $mapRepeater($trip->exclusions),
            'thingsToCarry' => [],
            'faqs' => $faqs,
            'cancellationPolicy' => [
                '30+ days before departure: Full refund minus processing fee',
                '15–30 days: 50% refund',
                'Less than 15 days: No refund',
            ],
            'refundPolicy' => [
                'Refunds processed within 7–10 business days',
                'Date change allowed once, subject to availability',
            ],
            'batches' => $batches,
            'reviews' => $reviews,
        ];
    }
}
