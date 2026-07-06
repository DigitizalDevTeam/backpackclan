<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PermissionResource;
use App\Models\Permission;
use Illuminate\Http\JsonResponse;

class PermissionController extends Controller
{
    public function index(): JsonResponse
    {
        $permissions = Permission::query()
            ->orderBy('group')
            ->orderBy('name')
            ->get()
            ->groupBy('group')
            ->map(fn ($items, $group) => [
                'group' => $group,
                'permissions' => PermissionResource::collection($items),
            ])
            ->values();

        return response()->json([
            'success' => true,
            'data' => $permissions,
        ]);
    }
}
