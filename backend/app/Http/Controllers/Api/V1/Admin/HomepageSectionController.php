<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\HomepageSection;
use App\Support\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class HomepageSectionController extends Controller
{
    public function index(): JsonResponse
    {
        $sections = HomepageSection::query()->orderBy('sort_order')->get();

        return response()->json([
            'success' => true,
            'data' => $sections->map->toApiArray()->values(),
        ]);
    }

    public function enabled(): JsonResponse
    {
        $sections = HomepageSection::query()
            ->where('is_enabled', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $sections->map->toApiArray()->values(),
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $section = HomepageSection::query()->where('slug', $slug)->first();

        if (! $section) {
            return response()->json(['success' => false, 'errors' => ['form' => 'Section not found']], 404);
        }

        return response()->json(['success' => true, 'data' => $section->toApiArray()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:120'],
            'slug' => ['required', 'string', 'max:120', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('homepage_sections', 'slug')],
            'type' => ['required', Rule::in([
                'category_showcase',
                'popular_trips',
                'featured_destinations',
            ])],
        ]);

        $sortOrder = (int) (HomepageSection::query()->max('sort_order') ?? -1) + 1;

        $section = HomepageSection::query()->create([
            'slug' => $data['slug'],
            'title' => $data['title'],
            'type' => $data['type'],
            'sort_order' => $sortOrder,
            'is_enabled' => true,
            'content' => $this->defaultContentForType($data['type'], $data['title']),
        ]);

        ActivityLogger::log("{$section->title} section created", 'homepage');

        return response()->json([
            'success' => true,
            'data' => $section->toApiArray(),
        ], 201);
    }

    public function reorder(Request $request): JsonResponse
    {
        $orderedIds = $request->validate(['orderedIds' => ['required', 'array', 'min:1']])['orderedIds'];

        foreach ($orderedIds as $index => $id) {
            HomepageSection::query()->where('id', $id)->update(['sort_order' => $index]);
        }

        ActivityLogger::log('Homepage sections reordered', 'homepage');

        $sections = HomepageSection::query()->orderBy('sort_order')->get();

        return response()->json([
            'success' => true,
            'data' => $sections->map->toApiArray()->values(),
        ]);
    }

    public function update(Request $request, string $slug): JsonResponse
    {
        $section = HomepageSection::query()->where('slug', $slug)->first();

        if (! $section) {
            return response()->json(['success' => false, 'errors' => ['form' => 'Section not found']], 404);
        }

        $content = $request->validate(['content' => ['required', 'array']])['content'];
        $section->update(['content' => $content]);
        ActivityLogger::log("{$section->title} section updated", 'homepage');

        return response()->json(['success' => true, 'data' => $section->fresh()->toApiArray()]);
    }

    public function toggle(string $slug): JsonResponse
    {
        $section = HomepageSection::query()->where('slug', $slug)->first();

        if (! $section) {
            return response()->json(['success' => false, 'errors' => ['form' => 'Section not found']], 404);
        }

        $section->update(['is_enabled' => ! $section->is_enabled]);
        $status = $section->is_enabled ? 'enabled' : 'disabled';
        ActivityLogger::log("{$section->title} section {$status}", 'homepage');

        return response()->json(['success' => true, 'data' => $section->fresh()->toApiArray()]);
    }

    /**
     * @return array<string, mixed>
     */
    private function defaultContentForType(string $type, string $title): array
    {
        return match ($type) {
            'category_showcase' => [
                'title' => $title,
                'subtitle' => '',
                'href' => '/trips',
                'layout' => 'banner-below',
                'categoryId' => null,
                'videoMediaId' => null,
                'posterMediaId' => null,
                'tabs' => [
                    [
                        'id' => 'india',
                        'label' => 'India',
                        'title' => '',
                        'subtitle' => '',
                        'href' => '',
                        'showcaseType' => 'destinations',
                        'destinationIds' => [],
                        'tripIds' => [],
                        'items' => [],
                        'bannerImageId' => null,
                        'bannerVideoId' => null,
                    ],
                    [
                        'id' => 'international',
                        'label' => 'International',
                        'title' => '',
                        'subtitle' => '',
                        'href' => '',
                        'showcaseType' => 'destinations',
                        'destinationIds' => [],
                        'tripIds' => [],
                        'items' => [],
                        'bannerImageId' => null,
                        'bannerVideoId' => null,
                    ],
                ],
            ],
            'popular_trips' => [
                'title' => $title,
                'layout' => 'carousel',
                'mode' => 'manual',
                'tripIds' => [],
                'filterTags' => [],
            ],
            'featured_destinations' => [
                'title' => $title,
                'destinationIds' => [],
                'cards' => [],
            ],
            default => [],
        };
    }
}
