<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PermissionSeeder::class,
            RoleSeeder::class,
            AdminUserSeeder::class,
            CustomerUserSeeder::class,
            BookingSeeder::class,
            CouponSeeder::class,
            SettingsSeeder::class,
            // Catalog first so homepage sections can resolve destination/category IDs.
            CategorySeeder::class,
            DestinationSeeder::class,
            CmsSeeder::class,
            TripSeeder::class,
            DepartureSeeder::class,
            BlogSeeder::class,
        ]);
    }
}
