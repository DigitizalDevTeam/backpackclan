<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Support\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CouponController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Coupon::query()->orderByDesc('created_at');

        if ($search = $request->string('search')->trim()->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('trip_slug', 'like', "%{$search}%");
            });
        }

        if ($request->filled('active')) {
            $query->where('is_active', filter_var($request->input('active'), FILTER_VALIDATE_BOOLEAN));
        }

        return response()->json([
            'success' => true,
            'data' => $query->get()->map->toApiArray()->values(),
        ]);
    }

    public function show(Coupon $coupon): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $coupon->toApiArray(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $coupon = Coupon::query()->create($this->validated($request));
        ActivityLogger::log("Coupon {$coupon->code} created", 'coupons');

        return response()->json([
            'success' => true,
            'data' => $coupon->toApiArray(),
        ], 201);
    }

    public function update(Request $request, Coupon $coupon): JsonResponse
    {
        $coupon->update($this->validated($request, $coupon));
        ActivityLogger::log("Coupon {$coupon->code} updated", 'coupons');

        return response()->json([
            'success' => true,
            'data' => $coupon->fresh()->toApiArray(),
        ]);
    }

    public function destroy(Coupon $coupon): JsonResponse
    {
        $code = $coupon->code;
        $coupon->delete();
        ActivityLogger::log("Coupon {$code} deleted", 'coupons');

        return response()->json(['success' => true]);
    }

    public function patch(Request $request, Coupon $coupon): JsonResponse
    {
        $action = $request->input('action');

        if ($action === 'toggle') {
            $coupon->update(['is_active' => ! $coupon->is_active]);
            ActivityLogger::log(
                "Coupon {$coupon->code} ".($coupon->is_active ? 'activated' : 'deactivated'),
                'coupons'
            );

            return response()->json([
                'success' => true,
                'data' => $coupon->fresh()->toApiArray(),
            ]);
        }

        if ($action === 'reset_usage') {
            $coupon->update(['used_count' => 0]);
            ActivityLogger::log("Coupon {$coupon->code} usage reset", 'coupons');

            return response()->json([
                'success' => true,
                'data' => $coupon->fresh()->toApiArray(),
            ]);
        }

        return response()->json([
            'success' => false,
            'errors' => ['form' => 'Invalid action'],
        ], 400);
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Coupon $coupon = null): array
    {
        $data = $request->validate([
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('coupons', 'code')->ignore($coupon?->id),
            ],
            'type' => ['required', Rule::in(['percent', 'fixed'])],
            'value' => ['required', 'integer', 'min:1'],
            'minAmount' => ['nullable', 'integer', 'min:0'],
            'maxDiscount' => ['nullable', 'integer', 'min:1'],
            'usageLimit' => ['nullable', 'integer', 'min:1'],
            'tripSlug' => ['nullable', 'string', 'max:255'],
            'isActive' => ['nullable', 'boolean'],
            'startsAt' => ['nullable', 'date'],
            'endsAt' => ['nullable', 'date', 'after_or_equal:startsAt'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        if ($data['type'] === 'percent' && (int) $data['value'] > 100) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'value' => ['Percent value cannot exceed 100'],
            ]);
        }

        return [
            'code' => strtoupper(trim($data['code'])),
            'type' => $data['type'],
            'value' => (int) $data['value'],
            'min_amount' => (int) ($data['minAmount'] ?? 0),
            'max_discount' => array_key_exists('maxDiscount', $data)
                ? ($data['maxDiscount'] !== null ? (int) $data['maxDiscount'] : null)
                : null,
            'usage_limit' => array_key_exists('usageLimit', $data)
                ? ($data['usageLimit'] !== null ? (int) $data['usageLimit'] : null)
                : null,
            'trip_slug' => ! empty($data['tripSlug']) ? trim($data['tripSlug']) : null,
            'is_active' => $data['isActive'] ?? true,
            'starts_at' => $data['startsAt'] ?? null,
            'ends_at' => $data['endsAt'] ?? null,
            'description' => $data['description'] ?? null,
        ];
    }
}
