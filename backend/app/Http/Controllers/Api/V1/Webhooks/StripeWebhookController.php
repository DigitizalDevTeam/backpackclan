<?php

namespace App\Http\Controllers\Api\V1\Webhooks;

use App\Http\Controllers\Controller;
use App\Services\StripePaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;
use Stripe\Exception\SignatureVerificationException;
use UnexpectedValueException;

class StripeWebhookController extends Controller
{
    public function __construct(private StripePaymentService $stripe)
    {
    }

    public function handle(Request $request): Response
    {
        $payload = $request->getContent();
        $signature = (string) $request->header('Stripe-Signature', '');

        try {
            $event = $this->stripe->constructWebhookEvent($payload, $signature);
        } catch (UnexpectedValueException|SignatureVerificationException|ValidationException $e) {
            return response('Invalid payload', 400);
        }

        if ($event->type === 'payment_intent.succeeded') {
            /** @var \Stripe\PaymentIntent $intent */
            $intent = $event->data->object;
            $this->stripe->applySucceededIntent($intent->id);
        }

        if ($event->type === 'payment_intent.payment_failed') {
            /** @var \Stripe\PaymentIntent $intent */
            $intent = $event->data->object;
            \App\Models\Payment::query()
                ->where('stripe_payment_intent_id', $intent->id)
                ->where('status', 'pending')
                ->update(['status' => 'failed']);
        }

        return response('ok', 200);
    }
}
