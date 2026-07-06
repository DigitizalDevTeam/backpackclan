<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\HomepageSection;
use App\Support\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
}
