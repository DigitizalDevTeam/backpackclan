<?php

namespace App\Services;

use App\Mail\PasswordResetMail;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PasswordResetService
{
    public function sendResetLink(string $email): void
    {
        $email = strtolower(trim($email));
        $user = User::query()->where('email', $email)->first();

        if (! $user || ! $user->is_active) {
            return;
        }

        $token = Str::random(64);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => Hash::make($token),
                'created_at' => now(),
            ]
        );

        $resetUrl = rtrim((string) config('app.frontend_url'), '/')
            .'/reset-password?token='.urlencode($token)
            .'&email='.urlencode($user->email);

        try {
            Mail::to($user->email)->send(new PasswordResetMail($user, $resetUrl));
        } catch (\Throwable $e) {
            report($e);
        }

        if (config('app.debug')) {
            Log::info('Password reset link', [
                'email' => $user->email,
                'url' => $resetUrl,
            ]);
        }
    }

    public function resetPassword(string $email, string $token, string $password): void
    {
        $email = strtolower(trim($email));

        $record = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->first();

        if (! $record || ! Hash::check($token, $record->token)) {
            throw ValidationException::withMessages([
                'form' => 'Invalid or expired reset link',
            ]);
        }

        if (now()->diffInMinutes($record->created_at) > 60 * 24) {
            DB::table('password_reset_tokens')->where('email', $email)->delete();

            throw ValidationException::withMessages([
                'form' => 'Reset link has expired. Please request a new one.',
            ]);
        }

        $user = User::query()->where('email', $email)->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'form' => 'Invalid or expired reset link',
            ]);
        }

        $user->update(['password' => $password]);
        DB::table('password_reset_tokens')->where('email', $email)->delete();
        $user->tokens()->delete();
    }
}
