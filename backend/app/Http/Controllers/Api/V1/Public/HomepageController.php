<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Blog;
use App\Models\Category;
use App\Models\Destination;
use App\Models\HomepageSection;
use App\Models\Trip;
use App\Support\PublicTripMapper;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class HomepageController extends Controller
{
    public function show(): JsonResponse
    {
        $sections = HomepageSection::query()
            ->where('is_enabled', true)
            ->orderBy('sort_order')
            ->get()
            ->map->toApiArray()
            ->values();

        $now = Carbon::now();
        $banners = Banner::query()
            ->where('is_active', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', $now);
            })
            ->orderBy('sort_order')
            ->get()
            ->map->toApiArray()
            ->values();

        $destinations = Destination::query()
            ->where('status', 'published')
            ->orderBy('sort_order')
            ->get()
            ->map(function (Destination $destination) {
                $data = $destination->toApiArray();
                $data['tripCount'] = Trip::query()
                    ->where('status', 'published')
                    ->where('destination_id', $destination->id)
                    ->count();

                return $data;
            })
            ->values();

        $categories = Category::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(function (Category $category) {
                $data = $category->toApiArray();
                $data['tripCount'] = Trip::query()
                    ->where('status', 'published')
                    ->whereHas('categories', fn ($q) => $q->where('categories.id', $category->id))
                    ->count();

                return $data;
            })
            ->values();

        $trips = Trip::query()
            ->with(['destination', 'categories', 'departures'])
            ->where('status', 'published')
            ->orderBy('sort_order')
            ->get()
            ->map(fn (Trip $trip) => PublicTripMapper::toCard($trip))
            ->values();

        $blogs = Blog::query()
            ->where('status', 'published')
            ->orderByDesc('published_at')
            ->limit(6)
            ->get()
            ->map->toApiArray()
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'sections' => $sections,
                'banners' => $banners,
                'destinations' => $destinations,
                'categories' => $categories,
                'trips' => $trips,
                'blogs' => $blogs,
            ],
        ]);
    }
}
