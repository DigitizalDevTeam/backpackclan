<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\SeoMeta;
use App\Support\ActivityLogger;
use App\Support\SeoPages;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SeoController extends Controller
{
    public function index(): JsonResponse
    {
        $data = SeoMeta::query()->get()->map(function (SeoMeta $meta) {
            $page = SeoPages::find($meta->page_key);

            return array_merge($meta->toApiArray(), [
                'label' => $page['label'] ?? $meta->page_key,
                'path' => $page['path'] ?? '/',
                'isPlaceholder' => $page['isPlaceholder'] ?? false,
            ]);
        });

        return response()->json([
            'success' => true,
            'data' => $data->values(),
            'pages' => SeoPages::definitions(),
        ]);
    }

    public function show(string $pageKey): JsonResponse
    {
        $page = SeoPages::find($pageKey);
        $meta = SeoMeta::query()->where('page_key', $pageKey)->first();

        if (! $page || ! $meta) {
            return response()->json(['success' => false, 'errors' => ['form' => 'Page not found']], 404);
        }

        return response()->json([
            'success' => true,
            'data' => array_merge($meta->toApiArray(), [
                'label' => $page['label'],
                'path' => $page['path'],
                'isPlaceholder' => $page['isPlaceholder'] ?? false,
            ]),
        ]);
    }

    public function update(Request $request, string $pageKey): JsonResponse
    {
        $page = SeoPages::find($pageKey);
        if (! $page) {
            return response()->json(['success' => false, 'errors' => ['form' => 'Page not found']], 404);
        }

        $data = $request->validate([
            'metaTitle' => ['required', 'string', 'max:255'],
            'metaDescription' => ['required', 'string', 'max:500'],
            'ogImageId' => ['nullable', 'string'],
            'canonicalUrl' => ['nullable', 'string', 'max:500'],
            'robots' => ['required', Rule::in(['index, follow', 'noindex, follow', 'index, nofollow', 'noindex, nofollow'])],
            'schemaJson' => ['nullable', 'string'],
        ]);

        $meta = SeoMeta::query()->updateOrCreate(
            ['page_key' => $pageKey],
            [
                'meta_title' => $data['metaTitle'],
                'meta_description' => $data['metaDescription'],
                'og_image_id' => $data['ogImageId'] ?? null,
                'canonical_url' => $data['canonicalUrl'] ?? '',
                'robots' => $data['robots'],
                'schema_json' => $data['schemaJson'] ?? '',
            ]
        );

        ActivityLogger::log("SEO meta updated for {$page['label']}", 'seo');

        return response()->json([
            'success' => true,
            'data' => array_merge($meta->toApiArray(), [
                'label' => $page['label'],
                'path' => $page['path'],
                'isPlaceholder' => $page['isPlaceholder'] ?? false,
            ]),
        ]);
    }

    public function reset(string $pageKey): JsonResponse
    {
        $page = SeoPages::find($pageKey);
        $defaults = SeoPages::defaults()[$pageKey] ?? null;

        if (! $page || ! $defaults) {
            return response()->json(['success' => false, 'errors' => ['form' => 'Page not found']], 404);
        }

        $meta = SeoMeta::query()->updateOrCreate(
            ['page_key' => $pageKey],
            $defaults
        );

        return response()->json([
            'success' => true,
            'data' => array_merge($meta->toApiArray(), [
                'label' => $page['label'],
                'path' => $page['path'],
                'isPlaceholder' => $page['isPlaceholder'] ?? false,
            ]),
        ]);
    }
}
