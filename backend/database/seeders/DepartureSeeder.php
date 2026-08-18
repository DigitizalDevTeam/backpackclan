<?php

namespace Database\Seeders;

use App\Models\Departure;
use App\Models\Trip;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DepartureSeeder extends Seeder
{
    public function run(): void
    {
        // Seed upcoming departures for published trips.
        // Using a fixed historical base date can leave newer trips with no "upcoming"
        // batches in the frontend. We generate dates relative to now instead.
        $trips = Trip::query()->where('status', 'published')->get();
        $base = now()->startOfDay();
        $profiles = [
            ['total' => 12, 'booked' => 2],
            ['total' => 12, 'booked' => 8],
            ['total' => 12, 'booked' => 11],
            ['total' => 18, 'booked' => 5],
            ['total' => 10, 'booked' => 9],
        ];

        $counter = 0;
        foreach ($trips as $trip) {
            // Keep enough upcoming departures so the frontend dropdown isn't empty.
            for ($week = 0; $week < 8; $week++) {
                $profile = $profiles[$counter % count($profiles)];
                $start = $base->copy()->addWeeks($week);
                $end = $start->copy()->addDays($trip->duration_nights);

                Departure::query()->updateOrCreate(
                    [
                        'trip_id' => $trip->id,
                        'start_date' => $start->format('Y-m-d'),
                    ],
                    [
                        'end_date' => $end->format('Y-m-d'),
                        'total_seats' => $profile['total'],
                        'booked_seats' => $profile['booked'],
                        'is_guaranteed' => $week % 4 === 0,
                        'cancellation_deadline' => $start->copy()->subDays(7)->format('Y-m-d'),
                        'is_cancelled' => false,
                    ]
                );
                $counter++;
            }
        }
    }
}
