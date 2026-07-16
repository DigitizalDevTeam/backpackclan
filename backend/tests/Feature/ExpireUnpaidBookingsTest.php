<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Departure;
use App\Models\Destination;
use App\Models\Role;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ExpireUnpaidBookingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_expire_command_cancels_old_unpaid_bookings(): void
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
            'email' => 'expire-test@example.com',
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
            'booked_seats' => 2,
            'is_cancelled' => false,
        ]);

        $booking = Booking::query()->create([
            'user_id' => $user->id,
            'trip_id' => $trip->id,
            'departure_id' => $departure->id,
            'booking_ref' => 'BC-EXPIRE-1',
            'trip_slug' => $trip->slug,
            'trip_title' => $trip->title,
            'destination' => 'Ladakh',
            'batch_date' => $departure->start_date,
            'travelers' => 2,
            'adults' => 2,
            'children' => 0,
            'traveler_details' => [],
            'contact_phone' => $user->phone,
            'contact_email' => $user->email,
            'status' => 'pending',
            'subtotal_amount' => 20000,
            'addons_total' => 0,
            'discount_amount' => 0,
            'total_amount' => 20000,
            'paid_amount' => 0,
            'balance_due' => 20000,
            'invoice_number' => 'INV-EXPIRE-1',
            'voucher_code' => 'VCH-EXPIRE-1',
        ]);

        Booking::query()->whereKey($booking->id)->update([
            'created_at' => now()->subHours(2),
            'updated_at' => now()->subHours(2),
        ]);

        Artisan::call('bookings:expire-unpaid');

        $this->assertSame('cancelled', $booking->fresh()->status);
        $this->assertSame(0, (int) $departure->fresh()->booked_seats);
    }
}
