<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use App\Models\Trip;
use App\Support\PublicTripMapper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DestinationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Destination::query()
            ->where('status', 'published')
            ->orderBy('sort_order')
            ->orderBy('name');

        if ($featured = $request->query('featured')) {
            if (filter_var($featured, FILTER_VALIDATE_BOOLEAN)) {
                $query->where('is_featured', true);
            }
        }

        $destinations = $query->get()->map(function (Destination $destination) {
            $data = $destination->toApiArray();
            $data['tripCount'] = Trip::query()
                ->where('status', 'published')
                ->where('destination_id', $destination->id)
                ->count();

            return $data;
        })->values();

        return response()->json([
            'success' => true,
            'data' => $destinations,
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $destination = Destination::query()
            ->where('slug', $slug)
            ->where('status', 'published')
            ->first();

        if (! $destination) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Destination not found'],
            ], 404);
        }

        $data = $destination->toApiArray();
        $data['tripCount'] = Trip::query()
            ->where('status', 'published')
            ->where('destination_id', $destination->id)
            ->count();

        $trips = Trip::query()
            ->with(['destination', 'categories', 'departures'])
            ->where('status', 'published')
            ->where('destination_id', $destination->id)
            ->orderBy('sort_order')
            ->get()
            ->map(fn (Trip $trip) => PublicTripMapper::toCard($trip))
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'destination' => $data,
                'trips' => $trips,
            ],
        ]);
    }

    public function slugs(): JsonResponse
    {
        $slugs = Destination::query()
            ->where('status', 'published')
            ->orderBy('sort_order')
            ->pluck('slug')
            ->values();

        return response()->json([
            'success' => true,
            'data' => $slugs,
        ]);
    }
}
