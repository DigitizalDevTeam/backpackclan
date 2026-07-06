<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Support\ActivityLogger;
use App\Support\PublicStorageUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    public function index(): JsonResponse
    {
        $items = Media::query()->orderByDesc('created_at')->get();

        return response()->json([
            'success' => true,
            'data' => $items->map->toApiArray()->values(),
        ]);
    }

    public function show(Media $medium): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $medium->toApiArray(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate(['file' => ['required', 'file', 'max:20480']]);

        $item = Media::makeFromUpload($request->file('file'), $request->user()->id);
        ActivityLogger::log("\"{$item->title}\" uploaded to media library", 'media');

        return response()->json(['success' => true, 'data' => $item->toApiArray()], 201);
    }

    public function update(Request $request, Media $medium): JsonResponse
    {
        if ($request->hasFile('file')) {
            $request->validate(['file' => ['required', 'file', 'max:20480']]);
            $this->deleteStoredFile($medium->url);
            $file = $request->file('file');
            $filename = \Illuminate\Support\Str::uuid().'_'.$file->getClientOriginalName();
            $path = $file->storeAs('media', $filename, 'public');
            $medium->update([
                'url' => PublicStorageUrl::fromPath($path),
                'filename' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'media_type' => Media::mediaTypeFromMime($file->getMimeType()),
                'size' => $file->getSize(),
            ]);
        } else {
            $validated = $request->validate([
                'altText' => ['sometimes', 'string', 'max:500'],
                'title' => ['sometimes', 'string', 'max:255'],
            ]);
            $medium->update([
                'alt_text' => $validated['altText'] ?? $medium->alt_text,
                'title' => $validated['title'] ?? $medium->title,
            ]);
        }

        return response()->json(['success' => true, 'data' => $medium->fresh()->toApiArray()]);
    }

    public function destroy(Media $medium): JsonResponse
    {
        $title = $medium->title;
        $this->deleteStoredFile($medium->url);
        $medium->delete();
        ActivityLogger::log("\"{$title}\" removed from media library", 'media');

        return response()->json(['success' => true]);
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $ids = $request->validate(['ids' => ['required', 'array', 'min:1'], 'ids.*' => ['integer']])['ids'];
        $items = Media::query()->whereIn('id', $ids)->get();
        foreach ($items as $item) {
            $this->deleteStoredFile($item->url);
            $item->delete();
        }
        ActivityLogger::log(count($ids).' media file(s) deleted', 'media');

        return response()->json(['success' => true]);
    }

    private function deleteStoredFile(string $url): void
    {
        $path = PublicStorageUrl::pathFromUrl($url);
        if ($path) {
            Storage::disk('public')->delete($path);
        }
    }
}
