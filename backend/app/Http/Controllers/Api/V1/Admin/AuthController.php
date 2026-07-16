<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
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

        if ($user->isCustomer()) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Please use the customer login for traveler accounts'],
            ], 403);
        }

        $user->tokens()->where('name', 'admin')->delete();
        $token = $user->createToken('admin')->plainTextToken;

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

    public function changePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'currentPassword' => ['required', 'string'],
            'newPassword' => ['required', 'string', Password::defaults()],
        ]);

        $user = $request->user();

        if (! Hash::check($data['currentPassword'], $user->password)) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Current password is incorrect'],
            ], 400);
        }

        $user->update(['password' => $data['newPassword']]);

        return response()->json(['success' => true]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
        ]);

        app(\App\Services\PasswordResetService::class)->sendResetLink($data['email']);

        return response()->json([
            'success' => true,
            'message' => 'If that email exists, a reset link has been sent.',
        ]);
    }
}
