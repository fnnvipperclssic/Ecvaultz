<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPasswordExpiry
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !$user->password_changed_at) {
            return $next($request);
        }

        $expiryDays = (int) config('security.password.expiry_days', 90);

        if ($expiryDays > 0 && $user->password_changed_at->addDays($expiryDays)->isPast()) {
            // Whitelisted routes — these are always allowed
            $allowedRoutes = [
                'profile.edit',
                'profile.update',
                'profile.password.update',
                'logout',
                '2fa.challenge',
                'password.update',
            ];

            if ($request->routeIs($allowedRoutes)) {
                return $next($request);
            }

            // Block all other routes with a force redirect
            if ($request->expectsJson() || $request->isXmlHttpRequest()) {
                abort(403, 'Your password has expired. Please change it to continue.');
            }

            return redirect()->route('profile.edit')
                ->with('warning', 'Your password has expired. Please change it now for security purposes.');
        }

        return $next($request);
    }
}
