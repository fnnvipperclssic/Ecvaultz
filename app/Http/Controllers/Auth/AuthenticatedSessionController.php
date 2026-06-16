<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\ActivityLog;
use App\Services\SecurityService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    protected SecurityService $security;

    public function __construct(SecurityService $security)
    {
        $this->security = $security;
    }

    public function create(): Response
    {
        return Inertia::render('Auth/Login');
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = Auth::user();

        // Record successful login
        $authService = app(\App\Services\AuthenticationService::class);
        $authService->recordSuccessfulAttempt($user, $request->ip(), $request->userAgent());

        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);

        ActivityLog::log($user->id, 'login', $request->ip(), $request->userAgent());

        // Check for IP anomaly
        $ipChanged = $authService->detectIpAnomaly($user, $request->ip());
        if ($ipChanged) {
            ActivityLog::log($user->id, 'new_device_login', $request->ip(), $request->userAgent(), [
                'previous_ip' => $user->last_login_ip,
            ]);
        }

        // If user has 2FA enabled, redirect to challenge instead of dashboard
        if ($user->hasTwoFactorEnabled()) {
            $request->session()->put('auth.2fa.challenge', true);
            $request->session()->put('auth.2fa.user_id', $user->id);
            Auth::logout();
            return redirect()->route('2fa.challenge');
        }

        return redirect()->intended(route('dashboard'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user) {
            ActivityLog::log($user->id, 'logout', $request->ip(), $request->userAgent());
            $request->session()->forget(['2fa.verified', '2fa.last_activity']);
        }

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
