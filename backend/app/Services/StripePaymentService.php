<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Stripe\Exception\ApiErrorException;
use Stripe\PaymentIntent;
use Stripe\StripeClient;
use Stripe\Webhook;

class StripePaymentService
{
    public function client(): StripeClient
    {
        $secret = config('stripe.secret');
        if (! is_string($secret) || $secret === '') {
            throw ValidationException::withMessages([
                'form' => 'Stripe is not configured. Set STRIPE_SECRET in the backend .env.',
            ]);
        }

        return new StripeClient($secret);
    }

    public function isConfigured(): bool
    {
        return is_string(config('stripe.secret')) && config('stripe.secret') !== '';
    }

    /**
     * @return array{amount:int,mode:string}
     */
    public function resolveAmount(Booking $booking, string $mode): array
    {
        $balance = (int) $booking->balance_due;
        if ($balance <= 0) {
            throw ValidationException::withMessages([
                'form' => 'This booking has no balance due',
            ]);
        }

        $mode = strtolower($mode);
        if (! in_array($mode, ['deposit', 'full', 'balance'], true)) {
            throw ValidationException::withMessages([
                'form' => 'Invalid payment mode',
            ]);
        }

        if ($mode === 'deposit') {
            if ((int) $booking->paid_amount > 0) {
                throw ValidationException::withMessages([
                    'form' => 'Deposit is only available on unpaid bookings. Pay the remaining balance instead.',
                ]);
            }

            $percent = max(1, min(100, (int) config('stripe.deposit_percent', 30)));
            $amount = (int) max(1, (int) floor(((int) $booking->total_amount) * $percent / 100));
            $amount = min($amount, $balance);

            return ['amount' => $amount, 'mode' => 'deposit'];
        }

        return ['amount' => $balance, 'mode' => $mode === 'full' ? 'full' : 'balance'];
    }

    /**
     * @return array{payment:Payment,clientSecret:string,publishableKey:?string}
     */
    public function createIntent(Booking $booking, int $userId, string $mode): array
    {
        $resolved = $this->resolveAmount($booking, $mode);
        $currency = strtolower((string) config('stripe.currency', 'inr'));
        $stripe = $this->client();

        try {
            $intent = $stripe->paymentIntents->create([
                'amount' => $resolved['amount'] * 100,
                'currency' => $currency,
                'automatic_payment_methods' => ['enabled' => true],
                'metadata' => [
                    'booking_id' => (string) $booking->id,
                    'booking_ref' => (string) $booking->booking_ref,
                    'user_id' => (string) $userId,
                    'mode' => $resolved['mode'],
                ],
                'receipt_email' => $booking->contact_email ?: null,
                'description' => 'Backpackclan booking '.$booking->booking_ref,
            ]);
        } catch (ApiErrorException $e) {
            throw ValidationException::withMessages([
                'form' => $e->getMessage(),
            ]);
        }

        $payment = Payment::query()->create([
            'booking_id' => $booking->id,
            'user_id' => $userId,
            'amount' => $resolved['amount'],
            'currency' => $currency,
            'status' => 'pending',
            'provider' => 'stripe',
            'mode' => $resolved['mode'],
            'stripe_payment_intent_id' => $intent->id,
            'meta' => [
                'trip_slug' => $booking->trip_slug,
            ],
        ]);

        return [
            'payment' => $payment,
            'clientSecret' => (string) $intent->client_secret,
            'publishableKey' => config('stripe.key'),
        ];
    }

    public function applySucceededIntent(string $paymentIntentId): ?Payment
    {
        $justSucceeded = false;

        $payment = DB::transaction(function () use ($paymentIntentId, &$justSucceeded) {
            /** @var Payment|null $payment */
            $payment = Payment::query()
                ->where('stripe_payment_intent_id', $paymentIntentId)
                ->lockForUpdate()
                ->first();

            if (! $payment) {
                return null;
            }

            if ($payment->status === 'succeeded') {
                return $payment;
            }

            /** @var Booking $booking */
            $booking = Booking::query()
                ->whereKey($payment->booking_id)
                ->lockForUpdate()
                ->firstOrFail();

            $apply = min((int) $payment->amount, (int) $booking->balance_due);
            $booking->paid_amount = (int) $booking->paid_amount + $apply;
            $booking->balance_due = max(0, (int) $booking->total_amount - (int) $booking->paid_amount);

            if ($booking->paid_amount > 0 && in_array($booking->status, ['pending'], true)) {
                $booking->status = 'confirmed';
            }

            $booking->save();

            $payment->status = 'succeeded';
            $payment->paid_at = now();
            $payment->save();
            $justSucceeded = true;

            return $payment->fresh(['booking']);
        });

        if ($payment && $justSucceeded && $payment->booking) {
            app(\App\Services\BookingNotificationService::class)
                ->sendPaymentReceived($payment->booking->loadMissing('user'), $payment);

            app(\App\Services\CouponService::class)->commitOnFirstPayment(
                $payment->booking,
                $payment
            );
        }

        return $payment;
    }

    public function syncIntentFromStripe(string $paymentIntentId): ?Payment
    {
        $stripe = $this->client();
        $intent = $stripe->paymentIntents->retrieve($paymentIntentId);

        if ($intent->status === 'succeeded') {
            return $this->applySucceededIntent($paymentIntentId);
        }

        $payment = Payment::query()
            ->where('stripe_payment_intent_id', $paymentIntentId)
            ->first();

        if ($payment && in_array($intent->status, ['canceled', 'requires_payment_method'], true)) {
            if ($payment->status === 'pending' && $intent->status === 'canceled') {
                $payment->status = 'canceled';
                $payment->save();
            }
        }

        return $payment;
    }

    public function constructWebhookEvent(string $payload, string $signature): \Stripe\Event
    {
        $secret = config('stripe.webhook_secret');
        if (! is_string($secret) || $secret === '') {
            throw ValidationException::withMessages([
                'form' => 'Stripe webhook secret is not configured',
            ]);
        }

        return Webhook::constructEvent($payload, $signature, $secret);
    }
}
