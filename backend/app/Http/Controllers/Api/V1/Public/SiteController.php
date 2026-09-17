<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use App\Models\Media;
use App\Models\Menu;
use App\Models\SeoMeta;
use App\Services\SettingsService;
use App\Support\MenuTree;
use App\Support\PublicStorageUrl;
use App\Support\SeoPages;
use Illuminate\Http\JsonResponse;

class SiteController extends Controller
{
    public function layout(SettingsService $settings): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'settings' => $settings->publicAll(),
                'menus' => [
                    'header' => $this->activeMenuTree('header'),
                    'footer' => $this->activeMenuTree('footer'),
                    'mobile' => $this->activeMenuTree('mobile'),
                ],
                'destinationLinks' => $this->destinationLinks(),
                'mediaMap' => $this->mediaMap(),
            ],
        ]);
    }

    public function seoIndex(): JsonResponse
    {
        $data = collect(SeoPages::definitions())->map(function (array $page) {
            $meta = SeoMeta::query()->where('page_key', $page['pageKey'])->first();
            if (! $meta) {
                return null;
            }

            return $this->formatSeo($meta, $page);
        })->filter()->values();

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function seoShow(string $pageKey): JsonResponse
    {
        $page = SeoPages::find($pageKey);
        $meta = SeoMeta::query()->where('page_key', $pageKey)->first();

        if (! $page || ! $meta) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'SEO page not found'],
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->formatSeo($meta, $page),
        ]);
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function activeMenuTree(string $location): array
    {
        $menu = Menu::query()
            ->where(function ($q) use ($location) {
                $q->where('location', $location)->orWhere('slug', $location);
            })
            ->first();

        if (! $menu) {
            return [];
        }

        $items = $menu->items()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map->toApiArray()
            ->values()
            ->all();

        return $this->pruneInactiveChildren(MenuTree::build($items));
    }

    /**
     * @param  list<array<string, mixed>>  $nodes
     * @return list<array<string, mixed>>
     */
    private function pruneInactiveChildren(array $nodes): array
    {
        $result = [];
        foreach ($nodes as $node) {
            if (! ($node['isActive'] ?? true)) {
                continue;
            }
            $node['children'] = $this->pruneInactiveChildren($node['children'] ?? []);
            $result[] = $node;
        }

        return $result;
    }

    /**
     * @return list<array{label: string, href: string}>
     */
    private function destinationLinks(): array
    {
        return Destination::query()
            ->where('status', 'published')
            ->orderBy('sort_order')
            ->limit(20)
            ->get()
            ->map(fn (Destination $d) => [
                'label' => $d->name,
                'href' => '/destinations/'.$d->slug,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<string, string>
     */
    private function mediaMap(): array
    {
        $map = [];
        foreach (Media::query()->get() as $media) {
            $url = PublicStorageUrl::normalize($media->url);
            if ($url !== '') {
                $map[(string) $media->id] = $url;
            }
        }

        return $map;
    }

    /**
     * @param  array<string, mixed>  $page
     * @return array<string, mixed>
     */
    private function formatSeo(SeoMeta $meta, array $page): array
    {
        $ogImageUrl = null;
        if ($meta->og_image_id) {
            $media = Media::query()->find($meta->og_image_id);
            $ogImageUrl = $media
                ? PublicStorageUrl::normalize($media->url)
                : null;
        }

        return array_merge($meta->toApiArray(), [
            'ogImageUrl' => $ogImageUrl ?: null,
            'label' => $page['label'] ?? $meta->page_key,
            'path' => $page['path'] ?? '/',
            'isPlaceholder' => $page['isPlaceholder'] ?? false,
        ]);
    }
}
