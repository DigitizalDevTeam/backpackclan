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
        $trips = Trip::query()->where('status', 'published')->get();
        $base = Carbon::parse('2026-07-01');
        $profiles = [
            ['total' => 12, 'booked' => 2],
            ['total' => 12, 'booked' => 8],
            ['total' => 12, 'booked' => 11],
            ['total' => 18, 'booked' => 5],
            ['total' => 10, 'booked' => 9],
        ];

        $counter = 0;
        foreach ($trips->take(5) as $trip) {
            for ($week = 0; $week < 6; $week++) {
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
                    ]
                );
                $counter++;
            }
        }
    }
}
