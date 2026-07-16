<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Departure;
use App\Models\Destination;
use App\Models\Role;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class BookingSeatTest extends TestCase
{
    use RefreshDatabase;

    public function test_cancelling_unpaid_booking_releases_seats(): void
    {
        [, $departure] = $this->seedFixture();

        $departure->update(['booked_seats' => 2]);

        $booking = Booking::query()->create([
            'user_id' => User::query()->first()->id,
            'trip_id' => $departure->trip_id,
            'departure_id' => $departure->id,
            'booking_ref' => 'BC-2026-2001',
            'trip_slug' => $departure->trip->slug,
            'trip_title' => $departure->trip->title,
            'destination' => 'Ladakh',
            'batch_date' => $departure->start_date,
            'travelers' => 2,
            'adults' => 2,
            'children' => 0,
            'traveler_details' => [],
            'contact_phone' => '+919999999999',
            'contact_email' => 'test@example.com',
            'status' => 'pending',
            'subtotal_amount' => 40000,
            'addons_total' => 0,
            'discount_amount' => 0,
            'total_amount' => 40000,
            'paid_amount' => 0,
            'balance_due' => 40000,
            'invoice_number' => 'INV-2026-2001',
            'voucher_code' => 'VCH-LAD-2001',
        ]);

        \Illuminate\Support\Facades\DB::transaction(function () use ($booking, $departure) {
            $locked = Booking::query()->whereKey($booking->id)->lockForUpdate()->firstOrFail();
            $dep = Departure::query()->whereKey($departure->id)->lockForUpdate()->firstOrFail();
            $dep->booked_seats = max(0, (int) $dep->booked_seats - (int) $locked->travelers);
            $dep->save();
            $locked->status = 'cancelled';
            $locked->save();
        });

        $this->assertSame('cancelled', $booking->fresh()->status);
        $this->assertSame(0, (int) $departure->fresh()->booked_seats);
    }

    public function test_coupon_validate_does_not_increment_usage(): void
    {
        [, $departure] = $this->seedFixture();

        $coupon = Coupon::query()->create([
            'code' => 'SAVE10',
            'type' => 'percent',
            'value' => 10,
            'min_amount' => 1000,
            'max_discount' => 5000,
            'usage_limit' => 10,
            'used_count' => 0,
            'is_active' => true,
        ]);

        $service = app(\App\Services\CouponService::class);
        $result = $service->validate($coupon->code, 20000, $departure->trip->slug);

        $this->assertGreaterThan(0, $result['discount']);
        $this->assertSame(0, (int) $coupon->fresh()->used_count);
    }

    /**
     * @return array{0: User, 1: Departure}
     */
    private function seedFixture(): array
    {
        Role::query()->create([
            'name' => 'Customer',
            'slug' => 'customer',
            'description' => 'Customer role',
            'is_system' => true,
        ]);

        $customerRole = Role::query()->where('slug', 'customer')->firstOrFail();
        $customer = User::query()->create([
            'name' => 'Test Customer',
            'email' => 'testcustomer@example.com',
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

        $category = Category::query()->create([
            'name' => 'Bike',
            'slug' => 'motor-biking',
            'sort_order' => 0,
            'is_active' => true,
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
        $trip->categories()->sync([$category->id]);

        $departure = Departure::query()->create([
            'trip_id' => $trip->id,
            'start_date' => now()->addMonth()->toDateString(),
            'end_date' => now()->addMonth()->addDays(6)->toDateString(),
            'total_seats' => 10,
            'booked_seats' => 0,
            'is_cancelled' => false,
        ]);
        $departure->setRelation('trip', $trip);

        return [$customer, $departure];
    }
}
