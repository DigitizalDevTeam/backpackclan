<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Http\Resources\PaymentResource;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\CashfreePaymentService;
use App\Services\RazorpayPaymentService;
use App\Services\StripePaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class BookingPaymentController extends Controller
{
    public function __construct(
        private StripePaymentService $stripe,
        private RazorpayPaymentService $razorpay,
        private CashfreePaymentService $cashfree
    ) {
    }

    public function options(Request $request, Booking $booking): JsonResponse
    {
        if ($booking->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Booking not found'],
            ], 404);
        }

        $depositPercent = max(1, min(100, (int) config('stripe.deposit_percent', 30)));
        $depositAmount = 0;
        if ((int) $booking->paid_amount === 0 && (int) $booking->balance_due > 0) {
            $depositAmount = (int) max(1, (int) floor(((int) $booking->total_amount) * $depositPercent / 100));
            $depositAmount = min($depositAmount, (int) $booking->balance_due);
        }

        $stripeConfigured = $this->stripe->isConfigured();
        $razorpayConfigured = $this->razorpay->isConfigured();
        $cashfreeConfigured = $this->cashfree->isConfigured();
        $providers = [];
        if ($stripeConfigured) {
            $providers[] = 'stripe';
        }
        if ($razorpayConfigured) {
            $providers[] = 'razorpay';
        }
        if ($cashfreeConfigured) {
            $providers[] = 'cashfree';
        }

        return response()->json([
            'success' => true,
            'data' => [
                'currency' => config('stripe.currency', 'inr'),
                'stripeConfigured' => $stripeConfigured,
                'razorpayConfigured' => $razorpayConfigured,
                'cashfreeConfigured' => $cashfreeConfigured,
                'providers' => $providers,
                'publishableKey' => config('stripe.key'),
                'razorpayKeyId' => config('razorpay.key_id'),
                'cashfreeMode' => $this->cashfree->mode(),
                'depositPercent' => $depositPercent,
                'depositAmount' => $depositAmount,
                'balanceDue' => (int) $booking->balance_due,
                'totalAmount' => (int) $booking->total_amount,
                'paidAmount' => (int) $booking->paid_amount,
                'canDeposit' => $depositAmount > 0,
            ],
        ]);
    }

    public function createIntent(Request $request, Booking $booking): JsonResponse
    {
        if ($booking->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Booking not found'],
            ], 404);
        }

        $data = $request->validate([
            'mode' => ['required', 'in:deposit,full,balance'],
            'provider' => ['nullable', Rule::in(['stripe', 'razorpay', 'cashfree'])],
        ]);

        $provider = $data['provider'] ?? null;
        if (! $provider) {
            if ($this->stripe->isConfigured()) {
                $provider = 'stripe';
            } elseif ($this->razorpay->isConfigured()) {
                $provider = 'razorpay';
            } elseif ($this->cashfree->isConfigured()) {
                $provider = 'cashfree';
            } else {
                return response()->json([
                    'success' => false,
                    'errors' => ['form' => 'No payment provider is configured'],
                ], 422);
            }
        }

        try {
            if ($provider === 'razorpay') {
                $result = $this->razorpay->createOrder(
                    $booking,
                    (int) $request->user()->id,
                    $data['mode']
                );

                return response()->json([
                    'success' => true,
                    'data' => [
                        'provider' => 'razorpay',
                        'clientSecret' => null,
                        'orderId' => $result['orderId'],
                        'amount' => $result['amount'],
                        'currency' => $result['currency'],
                        'keyId' => $result['keyId'],
                        'payment' => new PaymentResource($result['payment']),
                        'booking' => new BookingResource($booking->fresh('documents')),
                    ],
                ], 201);
            }

            if ($provider === 'cashfree') {
                $result = $this->cashfree->createOrder(
                    $booking,
                    (int) $request->user()->id,
                    $data['mode']
                );

                return response()->json([
                    'success' => true,
                    'data' => [
                        'provider' => 'cashfree',
                        'clientSecret' => null,
                        'orderId' => $result['orderId'],
                        'paymentSessionId' => $result['paymentSessionId'],
                        'amount' => $result['amount'],
                        'currency' => $result['currency'],
                        'mode' => $result['mode'],
                        'payment' => new PaymentResource($result['payment']),
                        'booking' => new BookingResource($booking->fresh('documents')),
                    ],
                ], 201);
            }

            $result = $this->stripe->createIntent(
                $booking,
                (int) $request->user()->id,
                $data['mode']
            );
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => [
                    'form' => collect($e->errors())->flatten()->first() ?? 'Could not start payment',
                ],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'provider' => 'stripe',
                'clientSecret' => $result['clientSecret'],
                'publishableKey' => $result['publishableKey'],
                'payment' => new PaymentResource($result['payment']),
                'booking' => new BookingResource($booking->fresh('documents')),
            ],
        ], 201);
    }

    public function confirm(Request $request, Booking $booking): JsonResponse
    {
        if ($booking->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Booking not found'],
            ], 404);
        }

        $data = $request->validate([
            'provider' => ['nullable', Rule::in(['stripe', 'razorpay', 'cashfree'])],
            'paymentIntentId' => ['nullable', 'string'],
            'razorpay_order_id' => ['nullable', 'string'],
            'razorpay_payment_id' => ['nullable', 'string'],
            'razorpay_signature' => ['nullable', 'string'],
            'orderId' => ['nullable', 'string'],
            'paymentId' => ['nullable', 'string'],
            'signature' => ['nullable', 'string'],
            'cashfree_order_id' => ['nullable', 'string'],
        ]);

        $provider = $data['provider'] ?? null;
        if (! $provider) {
            if (! empty($data['cashfree_order_id'])) {
                $provider = 'cashfree';
            } elseif (! empty($data['razorpay_order_id']) || ! empty($data['orderId'])) {
                $provider = 'razorpay';
            } else {
                $provider = 'stripe';
            }
        }

        try {
            if ($provider === 'cashfree') {
                $orderId = $data['cashfree_order_id'] ?? $data['orderId'] ?? null;

                if (! $orderId) {
                    return response()->json([
                        'success' => false,
                        'errors' => ['form' => 'Cashfree order id is required'],
                    ], 422);
                }

                $owns = Payment::query()
                    ->where('booking_id', $booking->id)
                    ->where('cashfree_order_id', $orderId)
                    ->exists();

                if (! $owns) {
                    return response()->json([
                        'success' => false,
                        'errors' => ['form' => 'Payment not found for this booking'],
                    ], 404);
                }

                $updated = $this->cashfree->confirmCheckout($booking, $orderId);
            } elseif ($provider === 'razorpay') {
                $orderId = $data['razorpay_order_id'] ?? $data['orderId'] ?? null;
                $paymentId = $data['razorpay_payment_id'] ?? $data['paymentId'] ?? null;
                $signature = $data['razorpay_signature'] ?? $data['signature'] ?? null;

                if (! $orderId || ! $paymentId || ! $signature) {
                    return response()->json([
                        'success' => false,
                        'errors' => ['form' => 'Razorpay payment details are required'],
                    ], 422);
                }

                $owns = Payment::query()
                    ->where('booking_id', $booking->id)
                    ->where('razorpay_order_id', $orderId)
                    ->exists();

                if (! $owns) {
                    return response()->json([
                        'success' => false,
                        'errors' => ['form' => 'Payment not found for this booking'],
                    ], 404);
                }

                $updated = $this->razorpay->confirmCheckout(
                    $booking,
                    $orderId,
                    $paymentId,
                    $signature
                );
            } else {
                if (empty($data['paymentIntentId'])) {
                    return response()->json([
                        'success' => false,
                        'errors' => ['form' => 'paymentIntentId is required'],
                    ], 422);
                }

                $payment = Payment::query()
                    ->where('booking_id', $booking->id)
                    ->where('stripe_payment_intent_id', $data['paymentIntentId'])
                    ->first();

                if (! $payment) {
                    return response()->json([
                        'success' => false,
                        'errors' => ['form' => 'Payment not found for this booking'],
                    ], 404);
                }

                $updated = $this->stripe->syncIntentFromStripe($data['paymentIntentId']);
            }
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => [
                    'form' => collect($e->errors())->flatten()->first() ?? 'Could not confirm payment',
                ],
            ], 422);
        }

        if (! $updated || $updated->status !== 'succeeded') {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Payment is not completed yet'],
            ], 400);
        }

        $booking->refresh()->load('documents');

        return response()->json([
            'success' => true,
            'data' => [
                'payment' => new PaymentResource($updated),
                'booking' => new BookingResource($booking),
            ],
        ]);
    }
}
