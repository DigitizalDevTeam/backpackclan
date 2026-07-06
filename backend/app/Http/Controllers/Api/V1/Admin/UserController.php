<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::query()
            ->with('role')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => UserResource::collection($users),
        ]);
    }

    public function show(User $user): JsonResponse
    {
        $user->load('role.permissions');

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'roleId' => ['required', 'exists:roles,id'],
            'isActive' => ['sometimes', 'boolean'],
            'password' => ['required', Password::defaults()],
        ]);

        $user = User::query()->create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role_id' => $validated['roleId'],
            'is_active' => $validated['isActive'] ?? true,
            'password' => $validated['password'],
        ]);

        $user->load('role.permissions');

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
        ], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'roleId' => ['sometimes', 'exists:roles,id'],
            'isActive' => ['sometimes', 'boolean'],
            'password' => ['sometimes', 'nullable', Password::defaults()],
        ]);

        if (array_key_exists('name', $validated)) {
            $user->name = $validated['name'];
        }
        if (array_key_exists('email', $validated)) {
            $user->email = $validated['email'];
        }
        if (array_key_exists('roleId', $validated)) {
            $user->role_id = $validated['roleId'];
        }
        if (array_key_exists('isActive', $validated)) {
            if (! $validated['isActive'] && $this->isLastActiveAdmin($user)) {
                return response()->json([
                    'success' => false,
                    'errors' => ['form' => 'Cannot deactivate the last active administrator'],
                ], 400);
            }
            $user->is_active = $validated['isActive'];
        }
        if (! empty($validated['password'])) {
            $user->password = $validated['password'];
        }

        $user->save();
        $user->load('role.permissions');

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        if ($this->isLastActiveAdmin($user)) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Cannot delete the last active administrator'],
            ], 400);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['success' => true]);
    }

    private function isLastActiveAdmin(User $user): bool
    {
        $user->loadMissing('role');

        if (! $user->role?->hasPermission('users.delete')) {
            return false;
        }

        if (! $user->is_active) {
            return false;
        }

        $adminRoleIds = Role::query()
            ->whereHas('permissions', fn ($q) => $q->where('slug', 'users.delete'))
            ->pluck('id');

        $activeAdminCount = User::query()
            ->whereIn('role_id', $adminRoleIds)
            ->where('is_active', true)
            ->count();

        return $activeAdminCount <= 1;
    }
}
