<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Razorpay\Api\Api;
use Razorpay\Api\Errors\SignatureVerificationError;

class RazorpayPaymentService
{
    public function __construct(private StripePaymentService $stripeAmounts)
    {
    }

    public function isConfigured(): bool
    {
        $key = config('razorpay.key_id');
        $secret = config('razorpay.key_secret');

        return is_string($key) && $key !== '' && is_string($secret) && $secret !== '';
    }

    public function api(): Api
    {
        if (! $this->isConfigured()) {
            throw ValidationException::withMessages([
                'form' => 'Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.',
            ]);
        }

        return new Api(config('razorpay.key_id'), config('razorpay.key_secret'));
    }

    /**
     * @return array{payment:Payment,orderId:string,amount:int,currency:string,keyId:string}
     */
    public function createOrder(Booking $booking, int $userId, string $mode): array
    {
        $resolved = $this->stripeAmounts->resolveAmount($booking, $mode);
        $currency = strtoupper((string) config('razorpay.currency', 'INR'));
        $api = $this->api();

        $order = $api->order->create([
            'receipt' => 'bk_'.$booking->id.'_'.time(),
            'amount' => $resolved['amount'] * 100,
            'currency' => $currency,
            'notes' => [
                'booking_id' => (string) $booking->id,
                'booking_ref' => (string) $booking->booking_ref,
                'user_id' => (string) $userId,
                'mode' => $resolved['mode'],
            ],
        ]);

        $payment = Payment::query()->create([
            'booking_id' => $booking->id,
            'user_id' => $userId,
            'amount' => $resolved['amount'],
            'currency' => strtolower($currency),
            'status' => 'pending',
            'provider' => 'razorpay',
            'mode' => $resolved['mode'],
            'razorpay_order_id' => $order['id'],
            'meta' => [
                'trip_slug' => $booking->trip_slug,
            ],
        ]);

        return [
            'payment' => $payment,
            'orderId' => (string) $order['id'],
            'amount' => $resolved['amount'],
            'currency' => $currency,
            'keyId' => (string) config('razorpay.key_id'),
        ];
    }

    public function confirmCheckout(
        Booking $booking,
        string $orderId,
        string $paymentId,
        string $signature
    ): Payment {
        $api = $this->api();

        try {
            $api->utility->verifyPaymentSignature([
                'razorpay_order_id' => $orderId,
                'razorpay_payment_id' => $paymentId,
                'razorpay_signature' => $signature,
            ]);
        } catch (SignatureVerificationError $e) {
            throw ValidationException::withMessages([
                'form' => 'Invalid Razorpay payment signature',
            ]);
        }

        return $this->applySucceededPayment($orderId, $paymentId);
    }

    public function applySucceededPayment(string $orderId, ?string $paymentId = null): Payment
    {
        $justSucceeded = false;

        $payment = DB::transaction(function () use ($orderId, $paymentId, &$justSucceeded) {
            /** @var Payment|null $payment */
            $payment = Payment::query()
                ->where('razorpay_order_id', $orderId)
                ->lockForUpdate()
                ->first();

            if (! $payment) {
                throw ValidationException::withMessages([
                    'form' => 'Payment not found for this order',
                ]);
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

            if ($booking->paid_amount > 0 && $booking->status === 'pending') {
                $booking->status = 'confirmed';
            }

            $booking->save();

            $payment->status = 'succeeded';
            $payment->paid_at = now();
            if ($paymentId) {
                $payment->razorpay_payment_id = $paymentId;
            }
            $payment->save();
            $justSucceeded = true;

            return $payment->fresh(['booking']);
        });

        if ($justSucceeded && $payment->booking) {
            app(\App\Services\BookingNotificationService::class)
                ->sendPaymentReceived($payment->booking->loadMissing('user'), $payment);
        }

        return $payment;
    }

    public function handleWebhook(string $payload, ?string $signature): void
    {
        $secret = config('razorpay.webhook_secret');
        if (is_string($secret) && $secret !== '' && is_string($signature) && $signature !== '') {
            $expected = hash_hmac('sha256', $payload, $secret);
            if (! hash_equals($expected, $signature)) {
                throw ValidationException::withMessages([
                    'form' => 'Invalid webhook signature',
                ]);
            }
        }

        $data = json_decode($payload, true);
        $event = $data['event'] ?? null;
        if ($event !== 'payment.captured' && $event !== 'order.paid') {
            return;
        }

        $paymentEntity = $data['payload']['payment']['entity'] ?? null;
        $orderId = is_array($paymentEntity) ? ($paymentEntity['order_id'] ?? null) : null;
        $paymentId = is_array($paymentEntity) ? ($paymentEntity['id'] ?? null) : null;

        if (! $orderId) {
            $orderEntity = $data['payload']['order']['entity'] ?? null;
            $orderId = is_array($orderEntity) ? ($orderEntity['id'] ?? null) : null;
        }

        if (! is_string($orderId) || $orderId === '') {
            return;
        }

        $this->applySucceededPayment($orderId, is_string($paymentId) ? $paymentId : null);
    }
}
