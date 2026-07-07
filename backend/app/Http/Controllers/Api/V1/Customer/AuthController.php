<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'min:10', 'max:20'],
            'password' => ['required', 'string', Password::defaults()],
        ]);

        $customerRole = Role::query()->where('slug', 'customer')->firstOrFail();

        $user = User::query()->create([
            'name' => $data['name'],
            'email' => strtolower($data['email']),
            'phone' => $data['phone'],
            'password' => $data['password'],
            'role_id' => $customerRole->id,
            'is_active' => true,
        ]);

        $user->load('role.permissions');
        $user->tokens()->where('name', 'customer')->delete();
        $token = $user->createToken('customer')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
            ],
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()
            ->with('role.permissions')
            ->where('email', $credentials['email'])
            ->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Invalid email or password'],
            ], 401);
        }

        if (! $user->is_active) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Your account has been deactivated'],
            ], 403);
        }

        if (! $user->isCustomer()) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Please use the staff login for admin accounts'],
            ], 403);
        }

        $user->tokens()->where('name', 'customer')->delete();
        $token = $user->createToken('customer')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json(['success' => true]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('role.permissions');

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
        ]);
    }
}
