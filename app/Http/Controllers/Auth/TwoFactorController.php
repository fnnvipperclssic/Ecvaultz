<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use App\Services\TwoFactorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class TwoFactorController extends Controller
{
    protected TwoFactorService $twoFactor;

    public function __construct(TwoFactorService $twoFactor)
    {
        $this->twoFactor = $twoFactor;
    }

    public function setup(): Response
    {
        $user = Auth::user();
        $secret = $this->twoFactor->generateSecret();
        $qrCodeUrl = $this->twoFactor->getQRCodeUrl($user, $secret);
        $qrCodeSvg = $this->twoFactor->generateQRCodeSvg($qrCodeUrl);

        // Temporarily store secret in session until verified
        session()->put('2fa.temp_secret', $secret);

        return Inertia::render('Auth/TwoFactorSetup', [
            'qrCode' => $qrCodeSvg,
            'secret' => $secret,
        ]);
    }

    public function enable(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $secret = session()->get('2fa.temp_secret');
        $code = $request->input('code');

        if (!$secret) {
            return back()->with('error', 'Setup session expired. Please try again.');
        }

        if (!$this->twoFactor->verify($secret, $code)) {
            return back()->with('error', 'Invalid verification code. Please try again.');
        }

        $recoveryCodes = $this->twoFactor->generateRecoveryCodes();
        $hashedCodes = $this->twoFactor->hashRecoveryCodes($recoveryCodes);

        $user->forceFill([
            'google2fa_secret' => $secret,
            'two_factor_enabled' => true,
            'recovery_codes' => $hashedCodes,
        ])->save();

        session()->forget('2fa.temp_secret');
        session()->put('2fa.verified', true);
        session()->put('2fa.last_activity', time());

        ActivityLog::log($user->id, '2fa_enabled', $request->ip(), $request->userAgent());

        return redirect()->route('2fa.recovery.show')
            ->with('recovery_codes', $recoveryCodes)
            ->with('success', 'Two-Factor Authentication has been enabled.');
    }

    public function disable(Request $request): RedirectResponse
    {
        $user = Auth::user();

        if (!Hash::check($request->input('password'), $user->password)) {
            return back()->withErrors(['password' => 'Incorrect password.']);
        }

        $user->disableTwoFactor();

        ActivityLog::log($user->id, '2fa_disabled', $request->ip(), $request->userAgent());

        return redirect()->route('profile.edit')
            ->with('success', 'Two-Factor Authentication has been disabled.');
    }

    public function showChallenge(): Response
    {
        if (!session()->has('auth.2fa.user_id')) {
            return Inertia::render('Auth/Login');
        }

        return Inertia::render('Auth/TwoFactor');
    }

    public function verifyChallenge(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $userId = session()->get('auth.2fa.user_id');
        if (!$userId) {
            return redirect()->route('login')->with('error', 'Session expired. Please login again.');
        }

        $user = User::find($userId);
        if (!$user || !$user->hasTwoFactorEnabled()) {
            return redirect()->route('login');
        }

        $secret = $user->google2fa_secret;

        // Check if it's a recovery code (10 chars) or TOTP (6 digits)
        $code = $request->input('code');

        if (strlen($code) === 10) {
            if (!$this->twoFactor->verifyRecoveryCode($user, $code)) {
                return back()->with('error', 'Invalid recovery code.');
            }
            ActivityLog::log($user->id, '2fa_recovery_used', $request->ip(), $request->userAgent());
        } else {
            if (!$this->twoFactor->verify($secret, $code)) {
                return back()->with('error', 'Invalid verification code. Please try again.');
            }
        }

        Auth::login($user);
        session()->forget(['auth.2fa.challenge', 'auth.2fa.user_id']);
        session()->put('2fa.verified', true);
        session()->put('2fa.last_activity', time());
        session()->regenerate();

        ActivityLog::log($user->id, '2fa_verified', $request->ip(), $request->userAgent());

        return redirect()->intended(route('dashboard'));
    }

    public function showRecoveryCodes(): Response
    {
        $codes = session()->get('recovery_codes', []);
        session()->forget('recovery_codes');

        return Inertia::render('Auth/RecoveryCodes', [
            'codes' => $codes,
        ]);
    }

    public function regenerateRecoveryCodes(Request $request): RedirectResponse
    {
        $user = Auth::user();

        if (!Hash::check($request->input('password'), $user->password)) {
            return back()->withErrors(['password' => 'Incorrect password.']);
        }

        $recoveryCodes = $this->twoFactor->generateRecoveryCodes();
        $hashedCodes = $this->twoFactor->hashRecoveryCodes($recoveryCodes);

        $user->recovery_codes = $hashedCodes;
        $user->save();

        ActivityLog::log($user->id, '2fa_recovery_regenerated', $request->ip(), $request->userAgent());

        return redirect()->route('2fa.recovery.show')
            ->with('recovery_codes', $recoveryCodes)
            ->with('success', 'Recovery codes have been regenerated.');
    }
}
