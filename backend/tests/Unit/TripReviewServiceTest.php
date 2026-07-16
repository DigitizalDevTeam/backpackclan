<?php

namespace Tests\Unit;

use App\Models\Booking;
use App\Models\Destination;
use App\Models\Role;
use App\Models\Trip;
use App\Models\TripReview;
use App\Models\User;
use App\Services\TripReviewService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class TripReviewServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_submit_review_after_trip_ends(): void
    {
        [$user, $trip] = $this->seedUserAndTrip();

        $booking = Booking::query()->create([
            'user_id' => $user->id,
            'trip_id' => $trip->id,
            'booking_ref' => 'BC-2026-3001',
            'trip_slug' => $trip->slug,
            'trip_title' => $trip->title,
            'destination' => 'Leh Ladakh',
            'batch_date' => now()->subDays(10)->toDateString(),
            'travelers' => 1,
            'adults' => 1,
            'children' => 0,
            'traveler_details' => [],
            'status' => 'confirmed',
            'subtotal_amount' => 10000,
            'addons_total' => 0,
            'discount_amount' => 0,
            'total_amount' => 10000,
            'paid_amount' => 10000,
            'balance_due' => 0,
            'invoice_number' => 'INV-2026-3001',
            'voucher_code' => 'VCH-TEST-3001',
        ]);

        $service = app(TripReviewService::class);
        $eligibility = $service->eligibility($booking);

        $this->assertTrue($eligibility['canReview']);

        $review = $service->submit($booking, $user, 5, 'An unforgettable experience with great guides.');

        $this->assertSame(TripReview::STATUS_PENDING, $review->status);
        $this->assertDatabaseHas('trip_reviews', [
            'booking_id' => $booking->id,
            'user_id' => $user->id,
            'rating' => 5,
        ]);
    }

    public function test_review_blocked_before_trip_ends(): void
    {
        [$user, $trip] = $this->seedUserAndTrip();

        $booking = Booking::query()->create([
            'user_id' => $user->id,
            'trip_id' => $trip->id,
            'booking_ref' => 'BC-2026-3002',
            'trip_slug' => $trip->slug,
            'trip_title' => $trip->title,
            'destination' => 'Leh Ladakh',
            'batch_date' => now()->addDays(3)->toDateString(),
            'travelers' => 1,
            'adults' => 1,
            'children' => 0,
            'traveler_details' => [],
            'status' => 'confirmed',
            'subtotal_amount' => 10000,
            'addons_total' => 0,
            'discount_amount' => 0,
            'total_amount' => 10000,
            'paid_amount' => 10000,
            'balance_due' => 0,
            'invoice_number' => 'INV-2026-3002',
            'voucher_code' => 'VCH-TEST-3002',
        ]);

        $service = app(TripReviewService::class);
        $eligibility = $service->eligibility($booking);

        $this->assertFalse($eligibility['canReview']);
    }

    /**
     * @return array{0: User, 1: Trip}
     */
    private function seedUserAndTrip(): array
    {
        Role::query()->create([
            'name' => 'Customer',
            'slug' => 'customer',
            'description' => 'Customer role',
            'is_system' => true,
        ]);

        $customerRole = Role::query()->where('slug', 'customer')->firstOrFail();
        $user = User::query()->create([
            'name' => 'Test Customer',
            'email' => 'review-test@example.com',
            'phone' => '+919999999999',
            'password' => Hash::make('password'),
            'role_id' => $customerRole->id,
            'is_active' => true,
        ]);

        $destination = Destination::query()->create([
            'name' => 'Leh Ladakh',
            'slug' => 'leh-ladakh',
            'country' => 'India',
            'region' => 'domestic',
            'status' => 'published',
            'sort_order' => 0,
        ]);

        $trip = Trip::query()->create([
            'destination_id' => $destination->id,
            'title' => 'Test Ladakh Trip',
            'slug' => 'test-ladakh-trip',
            'trip_type' => 'bike',
            'duration_days' => 7,
            'duration_nights' => 6,
            'difficulty' => 'moderate',
            'max_group_size' => 12,
            'summary' => 'Test trip',
            'pricing' => [
                'base_price' => 20000,
                'currency' => 'INR',
                'price_per' => 'person',
            ],
            'status' => 'published',
            'sort_order' => 0,
        ]);

        return [$user, $trip];
    }
}
