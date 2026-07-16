<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\TripReviewResource;
use App\Models\Booking;
use App\Services\TripReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TripReviewController extends Controller
{
    public function show(Request $request, Booking $booking, TripReviewService $service): JsonResponse
    {
        if ($booking->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Booking not found'],
            ], 404);
        }

        $booking->loadMissing(['tripReview', 'trip']);
        $eligibility = $service->eligibility($booking);

        return response()->json([
            'success' => true,
            'data' => [
                'canReview' => $eligibility['canReview'],
                'reason' => $eligibility['reason'],
                'review' => $booking->tripReview
                    ? new TripReviewResource($booking->tripReview)
                    : null,
            ],
        ]);
    }

    public function store(Request $request, Booking $booking, TripReviewService $service): JsonResponse
    {
        if ($booking->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Booking not found'],
            ], 404);
        }

        $data = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'text' => ['required', 'string', 'min:20', 'max:2000'],
        ]);

        try {
            $review = $service->submit(
                $booking->loadMissing('trip'),
                $request->user(),
                (int) $data['rating'],
                $data['text']
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => new TripReviewResource($review),
        ], 201);
    }
}
