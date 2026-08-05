<?php

namespace App\Http\Controllers\Api\V1\Webhooks;

use App\Http\Controllers\Controller;
use App\Services\CashfreePaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

class CashfreeWebhookController extends Controller
{
    public function __construct(private CashfreePaymentService $cashfree)
    {
    }

    public function handle(Request $request): Response
    {
        try {
            $this->cashfree->handleWebhook(
                $request->getContent(),
                $request->header('x-webhook-signature'),
                $request->header('x-webhook-timestamp')
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
