<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\Media;
use App\Models\SeoMeta;
use App\Support\ApiPagination;
use App\Support\PublicStorageUrl;
use App\Support\SeoPages;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Blog::query()
            ->where('status', 'published')
            ->orderByDesc('published_at')
            ->orderByDesc('id');

        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }

        if ($tag = $request->query('tag')) {
            $query->whereJsonContains('tags', $tag);
        }

        $categories = Blog::query()
            ->where('status', 'published')
            ->distinct()
            ->orderBy('category')
            ->pluck('category')
            ->values();

        $perPage = ApiPagination::perPage($request->query('per_page'), 9, 48);
        $page = ApiPagination::page($request->query('page'));
        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

        $posts = collect($paginator->items())
            ->map(fn (Blog $post) => $post->toApiArray())
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'posts' => $posts,
                'categories' => $categories,
                'seo' => $this->blogIndexSeo(),
                'meta' => ApiPagination::meta($paginator),
            ],
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $post = Blog::query()
            ->where('slug', $slug)
            ->where('status', 'published')
            ->first();

        if (! $post) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Blog post not found'],
            ], 404);
        }

        $related = Blog::query()
            ->where('status', 'published')
            ->where('id', '!=', $post->id)
            ->orderByRaw('CASE WHEN category = ? THEN 0 ELSE 1 END', [$post->category])
            ->orderByDesc('published_at')
            ->limit(3)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'post' => $post->toApiArray(),
                'related' => $related->map->toApiArray()->values(),
            ],
        ]);
    }

    public function slugs(): JsonResponse
    {
        $slugs = Blog::query()
            ->where('status', 'published')
            ->orderByDesc('published_at')
            ->pluck('slug')
            ->values();

        return response()->json([
            'success' => true,
            'data' => $slugs,
        ]);
    }

    /**
     * @return array<string, mixed>|null
     */
    private function blogIndexSeo(): ?array
    {
        $page = SeoPages::find('blog');
        $meta = SeoMeta::query()->where('page_key', 'blog')->first();
        if (! $page || ! $meta) {
            return null;
        }

        $ogImageUrl = null;
        if ($meta->og_image_id) {
            $media = Media::query()->find($meta->og_image_id);
            $ogImageUrl = $media
                ? PublicStorageUrl::normalize($media->url)
                : null;
        }

        return array_merge($meta->toApiArray(), [
            'ogImageUrl' => $ogImageUrl,
            'label' => $page['label'],
            'path' => $page['path'],
        ]);
    }
}
