<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Coupon;
use App\Models\Payment;
use Illuminate\Validation\ValidationException;

class CouponService
{
    /**
     * @return array{coupon:Coupon,discount:int,code:string}
     */
    public function validate(string $code, int $subtotal, ?string $tripSlug = null): array
    {
        $coupon = Coupon::query()
            ->whereRaw('UPPER(code) = ?', [strtoupper(trim($code))])
            ->first();

        if (! $coupon || ! $coupon->is_active) {
            throw ValidationException::withMessages([
                'form' => 'Invalid or inactive coupon code',
            ]);
        }

        $now = now();
        if ($coupon->starts_at && $now->lt($coupon->starts_at)) {
            throw ValidationException::withMessages([
                'form' => 'This coupon is not active yet',
            ]);
        }
        if ($coupon->ends_at && $now->gt($coupon->ends_at)) {
            throw ValidationException::withMessages([
                'form' => 'This coupon has expired',
            ]);
        }
        if ($coupon->trip_slug && $tripSlug && $coupon->trip_slug !== $tripSlug) {
            throw ValidationException::withMessages([
                'form' => 'This coupon is not valid for this trip',
            ]);
        }
        if ($coupon->usage_limit !== null && $coupon->used_count >= $coupon->usage_limit) {
            throw ValidationException::withMessages([
                'form' => 'This coupon has reached its usage limit',
            ]);
        }
        if ($subtotal < (int) $coupon->min_amount) {
            throw ValidationException::withMessages([
                'form' => 'Cart total is below the minimum for this coupon',
            ]);
        }

        $discount = $this->calculateDiscount($coupon, $subtotal);
        if ($discount <= 0) {
            throw ValidationException::withMessages([
                'form' => 'Coupon does not apply a discount for this amount',
            ]);
        }

        return [
            'coupon' => $coupon,
            'discount' => $discount,
            'code' => $coupon->code,
        ];
    }

    public function calculateDiscount(Coupon $coupon, int $subtotal): int
    {
        if ($coupon->type === 'percent') {
            $discount = (int) floor($subtotal * ((int) $coupon->value) / 100);
        } else {
            $discount = (int) $coupon->value;
        }

        if ($coupon->max_discount !== null) {
            $discount = min($discount, (int) $coupon->max_discount);
        }

        return max(0, min($discount, $subtotal));
    }

    public function incrementUsage(Coupon $coupon): void
    {
        $coupon->increment('used_count');
    }

    public function commitOnFirstPayment(Booking $booking, Payment $payment): void
    {
        if (empty($booking->coupon_code)) {
            return;
        }

        $priorSucceeded = Payment::query()
            ->where('booking_id', $booking->id)
            ->where('status', 'succeeded')
            ->where('id', '!=', $payment->id)
            ->exists();

        if ($priorSucceeded) {
            return;
        }

        $coupon = Coupon::query()
            ->whereRaw('UPPER(code) = ?', [strtoupper((string) $booking->coupon_code)])
            ->first();

        if ($coupon) {
            $this->incrementUsage($coupon);
        }
    }
}
