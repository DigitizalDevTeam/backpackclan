<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Models\Departure;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ExpireUnpaidBookings extends Command
{
    protected $signature = 'bookings:expire-unpaid';

    protected $description = 'Cancel unpaid pending bookings past the payment timeout and release seats';

    public function handle(): int
    {
        $minutes = max(5, (int) config('booking.payment_timeout_minutes', 30));
        $cutoff = now()->subMinutes($minutes);

        $expired = Booking::query()
            ->where('status', 'pending')
            ->where('paid_amount', 0)
            ->where('created_at', '<', $cutoff)
            ->get();

        $count = 0;

        foreach ($expired as $booking) {
            DB::transaction(function () use ($booking, &$count) {
                /** @var Booking|null $locked */
                $locked = Booking::query()->whereKey($booking->id)->lockForUpdate()->first();

                if (! $locked || $locked->status !== 'pending' || (int) $locked->paid_amount > 0) {
                    return;
                }

                if ($locked->departure_id) {
                    $departure = Departure::query()
                        ->whereKey($locked->departure_id)
                        ->lockForUpdate()
                        ->first();

                    if ($departure) {
                        $departure->booked_seats = max(
                            0,
                            (int) $departure->booked_seats - (int) $locked->travelers
                        );
                        $departure->save();
                    }
                }

                $locked->status = 'cancelled';
                $locked->save();
                $count++;
            });
        }

        if ($count > 0) {
            $this->info("Expired {$count} unpaid booking(s).");
        }

        return self::SUCCESS;
    }
}
