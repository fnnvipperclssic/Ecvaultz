<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Enforces Two-Factor Authentication for routes in the '2fa' middleware group.
 *
 * If the user has 2FA enabled, they must have a valid '2fa.verified' session flag.
 * Supports idle timeout — if the 2FA session sits idle beyond the configured limit,
 * the user is redirected back to the challenge page. Also handles global 2FA
 * requirement (forces users without 2FA to set it up).
 */
class RequireTwoFactor
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return $next($request);
        }

        // If 2FA is not enabled for this user, proceed normally
        if (!$user->hasTwoFactorEnabled()) {
            // If 2FA is globally required but user hasn't enabled it,
            // redirect to setup (except for 2FA routes themselves)
            if (config('auth.two_factor.required', false)
                && !$request->routeIs('2fa.*')
                && !$request->routeIs('profile.*')) {
                return redirect()->route('2fa.setup');
            }
            return $next($request);
        }

        // If 2FA session is not completed
        if (!$request->session()->get('2fa.verified')) {
            if (!$request->routeIs('2fa.*') && !$request->routeIs('logout')) {
                $request->session()->put('url.intended', $request->url());
                return redirect()->route('2fa.challenge');
            }
        }

        // Verify session hasn't timed out beyond 2FA session lifetime
        $last2faActivity = $request->session()->get('2fa.last_activity');
        $idleTimeout = config('security.session.idle_timeout', 1800);

        if ($last2faActivity && (time() - $last2faActivity > $idleTimeout)) {
            $request->session()->forget(['2fa.verified', '2fa.last_activity']);
            if (!$request->routeIs('2fa.*')) {
                return redirect()->route('2fa.challenge');
            }
        }

        // Update last activity timestamp
        if ($request->session()->get('2fa.verified')) {
            $request->session()->put('2fa.last_activity', time());
        }

        return $next($request);
    }
}
