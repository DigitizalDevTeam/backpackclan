<?php

namespace App\Http\Controllers\Api\V1\Webhooks;

use App\Http\Controllers\Controller;
use App\Services\RazorpayPaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

class RazorpayWebhookController extends Controller
{
    public function __construct(private RazorpayPaymentService $razorpay)
    {
    }

    public function handle(Request $request): Response
    {
        try {
            $this->razorpay->handleWebhook(
                $request->getContent(),
                $request->header('X-Razorpay-Signature')
            );
        } catch (ValidationException $e) {
            return response('Invalid signature', 400);
        } catch (\Throwable $e) {
            report($e);

            return response('Error', 500);
        }

        return response('OK', 200);
    }
}
