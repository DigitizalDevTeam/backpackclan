<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Support\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class BlogController extends Controller
{
    public function index(): JsonResponse
    {
        $posts = Blog::query()
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $posts->map->toApiArray()->values(),
        ]);
    }

    public function show(Blog $blog): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $blog->toApiArray()]);
    }

    public function store(Request $request): JsonResponse
    {
        $blog = Blog::query()->create($this->validated($request));
        ActivityLogger::log("New blog post \"{$blog->title}\" added", 'blogs');

        return response()->json(['success' => true, 'data' => $blog->toApiArray()], 201);
    }

    public function update(Request $request, Blog $blog): JsonResponse
    {
        $blog->update($this->validated($request, $blog));
        ActivityLogger::log("Blog post \"{$blog->title}\" updated", 'blogs');

        return response()->json(['success' => true, 'data' => $blog->fresh()->toApiArray()]);
    }

    public function destroy(Blog $blog): JsonResponse
    {
        $title = $blog->title;
        $blog->delete();
        ActivityLogger::log("Blog post \"{$title}\" deleted", 'blogs');

        return response()->json(['success' => true]);
    }

    public function patch(Request $request, Blog $blog): JsonResponse
    {
        if ($request->input('action') === 'toggle') {
            $blog->update([
                'status' => $blog->status === 'published' ? 'draft' : 'published',
            ]);
            ActivityLogger::log("Blog post \"{$blog->title}\" updated", 'blogs');

            return response()->json(['success' => true, 'data' => $blog->fresh()->toApiArray()]);
        }

        return response()->json(['success' => false, 'errors' => ['form' => 'Invalid action']], 400);
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Blog $blog = null): array
    {
        $blogId = $blog?->id;

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('blogs', 'slug')->ignore($blogId),
            ],
            'excerpt' => ['required', 'string', 'max:500'],
            'content' => ['required', 'array', 'min:1'],
            'content.*' => ['required', 'string'],
            'imageId' => ['nullable', 'string'],
            'category' => ['required', 'string', 'max:100'],
            'author' => ['required', 'string', 'max:100'],
            'authorRole' => ['required', 'string', 'max:100'],
            'publishedAt' => ['required', 'date'],
            'readTime' => ['nullable', 'integer', 'min:1', 'max:120'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'status' => ['required', Rule::in(['draft', 'published'])],
        ]);

        $content = array_values(array_filter($data['content'], fn (string $p) => trim($p) !== ''));
        $readTime = $data['readTime'] ?? $this->estimateReadTime($content);

        return [
            'slug' => Str::slug($data['slug']),
            'title' => $data['title'],
            'excerpt' => $data['excerpt'],
            'content' => $content,
            'image_id' => $data['imageId'] ?? null,
            'category' => $data['category'],
            'author' => $data['author'],
            'author_role' => $data['authorRole'],
            'published_at' => $data['publishedAt'],
            'read_time' => $readTime,
            'tags' => $data['tags'] ?? [],
            'status' => $data['status'],
        ];
    }

    /**
     * @param  list<string>  $content
     */
    private function estimateReadTime(array $content): int
    {
        $words = str_word_count(implode(' ', $content));

        return max(1, (int) ceil($words / 200));
    }
}
