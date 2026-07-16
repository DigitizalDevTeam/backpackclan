<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\BookingDocument;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Database\Seeder;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $amit = User::query()->where('email', 'customer@demo.com')->first();
        $priya = User::query()->where('email', 'priya@email.com')->first();

        if (! $amit) {
            return;
        }

        $amitBookings = [
            [
                'booking_ref' => 'BC-2026-1042',
                'trip_slug' => 'leh-ladakh-bike-expedition',
                'trip_title' => '11 Days Value Edition Ladakh Bike Tour',
                'destination' => 'Leh Ladakh',
                'batch_date' => '2026-07-08',
                'travelers' => 2,
                'status' => 'confirmed',
                'total_amount' => 49998,
                'paid_amount' => 20000,
                'balance_due' => 29998,
                'invoice_number' => 'INV-2026-1042',
                'voucher_code' => 'VCH-LAD-1042',
                'documents' => [
                    [
                        'name' => 'passport-amit.pdf',
                        'mime_type' => 'application/pdf',
                        'category' => 'passport',
                    ],
                ],
            ],
            [
                'booking_ref' => 'BC-2026-1088',
                'trip_slug' => 'spiti-valley-road-trip',
                'trip_title' => 'Spiti Valley Road Trip — Chandratal Edition',
                'destination' => 'Spiti Valley',
                'batch_date' => '2026-08-12',
                'travelers' => 1,
                'status' => 'pending',
                'total_amount' => 18999,
                'paid_amount' => 5000,
                'balance_due' => 13999,
                'invoice_number' => 'INV-2026-1088',
                'voucher_code' => 'VCH-SPI-1088',
                'documents' => [],
            ],
            [
                'booking_ref' => 'BC-2025-0891',
                'trip_slug' => 'kashmir-great-lakes-trek',
                'trip_title' => 'Kashmir Great Lakes Trek',
                'destination' => 'Kashmir',
                'batch_date' => '2025-08-05',
                'travelers' => 1,
                'status' => 'completed',
                'total_amount' => 15999,
                'paid_amount' => 15999,
                'balance_due' => 0,
                'invoice_number' => 'INV-2025-0891',
                'voucher_code' => 'VCH-KAS-0891',
                'documents' => [
                    [
                        'name' => 'aadhaar-amit.pdf',
                        'mime_type' => 'application/pdf',
                        'category' => 'id_proof',
                    ],
                ],
            ],
        ];

        foreach ($amitBookings as $data) {
            $documents = $data['documents'];
            unset($data['documents']);

            $trip = Trip::query()->where('slug', $data['trip_slug'])->first();
            if ($trip) {
                $data['trip_id'] = $trip->id;
            }

            $booking = Booking::query()->updateOrCreate(
                ['booking_ref' => $data['booking_ref']],
                array_merge($data, ['user_id' => $amit->id])
            );

            foreach ($documents as $doc) {
                BookingDocument::query()->updateOrCreate(
                    [
                        'booking_id' => $booking->id,
                        'name' => $doc['name'],
                    ],
                    $doc
                );
            }
        }

        if ($priya) {
            $bhutanTrip = Trip::query()->where('slug', 'bhutan-cultural-escape')->first();

            Booking::query()->updateOrCreate(
                ['booking_ref' => 'BC-2026-1105'],
                [
                    'user_id' => $priya->id,
                    'trip_id' => $bhutanTrip?->id,
                    'trip_slug' => 'bhutan-cultural-escape',
                    'trip_title' => 'Bhutan Cultural Escape — 5N/6D',
                    'destination' => 'Bhutan',
                    'batch_date' => '2026-09-20',
                    'travelers' => 2,
                    'status' => 'confirmed',
                    'total_amount' => 89998,
                    'paid_amount' => 30000,
                    'balance_due' => 59998,
                    'invoice_number' => 'INV-2026-1105',
                    'voucher_code' => 'VCH-BHU-1105',
                ]
            );
        }
    }
}
