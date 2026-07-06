<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\SettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function __construct(private SettingsService $settings) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->settings->all(),
        ]);
    }

    public function show(string $group): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->settings->group($group),
        ]);
    }

    public function update(Request $request, string $group): JsonResponse
    {
        $data = $this->settings->updateGroup($group, $request->all());

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function maintenanceStatus(): JsonResponse
    {
        $maintenance = $this->settings->group('maintenance');

        return response()->json([
            'success' => true,
            'data' => [
                'enabled' => (bool) ($maintenance['enabled'] ?? false),
                'message' => $maintenance['message'] ?? '',
            ],
        ]);
    }
}
