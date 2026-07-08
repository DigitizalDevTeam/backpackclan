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
            SettingsSeeder::class,
            CmsSeeder::class,
            CategorySeeder::class,
            DestinationSeeder::class,
            TripSeeder::class,
            DepartureSeeder::class,
            BlogSeeder::class,
        ]);
    }
}
