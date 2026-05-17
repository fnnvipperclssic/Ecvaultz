<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Services\TwoFactorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile', [
            'sessions' => $this->getActiveSessions($request),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email,' . $user->id],
        ]);

        // Require password for email changes
        if ($request->email !== $user->email) {
            if (!Hash::check($request->input('current_password'), $user->password)) {
                return back()->withErrors(['current_password' => 'Password is required to change email address.']);
            }
        }

        $user->fill($request->only('name', 'email'));

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        ActivityLog::log($user->id, 'profile_updated', $request->ip(), $request->userAgent());

        return back()->with('success', 'Profile updated.');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $user = $request->user();

        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => [
                'required',
                'string',
                'confirmed',
                Password::min(config('security.password.min_length', 12))
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
                'different:current_password',
            ],
        ]);

        $user->forceFill([
            'password' => Hash::make($request->password),
            'password_changed_at' => now(),
        ])->save();

        // Terminate all other sessions
        \Illuminate\Support\Facades\DB::table('sessions')
            ->where('user_id', $user->id)
            ->where('id', '!=', $request->session()->getId())
            ->delete();

        ActivityLog::log($user->id, 'password_changed', $request->ip(), $request->userAgent());

        return back()->with('success', 'Password updated. All other devices have been logged out.');
    }

    public function updateAvatar(Request $request): RedirectResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ]);

        $user = $request->user();

        $path = $request->file('avatar')->storeAs(
            'avatars',
            'avatar_' . $user->id . '_' . time() . '.' . $request->file('avatar')->extension(),
            'private'
        );

        $user->avatar_path = $path;
        $user->save();

        return back()->with('success', 'Avatar updated.');
    }

    public function destroyAccount(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (!Hash::check($request->input('password'), $user->password)) {
            return back()->withErrors(['password' => 'Incorrect password.']);
        }

        // Require 2FA if enabled
        if ($user->hasTwoFactorEnabled()) {
            $request->validate(['two_factor_code' => ['required', 'string', 'size:6']]);
            $twoFactor = app(TwoFactorService::class);
            $secret = $user->google2fa_secret;
            if (!$twoFactor->verify($secret, $request->input('two_factor_code'))) {
                return back()->withErrors(['two_factor_code' => 'Invalid 2FA code.']);
            }
        }

        ActivityLog::log($user->id, 'account_deleted', $request->ip(), $request->userAgent());

        // Soft delete user and all associated data
        $user->delete();

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('success', 'Your account has been deactivated. You can restore it within 30 days by contacting support.');
    }

    public function logoutOtherDevices(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (!Hash::check($request->input('password'), $user->password)) {
            return back()->withErrors(['password' => 'Incorrect password.']);
        }

        \Illuminate\Support\Facades\DB::table('sessions')
            ->where('user_id', $user->id)
            ->where('id', '!=', $request->session()->getId())
            ->delete();

        ActivityLog::log($user->id, 'logged_out_other_devices', $request->ip(), $request->userAgent());

        return back()->with('success', 'All other devices have been logged out.');
    }

    protected function getActiveSessions(Request $request): array
    {
        if (config('session.driver') !== 'database') {
            return [];
        }

        return collect(
            \Illuminate\Support\Facades\DB::table('sessions')
                ->where('user_id', $request->user()->id)
                ->orderBy('last_activity', 'desc')
                ->get()
        )->map(function ($session) use ($request) {
            return [
                'id' => $session->id,
                'ip_address' => $session->ip_address,
                'user_agent' => $session->user_agent,
                'last_activity' => \Carbon\Carbon::createFromTimestamp($session->last_activity)->diffForHumans(),
                'is_current' => $session->id === $request->session()->getId(),
            ];
        })->toArray();
    }
}
