<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureStaff
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user()?->load('role');

        if (! $user || ! $user->isStaff()) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Forbidden'],
            ], 403);
        }

        return $next($request);
    }
}
