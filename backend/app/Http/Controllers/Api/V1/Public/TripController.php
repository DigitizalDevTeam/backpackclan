<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Support\ApiPagination;
use App\Support\PublicTripMapper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TripController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Trip::query()
            ->with(['destination', 'categories', 'departures'])
            ->where('status', 'published')
            ->orderBy('sort_order')
            ->orderBy('title');

        if ($featured = $request->query('featured')) {
            if (filter_var($featured, FILTER_VALIDATE_BOOLEAN)) {
                $query->where('is_featured', true);
            }
        }

        if ($destination = $request->query('destination')) {
            $query->whereHas('destination', function ($q) use ($destination) {
                $q->where('slug', $destination)
                    ->orWhere('name', $destination);
            });
        }

        if ($category = $request->query('category')) {
            $query->whereHas('categories', function ($q) use ($category) {
                $q->where('slug', $category)
                    ->orWhere('name', $category);
            });
        }

        if ($region = $request->query('region')) {
            if ($region === 'domestic') {
                $query->whereHas('destination', fn ($q) => $q->where('country', 'India'));
            } elseif ($region === 'international') {
                $query->whereHas('destination', fn ($q) => $q->where('country', '!=', 'India'));
            }
        }

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('summary', 'like', "%{$search}%")
                    ->orWhereHas('destination', fn ($dq) => $dq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($month = $request->query('month')) {
            $monthNum = $this->monthToNumber((string) $month);
            if ($monthNum) {
                $query->whereHas('departures', function ($q) use ($monthNum) {
                    $q->where('is_cancelled', false)
                        ->whereMonth('start_date', $monthNum)
                        ->where('start_date', '>=', now()->toDateString());
                });
            }
        }

        if ($request->filled('min_nights')) {
            $query->where('duration_nights', '>=', (int) $request->query('min_nights'));
        }
        if ($request->filled('max_nights')) {
            $query->where('duration_nights', '<=', (int) $request->query('max_nights'));
        }

        $destinations = Trip::query()
            ->where('trips.status', 'published')
            ->whereNull('trips.deleted_at')
            ->join('destinations', 'destinations.id', '=', 'trips.destination_id')
            ->whereNull('destinations.deleted_at')
            ->distinct()
            ->orderBy('destinations.name')
            ->pluck('destinations.name')
            ->filter()
            ->values()
            ->all();

        $categories = Trip::query()
            ->where('trips.status', 'published')
            ->whereNull('trips.deleted_at')
            ->join('trip_category', 'trip_category.trip_id', '=', 'trips.id')
            ->join('categories', 'categories.id', '=', 'trip_category.category_id')
            ->distinct()
            ->orderBy('categories.name')
            ->pluck('categories.name')
            ->filter()
            ->values()
            ->all();

        $perPage = ApiPagination::perPage($request->query('per_page'), 12, 48);
        $page = ApiPagination::page($request->query('page'));

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);
        $items = collect($paginator->items())
            ->map(fn (Trip $trip) => PublicTripMapper::toCard($trip))
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'items' => $items,
                'meta' => ApiPagination::meta($paginator),
                'facets' => [
                    'destinations' => $destinations,
                    'categories' => $categories,
                ],
            ],
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $trip = Trip::query()
            ->with([
                'destination',
                'categories',
                'departures',
                'tripReviews' => fn ($q) => $q
                    ->where('status', 'approved')
                    ->with('user')
                    ->orderByDesc('created_at'),
            ])
            ->where('slug', $slug)
            ->where('status', 'published')
            ->first();

        if (! $trip) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Trip not found'],
            ], 404);
        }

        $card = PublicTripMapper::toCard($trip);
        $minPrice = (int) $card['price'];
        $maxPrice = $minPrice > 0 ? $minPrice * 2 : PHP_INT_MAX;

        $candidates = Trip::query()
            ->with(['destination', 'categories', 'departures'])
            ->where('status', 'published')
            ->where('id', '!=', $trip->id)
            ->where(function ($q) use ($trip) {
                $q->where('destination_id', $trip->destination_id);
                $categoryIds = $trip->categories->pluck('id');
                if ($categoryIds->isNotEmpty()) {
                    $q->orWhereHas('categories', fn ($cq) => $cq->whereIn('categories.id', $categoryIds));
                }
            })
            ->orderBy('sort_order')
            ->limit(12)
            ->get();

        $related = $candidates
            ->filter(function (Trip $t) use ($minPrice, $maxPrice) {
                if ($minPrice <= 0) {
                    return true;
                }
                $price = (int) (PublicTripMapper::toCard($t)['price'] ?? 0);

                return $price >= $minPrice && $price <= $maxPrice;
            })
            ->values();

        if ($related->count() < 3) {
            $related = $candidates->take(3);
        } else {
            $related = $related->take(3);
        }

        $related = $related
            ->map(fn (Trip $t) => PublicTripMapper::toCard($t))
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'trip' => PublicTripMapper::toCard($trip),
                'detail' => PublicTripMapper::toDetail($trip),
                'related' => $related,
            ],
        ]);
    }

    public function slugs(): JsonResponse
    {
        $slugs = Trip::query()
            ->where('status', 'published')
            ->orderBy('sort_order')
            ->pluck('slug')
            ->values();

        return response()->json([
            'success' => true,
            'data' => $slugs,
        ]);
    }

    private function monthToNumber(string $month): ?int
    {
        $map = [
            'jan' => 1, 'feb' => 2, 'mar' => 3, 'apr' => 4,
            'may' => 5, 'jun' => 6, 'jul' => 7, 'aug' => 8,
            'sep' => 9, 'oct' => 10, 'nov' => 11, 'dec' => 12,
        ];

        return $map[strtolower($month)] ?? null;
    }
}
