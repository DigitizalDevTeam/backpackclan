<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Support\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BannerController extends Controller
{
    public function index(): JsonResponse
    {
        $banners = Banner::query()->orderBy('sort_order')->get();

        return response()->json([
            'success' => true,
            'data' => $banners->map->toApiArray()->values(),
        ]);
    }

    public function show(Banner $banner): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $banner->toApiArray()]);
    }

    public function store(Request $request): JsonResponse
    {
        $banner = Banner::query()->create($this->validated($request));
        ActivityLogger::log("New banner \"{$banner->title}\" added", 'banners');

        return response()->json(['success' => true, 'data' => $banner->toApiArray()], 201);
    }

    public function update(Request $request, Banner $banner): JsonResponse
    {
        $banner->update($this->validated($request));
        ActivityLogger::log("Banner \"{$banner->title}\" updated", 'banners');

        return response()->json(['success' => true, 'data' => $banner->fresh()->toApiArray()]);
    }

    public function destroy(Banner $banner): JsonResponse
    {
        $title = $banner->title;
        $banner->delete();
        ActivityLogger::log("Banner \"{$title}\" deleted", 'banners');

        return response()->json(['success' => true]);
    }

    public function patch(Request $request, Banner $banner): JsonResponse
    {
        $action = $request->input('action');

        if ($action === 'toggle') {
            $banner->update(['is_active' => ! $banner->is_active]);
            ActivityLogger::log("Banner \"{$banner->title}\" updated", 'banners');

            return response()->json(['success' => true, 'data' => $banner->fresh()->toApiArray()]);
        }

        if ($action === 'duplicate') {
            $maxSort = Banner::query()->max('sort_order') ?? 0;
            $copy = Banner::query()->create([
                'title' => $banner->title.' (Copy)',
                'placement' => $banner->placement,
                'destination_id' => $banner->destination_id,
                'media_type' => $banner->media_type,
                'media_id' => $banner->media_id,
                'headline' => $banner->headline,
                'subheadline' => $banner->subheadline,
                'link_url' => $banner->link_url,
                'cta_buttons' => collect($banner->cta_buttons ?? [])->map(fn ($cta) => [
                    ...$cta,
                    'id' => 'cta-'.Str::random(8),
                ])->all(),
                'starts_at' => $banner->starts_at,
                'ends_at' => $banner->ends_at,
                'sort_order' => $maxSort + 1,
                'is_active' => false,
            ]);
            ActivityLogger::log("New banner \"{$copy->title}\" added", 'banners');

            return response()->json(['success' => true, 'data' => $copy->toApiArray()]);
        }

        return response()->json(['success' => false, 'errors' => ['form' => 'Invalid action']], 400);
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'placement' => ['required', 'string'],
            'destinationId' => ['nullable', 'string'],
            'mediaType' => ['required', 'string'],
            'mediaId' => ['nullable', 'string'],
            'headline' => ['nullable', 'string'],
            'subheadline' => ['nullable', 'string'],
            'linkUrl' => ['nullable', 'string'],
            'ctaButtons' => ['nullable', 'array'],
            'startsAt' => ['nullable', 'date'],
            'endsAt' => ['nullable', 'date'],
            'sortOrder' => ['nullable', 'integer'],
            'isActive' => ['nullable', 'boolean'],
        ]);

        return [
            'title' => $data['title'],
            'placement' => $data['placement'],
            'destination_id' => $data['destinationId'] ?? null,
            'media_type' => $data['mediaType'],
            'media_id' => $data['mediaId'] ?? null,
            'headline' => $data['headline'] ?? '',
            'subheadline' => $data['subheadline'] ?? '',
            'link_url' => $data['linkUrl'] ?? '',
            'cta_buttons' => $data['ctaButtons'] ?? [],
            'starts_at' => $data['startsAt'] ?? null,
            'ends_at' => $data['endsAt'] ?? null,
            'sort_order' => $data['sortOrder'] ?? 0,
            'is_active' => $data['isActive'] ?? true,
        ];
    }
}
