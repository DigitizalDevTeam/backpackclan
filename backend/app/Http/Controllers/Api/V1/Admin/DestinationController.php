<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use App\Support\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class DestinationController extends Controller
{
    public function index(): JsonResponse
    {
        $destinations = Destination::query()->orderBy('sort_order')->get();

        return response()->json([
            'success' => true,
            'data' => $destinations->map->toApiArray()->values(),
        ]);
    }

    public function show(Destination $destination): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $destination->toApiArray()]);
    }

    public function store(Request $request): JsonResponse
    {
        $destination = Destination::query()->create($this->validated($request));
        ActivityLogger::log("New destination \"{$destination->name}\" added", 'destinations');

        return response()->json(['success' => true, 'data' => $destination->toApiArray()], 201);
    }

    public function update(Request $request, Destination $destination): JsonResponse
    {
        $destination->update($this->validated($request, $destination));
        ActivityLogger::log("Destination \"{$destination->name}\" updated", 'destinations');

        return response()->json(['success' => true, 'data' => $destination->fresh()->toApiArray()]);
    }

    public function destroy(Destination $destination): JsonResponse
    {
        $name = $destination->name;
        $destination->delete();
        ActivityLogger::log("Destination \"{$name}\" deleted", 'destinations');

        return response()->json(['success' => true]);
    }

    public function patch(Request $request, Destination $destination): JsonResponse
    {
        $action = $request->input('action');

        if ($action === 'toggle_featured') {
            $destination->update(['is_featured' => ! $destination->is_featured]);
            ActivityLogger::log("Destination \"{$destination->name}\" updated", 'destinations');

            return response()->json(['success' => true, 'data' => $destination->fresh()->toApiArray()]);
        }

        if ($action === 'archive') {
            $destination->update(['status' => 'archived']);
            ActivityLogger::log("Destination \"{$destination->name}\" archived", 'destinations');

            return response()->json(['success' => true, 'data' => $destination->fresh()->toApiArray()]);
        }

        if ($action === 'duplicate') {
            $maxSort = Destination::query()->max('sort_order') ?? 0;
            $copy = Destination::query()->create([
                'name' => $destination->name.' (Copy)',
                'slug' => $this->uniqueSlug($destination->slug.'-copy'),
                'country' => $destination->country,
                'region' => $destination->region,
                'tagline' => $destination->tagline,
                'hero_image_id' => $destination->hero_image_id,
                'overview' => $destination->overview,
                'banner' => $destination->banner,
                'linked_trip_ids' => $destination->linked_trip_ids,
                'faqs' => $destination->faqs,
                'best_time' => $destination->best_time,
                'weather' => $destination->weather,
                'map' => $destination->map,
                'seo' => $destination->seo,
                'is_featured' => false,
                'sort_order' => $maxSort + 1,
                'status' => 'draft',
            ]);
            ActivityLogger::log("New destination \"{$copy->name}\" added", 'destinations');

            return response()->json(['success' => true, 'data' => $copy->toApiArray()]);
        }

        return response()->json(['success' => false, 'errors' => ['form' => 'Invalid action']], 400);
    }

    private function uniqueSlug(string $base): string
    {
        $slug = Str::slug($base);
        $original = $slug;
        $counter = 1;

        while (Destination::query()->where('slug', $slug)->exists()) {
            $slug = $original.'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Destination $destination = null): array
    {
        $destinationId = $destination?->id;

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('destinations', 'slug')->ignore($destinationId),
            ],
            'country' => ['required', 'string', 'max:255'],
            'region' => ['required', 'string', 'max:255'],
            'tagline' => ['nullable', 'string'],
            'heroImageId' => ['nullable', 'string'],
            'overview' => ['nullable', 'array'],
            'banner' => ['nullable', 'array'],
            'linkedTripIds' => ['nullable', 'array'],
            'faqs' => ['nullable', 'array'],
            'bestTime' => ['nullable', 'array'],
            'weather' => ['nullable', 'array'],
            'map' => ['nullable', 'array'],
            'seo' => ['nullable', 'array'],
            'isFeatured' => ['nullable', 'boolean'],
            'sortOrder' => ['nullable', 'integer', 'min:0'],
            'status' => ['nullable', 'string', Rule::in(['draft', 'published', 'archived'])],
        ]);

        return [
            'name' => $data['name'],
            'slug' => Str::slug($data['slug']),
            'country' => $data['country'],
            'region' => $data['region'],
            'tagline' => $data['tagline'] ?? '',
            'hero_image_id' => $data['heroImageId'] ?? null,
            'overview' => $this->mapOverview($data['overview'] ?? []),
            'banner' => $this->mapBanner($data['banner'] ?? []),
            'linked_trip_ids' => $data['linkedTripIds'] ?? [],
            'faqs' => $data['faqs'] ?? [],
            'best_time' => $this->mapBestTime($data['bestTime'] ?? []),
            'weather' => $data['weather'] ?? [],
            'map' => $this->mapMap($data['map'] ?? []),
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
            'gallery' => $overview['gallery'] ?? [],
        ];
    }

    /**
     * @param  array<string, mixed>  $banner
     * @return array<string, mixed>
     */
    private function mapBanner(array $banner): array
    {
        return [
            'headline' => $banner['headline'] ?? '',
            'subheadline' => $banner['subheadline'] ?? '',
            'cta_label' => $banner['ctaLabel'] ?? $banner['cta_label'] ?? '',
            'cta_url' => $banner['ctaUrl'] ?? $banner['cta_url'] ?? '',
            'media_id' => $banner['mediaId'] ?? $banner['media_id'] ?? null,
        ];
    }

    /**
     * @param  array<string, mixed>  $bestTime
     * @return array<string, mixed>
     */
    private function mapBestTime(array $bestTime): array
    {
        return [
            'content' => $bestTime['content'] ?? '',
            'recommended_months' => $bestTime['recommendedMonths'] ?? $bestTime['recommended_months'] ?? [],
        ];
    }

    /**
     * @param  array<string, mixed>  $map
     * @return array<string, mixed>
     */
    private function mapMap(array $map): array
    {
        return [
            'embed_url' => $map['embedUrl'] ?? $map['embed_url'] ?? '',
            'latitude' => $map['latitude'] ?? null,
            'longitude' => $map['longitude'] ?? null,
        ];
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
}
