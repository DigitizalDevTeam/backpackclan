<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class CashfreePaymentService
{
    public function __construct(private StripePaymentService $stripeAmounts)
    {
    }

    public function isConfigured(): bool
    {
        $appId = config('cashfree.app_id');
        $secret = config('cashfree.secret_key');

        return is_string($appId) && $appId !== '' && is_string($secret) && $secret !== '';
    }

    public function mode(): string
    {
        $env = strtolower((string) config('cashfree.env', 'sandbox'));

        return $env === 'production' ? 'production' : 'sandbox';
    }

    private function baseUrl(): string
    {
        return $this->mode() === 'production'
            ? 'https://api.cashfree.com/pg'
            : 'https://sandbox.cashfree.com/pg';
    }

    /**
     * @return array<string, string>
     */
    private function headers(): array
    {
        if (! $this->isConfigured()) {
            throw ValidationException::withMessages([
                'form' => 'Cashfree is not configured. Set CASHFREE_APP_ID and CASHFREE_SECRET_KEY.',
            ]);
        }

        return [
            'x-client-id' => (string) config('cashfree.app_id'),
            'x-client-secret' => (string) config('cashfree.secret_key'),
            'x-api-version' => (string) config('cashfree.api_version', '2025-01-01'),
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ];
    }

    /**
     * @return array{
     *   payment:Payment,
     *   orderId:string,
     *   paymentSessionId:string,
     *   amount:int,
     *   currency:string,
     *   mode:string
     * }
     */
    public function createOrder(Booking $booking, int $userId, string $mode): array
    {
        $resolved = $this->stripeAmounts->resolveAmount($booking, $mode);
        $currency = strtoupper((string) config('cashfree.currency', 'INR'));
        $booking->loadMissing('user');

        /** @var User|null $user */
        $user = $booking->user;
        $customerName = trim((string) ($user?->name ?? ''));
        if ($customerName === '') {
            $customerName = 'Customer';
        }

        $customerEmail = trim((string) ($booking->contact_email ?: $user?->email ?: ''));
        $customerPhone = preg_replace('/\D+/', '', (string) ($booking->contact_phone ?? '')) ?: '';

        if ($customerPhone === '') {
            throw ValidationException::withMessages([
                'form' => 'A valid phone number is required for Cashfree payments.',
            ]);
        }

        if (str_starts_with($customerPhone, '91') && strlen($customerPhone) === 12) {
            $customerPhone = '+'.$customerPhone;
        } elseif (strlen($customerPhone) === 10) {
            $customerPhone = '+91'.$customerPhone;
        } elseif (! str_starts_with($customerPhone, '+')) {
            $customerPhone = '+'.$customerPhone;
        }

        $orderId = 'bk_'.$booking->id.'_'.time();
        $frontend = rtrim((string) config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), '/');
        $returnUrl = $frontend.'/book/pay/'.$booking->id.'?cashfree_order_id='.$orderId;

        $payload = [
            'order_id' => $orderId,
            'order_amount' => (float) $resolved['amount'],
            'order_currency' => $currency,
            'customer_details' => [
                'customer_id' => (string) $userId,
                'customer_name' => $customerName,
                'customer_email' => $customerEmail !== '' ? $customerEmail : 'customer'.$userId.'@backpackclan.local',
                'customer_phone' => $customerPhone,
            ],
            'order_meta' => [
                'return_url' => $returnUrl,
            ],
            'order_note' => 'Booking '.$booking->booking_ref.' ('.$resolved['mode'].')',
            'order_tags' => [
                'booking_id' => (string) $booking->id,
                'booking_ref' => (string) $booking->booking_ref,
                'mode' => $resolved['mode'],
            ],
        ];

        $response = Http::withHeaders($this->headers())
            ->post($this->baseUrl().'/orders', $payload);

        \Log::info('Cashfree order creation response', ['response' => $response->body()]);

        if (! $response->successful()) {
            $message = $response->json('message')
                ?? $response->json('message.0')
                ?? $response->body()
                ?? 'Cashfree order creation failed';

            throw ValidationException::withMessages([
                'form' => is_string($message) ? $message : 'Cashfree order creation failed',
            ]);
        }

        $data = $response->json();
        $cfOrderId = (string) ($data['order_id'] ?? $orderId);
        $paymentSessionId = (string) ($data['payment_session_id'] ?? '');

        if ($paymentSessionId === '') {
            throw ValidationException::withMessages([
                'form' => 'Cashfree did not return a payment session id',
            ]);
        }

        $payment = Payment::query()->create([
            'booking_id' => $booking->id,
            'user_id' => $userId,
            'amount' => $resolved['amount'],
            'currency' => strtolower($currency),
            'status' => 'pending',
            'provider' => 'cashfree',
            'mode' => $resolved['mode'],
            'cashfree_order_id' => $cfOrderId,
            'cashfree_payment_session_id' => $paymentSessionId,
            'meta' => [
                'trip_slug' => $booking->trip_slug,
            ],
        ]);

        return [
            'payment' => $payment,
            'orderId' => $cfOrderId,
            'paymentSessionId' => $paymentSessionId,
            'amount' => $resolved['amount'],
            'currency' => $currency,
            'mode' => $this->mode(),
        ];
    }

    public function confirmCheckout(Booking $booking, string $orderId): Payment
    {
        $owns = Payment::query()
            ->where('booking_id', $booking->id)
            ->where('cashfree_order_id', $orderId)
            ->exists();

        if (! $owns) {
            throw ValidationException::withMessages([
                'form' => 'Payment not found for this booking',
            ]);
        }

        $order = $this->fetchOrder($orderId);
        $status = strtoupper((string) ($order['order_status'] ?? ''));

        if ($status !== 'PAID') {
            throw ValidationException::withMessages([
                'form' => 'Payment is not completed yet (status: '.($status !== '' ? $status : 'unknown').')',
            ]);
        }

        $cfPaymentId = null;
        $payments = $order['payments'] ?? null;
        if (is_array($payments) && isset($payments[0]) && is_array($payments[0])) {
            $cfPaymentId = isset($payments[0]['cf_payment_id'])
                ? (string) $payments[0]['cf_payment_id']
                : null;
        }

        return $this->applySucceededPayment($orderId, $cfPaymentId);
    }

    /**
     * @return array<string, mixed>
     */
    public function fetchOrder(string $orderId): array
    {
        $response = Http::withHeaders($this->headers())
            ->get($this->baseUrl().'/orders/'.$orderId);

        if (! $response->successful()) {
            throw ValidationException::withMessages([
                'form' => 'Could not verify Cashfree order status',
            ]);
        }

        $data = $response->json();

        return is_array($data) ? $data : [];
    }

    public function applySucceededPayment(string $orderId, ?string $paymentId = null): Payment
    {
        $justSucceeded = false;

        $payment = DB::transaction(function () use ($orderId, $paymentId, &$justSucceeded) {
            /** @var Payment|null $payment */
            $payment = Payment::query()
                ->where('cashfree_order_id', $orderId)
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
                $payment->cashfree_payment_id = $paymentId;
            }
            $payment->save();
            $justSucceeded = true;

            return $payment->fresh(['booking']);
        });

        if ($justSucceeded && $payment->booking) {
            app(BookingNotificationService::class)
                ->sendPaymentReceived($payment->booking->loadMissing('user'), $payment);

            app(CouponService::class)->commitOnFirstPayment(
                $payment->booking,
                $payment
            );
        }

        return $payment;
    }

    public function handleWebhook(string $payload, ?string $signature, ?string $timestamp): void
    {
        $secret = config('cashfree.webhook_secret') ?: config('cashfree.secret_key');

        if (
            is_string($secret) && $secret !== ''
            && is_string($signature) && $signature !== ''
            && is_string($timestamp) && $timestamp !== ''
        ) {
            $expected = base64_encode(hash_hmac('sha256', $timestamp.$payload, $secret, true));
            if (! hash_equals($expected, $signature)) {
                throw ValidationException::withMessages([
                    'form' => 'Invalid webhook signature',
                ]);
            }
        }

        $data = json_decode($payload, true);
        if (! is_array($data)) {
            return;
        }

        $type = $data['type'] ?? null;
        if ($type !== 'PAYMENT_SUCCESS_WEBHOOK') {
            return;
        }

        $order = $data['data']['order'] ?? null;
        $paymentEntity = $data['data']['payment'] ?? null;

        $orderId = is_array($order) ? ($order['order_id'] ?? null) : null;
        $paymentId = is_array($paymentEntity)
            ? ($paymentEntity['cf_payment_id'] ?? $paymentEntity['payment_id'] ?? null)
            : null;

        if (! is_string($orderId) || $orderId === '') {
            return;
        }

        $this->applySucceededPayment(
            $orderId,
            is_string($paymentId) || is_numeric($paymentId) ? (string) $paymentId : null
        );
    }
}
