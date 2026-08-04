<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Support\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class TripController extends Controller
{
    public function index(): JsonResponse
    {
        $trips = Trip::query()
            ->with(['destination', 'categories'])
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $trips->map->toApiArray()->values(),
        ]);
    }

    public function show(Trip $trip): JsonResponse
    {
        $trip->load(['destination', 'categories']);

        return response()->json(['success' => true, 'data' => $trip->toApiArray()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $categoryIds = $data['category_ids'];
        unset($data['category_ids']);

        $trip = Trip::query()->create($data);
        $trip->categories()->sync($categoryIds);
        $trip->load(['destination', 'categories']);

        ActivityLogger::log("New trip \"{$trip->title}\" added", 'trips');

        return response()->json(['success' => true, 'data' => $trip->toApiArray()], 201);
    }

    public function update(Request $request, Trip $trip): JsonResponse
    {
        $data = $this->validated($request, $trip);
        $categoryIds = $data['category_ids'];
        unset($data['category_ids']);

        $trip->update($data);
        $trip->categories()->sync($categoryIds);
        $trip->load(['destination', 'categories']);

        ActivityLogger::log("Trip \"{$trip->title}\" updated", 'trips');

        return response()->json(['success' => true, 'data' => $trip->fresh()->toApiArray()]);
    }

    public function destroy(Trip $trip): JsonResponse
    {
        $title = $trip->title;
        $trip->delete();
        ActivityLogger::log("Trip \"{$title}\" deleted", 'trips');

        return response()->json(['success' => true]);
    }

    public function patch(Request $request, Trip $trip): JsonResponse
    {
        $action = $request->input('action');

        if ($action === 'toggle_featured') {
            $trip->update(['is_featured' => ! $trip->is_featured]);
            ActivityLogger::log("Trip \"{$trip->title}\" updated", 'trips');

            return response()->json(['success' => true, 'data' => $trip->fresh(['destination', 'categories'])->toApiArray()]);
        }

        if ($action === 'archive') {
            $trip->update(['status' => 'archived']);
            ActivityLogger::log("Trip \"{$trip->title}\" archived", 'trips');

            return response()->json(['success' => true, 'data' => $trip->fresh(['destination', 'categories'])->toApiArray()]);
        }

        if ($action === 'publish') {
            $trip->update(['status' => 'published']);
            ActivityLogger::log("Trip \"{$trip->title}\" published", 'trips');

            return response()->json(['success' => true, 'data' => $trip->fresh(['destination', 'categories'])->toApiArray()]);
        }

        if ($action === 'duplicate') {
            $maxSort = Trip::query()->max('sort_order') ?? 0;
            $copy = Trip::query()->create([
                'destination_id' => $trip->destination_id,
                'title' => $trip->title.' (Copy)',
                'slug' => $this->uniqueSlug($trip->slug.'-copy'),
                'trip_type' => $trip->trip_type,
                'duration_days' => $trip->duration_days,
                'duration_nights' => $trip->duration_nights,
                'difficulty' => $trip->difficulty,
                'max_group_size' => $trip->max_group_size,
                'min_age' => $trip->min_age,
                'summary' => $trip->summary,
                'cover_image_id' => $trip->cover_image_id,
                'gallery' => $trip->gallery,
                'overview' => $trip->overview,
                'itinerary' => $trip->itinerary,
                'inclusions' => $trip->inclusions,
                'exclusions' => $trip->exclusions,
                'things_to_carry' => $trip->things_to_carry,
                'cancellation_policy' => $trip->cancellation_policy,
                'refund_policy' => $trip->refund_policy,
                'max_altitude' => $trip->max_altitude,
                'faqs' => $trip->faqs,
                'testimonials' => $trip->testimonials,
                'pricing' => $trip->pricing,
                'seo' => $trip->seo,
                'is_featured' => false,
                'sort_order' => $maxSort + 1,
                'status' => 'draft',
            ]);
            $copy->categories()->sync($trip->categories->pluck('id'));
            $copy->load(['destination', 'categories']);
            ActivityLogger::log("New trip \"{$copy->title}\" added", 'trips');

            return response()->json(['success' => true, 'data' => $copy->toApiArray()]);
        }

        if ($action === 'bulk_publish') {
            $ids = $request->input('ids', []);
            Trip::query()->whereIn('id', $ids)->update(['status' => 'published']);
            ActivityLogger::log('Bulk trip publish', 'trips');

            return response()->json(['success' => true]);
        }

        if ($action === 'bulk_archive') {
            $ids = $request->input('ids', []);
            Trip::query()->whereIn('id', $ids)->update(['status' => 'archived']);
            ActivityLogger::log('Bulk trip archive', 'trips');

            return response()->json(['success' => true]);
        }

        return response()->json(['success' => false, 'errors' => ['form' => 'Invalid action']], 400);
    }

    private function uniqueSlug(string $base): string
    {
        $slug = Str::slug($base);
        $original = $slug;
        $counter = 1;

        while (Trip::query()->where('slug', $slug)->exists()) {
            $slug = $original.'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Trip $trip = null): array
    {
        $tripId = $trip?->id;

        $data = $request->validate([
            'destinationId' => ['required', 'integer', 'exists:destinations,id'],
            'categoryIds' => ['nullable', 'array'],
            'categoryIds.*' => ['integer', 'exists:categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('trips', 'slug')->ignore($tripId),
            ],
            'tripType' => ['required', 'string'],
            'durationDays' => ['required', 'integer', 'min:1'],
            'durationNights' => ['required', 'integer', 'min:0'],
            'difficulty' => ['required', 'string'],
            'maxGroupSize' => ['required', 'integer', 'min:1'],
            'minAge' => ['nullable', 'integer', 'min:0'],
            'maxAltitude' => ['nullable', 'string', 'max:120'],
            'summary' => ['nullable', 'string'],
            'coverImageId' => ['nullable', 'string'],
            'brochureMediaId' => ['nullable', 'string'],
            'gallery' => ['nullable', 'array'],
            'overview' => ['nullable', 'array'],
            'itinerary' => ['nullable', 'array'],
            'inclusions' => ['nullable', 'array'],
            'exclusions' => ['nullable', 'array'],
            'thingsToCarry' => ['nullable', 'array'],
            'cancellationPolicy' => ['nullable', 'array'],
            'refundPolicy' => ['nullable', 'array'],
            'faqs' => ['nullable', 'array'],
            'testimonials' => ['nullable', 'array'],
            'pricing' => ['nullable', 'array'],
            'seo' => ['nullable', 'array'],
            'isFeatured' => ['nullable', 'boolean'],
            'sortOrder' => ['nullable', 'integer', 'min:0'],
            'status' => ['nullable', 'string', Rule::in(['draft', 'published', 'archived'])],
        ]);

        return [
            'destination_id' => $data['destinationId'],
            'category_ids' => $data['categoryIds'] ?? [],
            'title' => $data['title'],
            'slug' => Str::slug($data['slug']),
            'trip_type' => $data['tripType'],
            'duration_days' => $data['durationDays'],
            'duration_nights' => $data['durationNights'],
            'difficulty' => $data['difficulty'],
            'max_group_size' => $data['maxGroupSize'],
            'min_age' => $data['minAge'] ?? null,
            'max_altitude' => $data['maxAltitude'] ?? null,
            'summary' => $data['summary'] ?? '',
            'cover_image_id' => $data['coverImageId'] ?? null,
            'brochure_media_id' => $data['brochureMediaId'] ?? null,
            'gallery' => $data['gallery'] ?? [],
            'overview' => $this->mapOverview($data['overview'] ?? []),
            'itinerary' => $data['itinerary'] ?? [],
            'inclusions' => $data['inclusions'] ?? [],
            'exclusions' => $data['exclusions'] ?? [],
            'things_to_carry' => $this->mapRepeaterLines($data['thingsToCarry'] ?? []),
            'cancellation_policy' => $this->mapRepeaterLines($data['cancellationPolicy'] ?? []),
            'refund_policy' => $this->mapRepeaterLines($data['refundPolicy'] ?? []),
            'faqs' => $data['faqs'] ?? [],
            'testimonials' => $data['testimonials'] ?? [],
            'pricing' => $this->mapPricing($data['pricing'] ?? []),
            'seo' => $this->mapSeo($data['seo'] ?? []),
            'is_featured' => $data['isFeatured'] ?? false,
            'sort_order' => $data['sortOrder'] ?? 0,
            'status' => $data['status'] ?? 'draft',
        ];
    }

    /**
     * @param  array<string, mixed>  $overview
     * @return array<string, mixed>
     */
    private function mapOverview(array $overview): array
    {
        return [
            'content' => $overview['content'] ?? '',
            'highlights' => $overview['highlights'] ?? [],
            'route_map_embed' => $overview['routeMapEmbed'] ?? $overview['route_map_embed'] ?? '',
            'route_map_image_id' => $overview['routeMapImageId'] ?? $overview['route_map_image_id'] ?? null,
        ];
    }

    /**
     * @param  array<string, mixed>  $pricing
     * @return array<string, mixed>
     */
    private function mapPricing(array $pricing): array
    {
        $basePrice = (int) ($pricing['basePrice'] ?? $pricing['base_price'] ?? 0);
        $mapped = [
            'base_price' => $basePrice,
            'sale_price' => $pricing['salePrice'] ?? $pricing['sale_price'] ?? null,
            'show_strike_through' => $pricing['showStrikeThrough'] ?? $pricing['show_strike_through'] ?? false,
            'offer_label' => $pricing['offerLabel'] ?? $pricing['offer_label'] ?? '',
            'offer_valid_until' => $pricing['offerValidUntil'] ?? $pricing['offer_valid_until'] ?? null,
            'currency' => $pricing['currency'] ?? 'INR',
            'price_per' => $pricing['pricePer'] ?? $pricing['price_per'] ?? 'person',
        ];

        $dynamic = $pricing['dynamicPricing'] ?? $pricing['dynamic_pricing'] ?? null;
        if (is_array($dynamic)) {
            $mapped['dynamic_pricing'] = \App\Support\DynamicPricing::mapInput($dynamic, $basePrice);
        }

        return $mapped;
    }

    /**
     * @param  array<string, mixed>  $seo
     * @return array<string, mixed>
     */
    private function mapSeo(array $seo): array
    {
        return [
            'meta_title' => $seo['metaTitle'] ?? $seo['meta_title'] ?? '',
            'meta_description' => $seo['metaDescription'] ?? $seo['meta_description'] ?? '',
            'og_image_id' => $seo['ogImageId'] ?? $seo['og_image_id'] ?? null,
            'canonical_url' => $seo['canonicalUrl'] ?? $seo['canonical_url'] ?? '',
            'robots' => $seo['robots'] ?? 'index, follow',
        ];
    }

    /**
     * @param  array<int, mixed>  $items
     * @return list<string>
     */
    private function mapRepeaterLines(array $items): array
    {
        return collect($items)
            ->map(fn ($item) => is_array($item) ? (string) ($item['text'] ?? '') : (string) $item)
            ->filter()
            ->values()
            ->all();
    }
}
