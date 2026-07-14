<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        $coupons = [
            [
                'code' => 'WELCOME10',
                'type' => 'percent',
                'value' => 10,
                'min_amount' => 5000,
                'max_discount' => 3000,
                'usage_limit' => 500,
                'used_count' => 0,
                'trip_slug' => null,
                'is_active' => true,
                'starts_at' => now()->subDay(),
                'ends_at' => now()->addYear(),
                'description' => '10% off for new travelers (max ₹3,000)',
            ],
            [
                'code' => 'EARLYBIRD500',
                'type' => 'fixed',
                'value' => 500,
                'min_amount' => 10000,
                'max_discount' => null,
                'usage_limit' => 200,
                'used_count' => 0,
                'trip_slug' => null,
                'is_active' => true,
                'starts_at' => now()->subDay(),
                'ends_at' => now()->addMonths(6),
                'description' => 'Flat ₹500 off early bookings',
            ],
            [
                'code' => 'LADAKH15',
                'type' => 'percent',
                'value' => 15,
                'min_amount' => 15000,
                'max_discount' => 5000,
                'usage_limit' => 100,
                'used_count' => 0,
                'trip_slug' => 'leh-ladakh-bike-expedition',
                'is_active' => true,
                'starts_at' => now()->subDay(),
                'ends_at' => now()->addMonths(3),
                'description' => '15% off Ladakh bike expedition',
            ],
        ];

        foreach ($coupons as $coupon) {
            Coupon::query()->updateOrCreate(
                ['code' => $coupon['code']],
                $coupon
            );
        }
    }
}
