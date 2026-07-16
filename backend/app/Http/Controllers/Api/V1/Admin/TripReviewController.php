<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\TripReviewResource;
use App\Models\TripReview;
use App\Services\TripReviewService;
use App\Support\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TripReviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = TripReview::query()
            ->with(['user', 'booking', 'trip', 'moderator'])
            ->orderByDesc('created_at');

        if ($status = $request->string('status')->trim()->toString()) {
            $query->where('status', $status);
        }

        if ($search = $request->string('search')->trim()->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('text', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($uq) => $uq->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('booking', fn ($bq) => $bq
                        ->where('booking_ref', 'like', "%{$search}%")
                        ->orWhere('trip_title', 'like', "%{$search}%"));
            });
        }

        return response()->json([
            'success' => true,
            'data' => TripReviewResource::collection($query->limit(200)->get()),
        ]);
    }

    public function update(Request $request, TripReview $review, TripReviewService $service): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in([TripReview::STATUS_APPROVED, TripReview::STATUS_REJECTED])],
        ]);

        try {
            $review = $service->moderate($review, $data['status'], $request->user());
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);
        }

        ActivityLogger::log(
            "Review #{$review->id} marked as {$review->status}",
            'reviews'
        );

        return response()->json([
            'success' => true,
            'data' => new TripReviewResource($review),
        ]);
    }
}
