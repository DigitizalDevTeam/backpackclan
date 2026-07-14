<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Controller;
use App\Services\CouponService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CouponController extends Controller
{
    public function __construct(private CouponService $coupons)
    {
    }

    public function validateCode(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:50'],
            'subtotal' => ['required', 'integer', 'min:0'],
            'tripSlug' => ['nullable', 'string', 'max:255'],
        ]);

        try {
            $result = $this->coupons->validate(
                $data['code'],
                (int) $data['subtotal'],
                $data['tripSlug'] ?? null
            );
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => [
                    'form' => collect($e->errors())->flatten()->first() ?? 'Invalid coupon',
                ],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'code' => $result['code'],
                'discount' => $result['discount'],
                'type' => $result['coupon']->type,
                'value' => (int) $result['coupon']->value,
                'description' => $result['coupon']->description,
            ],
        ]);
    }
}
