<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Services\PasswordResetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class PasswordResetController extends Controller
{
    public function __construct(private PasswordResetService $passwordReset)
    {
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $this->passwordReset->sendResetLink($data['email']);

        return response()->json([
            'success' => true,
            'message' => 'If that email exists, a reset link has been sent.',
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'confirmed', Password::defaults()],
        ]);

        try {
            $this->passwordReset->resetPassword(
                $data['email'],
                $data['token'],
                $data['password']
            );
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => [
                    'form' => collect($e->errors())->flatten()->first() ?? 'Could not reset password',
                ],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Password updated. You can sign in with your new password.',
        ]);
    }
}
