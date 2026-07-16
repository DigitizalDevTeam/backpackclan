<?php

namespace Tests\Unit;

use App\Models\Booking;
use App\Models\Coupon;
use App\Models\Departure;
use App\Models\Destination;
use App\Models\Payment;
use App\Models\Role;
use App\Models\Trip;
use App\Models\User;
use App\Services\CouponService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CouponServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_commit_on_first_payment_increments_coupon_once(): void
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
            'email' => 'coupon-test@example.com',
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
            'title' => 'Test Trip',
            'slug' => 'test-trip',
            'trip_type' => 'bike',
            'duration_days' => 5,
            'duration_nights' => 4,
            'difficulty' => 'moderate',
            'max_group_size' => 10,
            'summary' => 'Test',
            'pricing' => ['base_price' => 10000, 'currency' => 'INR', 'price_per' => 'person'],
            'status' => 'published',
            'sort_order' => 0,
        ]);

        $departure = Departure::query()->create([
            'trip_id' => $trip->id,
            'start_date' => now()->addMonth()->toDateString(),
            'end_date' => now()->addMonth()->addDays(4)->toDateString(),
            'total_seats' => 10,
            'booked_seats' => 0,
            'is_cancelled' => false,
        ]);

        $coupon = Coupon::query()->create([
            'code' => 'WELCOME10',
            'type' => 'percent',
            'value' => 10,
            'min_amount' => 0,
            'usage_limit' => 5,
            'used_count' => 0,
            'is_active' => true,
        ]);

        $booking = Booking::query()->create([
            'user_id' => $user->id,
            'trip_id' => $trip->id,
            'departure_id' => $departure->id,
            'booking_ref' => 'BC-TEST-1',
            'trip_slug' => $trip->slug,
            'trip_title' => $trip->title,
            'destination' => 'Ladakh',
            'batch_date' => $departure->start_date,
            'travelers' => 1,
            'adults' => 1,
            'children' => 0,
            'traveler_details' => [],
            'contact_phone' => $user->phone,
            'contact_email' => $user->email,
            'status' => 'pending',
            'subtotal_amount' => 10000,
            'addons_total' => 0,
            'discount_amount' => 1000,
            'coupon_code' => $coupon->code,
            'total_amount' => 9000,
            'paid_amount' => 0,
            'balance_due' => 9000,
            'invoice_number' => 'INV-TEST-1',
            'voucher_code' => 'VCH-TEST-1',
        ]);

        $firstPayment = Payment::query()->create([
            'booking_id' => $booking->id,
            'user_id' => $user->id,
            'amount' => 3000,
            'currency' => 'inr',
            'status' => 'succeeded',
            'provider' => 'stripe',
            'mode' => 'deposit',
            'paid_at' => now(),
        ]);

        $service = app(CouponService::class);
        $service->commitOnFirstPayment($booking, $firstPayment);
        $this->assertSame(1, (int) $coupon->fresh()->used_count);

        $secondPayment = Payment::query()->create([
            'booking_id' => $booking->id,
            'user_id' => $user->id,
            'amount' => 6000,
            'currency' => 'inr',
            'status' => 'succeeded',
            'provider' => 'stripe',
            'mode' => 'balance',
            'paid_at' => now(),
        ]);

        $service->commitOnFirstPayment($booking, $secondPayment);
        $this->assertSame(1, (int) $coupon->fresh()->used_count);
    }
}
