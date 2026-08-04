<?php

namespace App\Support;

use App\Models\Departure;
use App\Models\Trip;
use App\Models\TripReview;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class PublicTripMapper
{
    /**
     * @return array{rating: float, reviewCount: int}
     */
    private static function reviewStats(Trip $trip): array
    {
        $testimonials = collect($trip->testimonials ?? []);
        $customerReviews = $trip->relationLoaded('tripReviews')
            ? $trip->tripReviews->where('status', TripReview::STATUS_APPROVED)
            : collect();

        $ratings = $testimonials
            ->map(fn ($t) => (int) (is_array($t) ? ($t['rating'] ?? 5) : 5))
            ->merge($customerReviews->pluck('rating')->map(fn ($r) => (int) $r));

        $count = $testimonials->count() + $customerReviews->count();
        $rating = $ratings->isNotEmpty() ? round((float) $ratings->avg(), 1) : 4.8;
        $reviewCount = max($count, $count > 0 ? $count : 20);

        return [
            'rating' => $rating,
            'reviewCount' => $reviewCount,
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    private static function mapCustomerReviews(Trip $trip): array
    {
        if (! $trip->relationLoaded('tripReviews')) {
            return [];
        }

        return $trip->tripReviews
            ->where('status', TripReview::STATUS_APPROVED)
            ->sortByDesc('created_at')
            ->values()
            ->map(function (TripReview $review) {
                $name = $review->relationLoaded('user') && $review->user
                    ? $review->user->name
                    : 'Traveler';

                return [
                    'id' => 'cr-'.$review->id,
                    'name' => $name,
                    'date' => $review->created_at?->format('Y-m-d') ?? now()->format('Y-m-d'),
                    'rating' => (int) $review->rating,
                    'text' => $review->text,
                    'source' => 'customer',
                ];
            })
            ->all();
    }

    /**
     * @return list<string>
     */
    private static function defaultCancellationPolicy(): array
    {
        return [
            '30+ days before departure: Full refund minus processing fee',
            '15–30 days: 50% refund',
            'Less than 15 days: No refund',
        ];
    }

    /**
     * @return list<string>
     */
    private static function defaultRefundPolicy(): array
    {
        return [
            'Refunds processed within 7–10 business days',
            'Date change allowed once, subject to availability',
        ];
    }

    /**
     * @param  array<int, mixed>|null  $items
     * @return list<string>
     */
    private static function mapLines(?array $items): array
    {
        return collect($items ?? [])
            ->map(fn ($item) => is_array($item) ? (string) ($item['text'] ?? '') : (string) $item)
            ->filter()
            ->values()
            ->all();
    }

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
        $dynamicMin = \App\Support\DynamicPricing::minPrice(
            \App\Support\DynamicPricing::normalize($pricing)
        );
        if ($dynamicMin !== null) {
            $displayPrice = $dynamicMin;
            $saleActive = false;
        }

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

        $stats = self::reviewStats($trip);

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
            'rating' => $stats['rating'],
            'reviewCount' => $stats['reviewCount'],
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
                'source' => 'curated',
            ];
        })
            ->merge(self::mapCustomerReviews($trip))
            ->sortByDesc('date')
            ->values()
            ->all();

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
            'brochureMediaId' => $trip->brochure_media_id
                ? (string) $trip->brochure_media_id
                : null,
            'quickFacts' => [
                ['label' => 'Duration', 'value' => $card['duration']],
                ['label' => 'Difficulty', 'value' => $difficulty],
                ['label' => 'Category', 'value' => $card['category']],
                ['label' => 'Max group', 'value' => (string) ($trip->max_group_size ?: '—')],
            ],
            'startPoint' => $card['destination'],
            'endPoint' => $card['destination'],
            'maxAltitude' => $trip->max_altitude ?: null,
            'difficulty' => $difficulty,
            'itinerary' => $itinerary,
            'inclusions' => $mapRepeater($trip->inclusions),
            'exclusions' => $mapRepeater($trip->exclusions),
            'thingsToCarry' => self::mapLines($trip->things_to_carry),
            'faqs' => $faqs,
            'cancellationPolicy' => self::mapLines($trip->cancellation_policy)
                ?: self::defaultCancellationPolicy(),
            'refundPolicy' => self::mapLines($trip->refund_policy)
                ?: self::defaultRefundPolicy(),
            'batches' => $batches,
            'reviews' => $reviews,
            'addons' => \App\Support\TripAddons::normalize($trip->addons),
            'pricingOptions' => \App\Support\DynamicPricing::toPublicOptions(
                CamelCase::convert($trip->pricing ?? [])
            ),
        ];
    }
}
