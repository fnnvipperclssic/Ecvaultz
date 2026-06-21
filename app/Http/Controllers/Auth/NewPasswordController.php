<?php

/**
 * New Password Controller — Session-Based Token Verification
 *
 * Menangani pembuatan password baru setelah user berhasil memverifikasi
 * identitas melalui security questions. Token disimpan di session—BUKAN
 * di database (password_reset_tokens tidak lagi digunakan untuk flow ini).
 *
 * OWASP A07 (Identification & Authentication Failures):
 * - Token berbasis session dengan HMAC signature — tidak bisa dipalsukan
 * - Token memiliki expiry 15 menit — mencegah replay attack
 * - Session diregenerate setelah password berhasil direset
 * - Semua session lain user di-terminate setelah password baru
 *
 * @package App\Http\Controllers\Auth
 * @security OWASP A07 — Secure session-based password reset
 */

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Inertia\Inertia;
use Inertia\Response;

class NewPasswordController extends Controller
{
    /**
     * Tampilkan form reset password.
     *
     * Verifikasi session token sebelum menampilkan form.
     * Token diverifikasi via HMAC untuk memastikan integritas.
     *
     * @security Token HMAC mencegah manipulasi — token expired = redirect ke awal
     */
    public function create(Request $request): Response
    {
        // Baca token dari session — BUKAN dari URL parameter
        $sessionToken = session()->get('password_reset_token');
        $sessionEmail = session()->get('password_reset_email');
        $tokenExpiry = session()->get('password_reset_token_expiry');

        // Verifikasi token masih valid dan belum expired
        if (!$sessionToken || !$sessionEmail || !$tokenExpiry) {
            return Inertia::render('Auth/ForgotPassword')->with(
                'error',
                'Your verification session has expired. Please start the password reset process again.'
            );
        }

        // Cek expiry (15 menit)
        if (now()->timestamp > $tokenExpiry) {
            // Bersihkan session token yang expired
            session()->forget(['password_reset_token', 'password_reset_token_expiry']);

            return Inertia::render('Auth/ForgotPassword')->with(
                'error',
                'Your verification token has expired (15-minute limit). Please restart the password reset process.'
            );
        }

        // Verifikasi integritas token menggunakan HMAC
        $expectedToken = hash_hmac(
            'sha256',
            $sessionEmail . $tokenExpiry,
            config('app.key')
        );

        if (!hash_equals($expectedToken, $sessionToken)) {
            // Token tidak valid — kemungkinan tampering
            ActivityLog::log(
                null,
                'password_reset_token_tampered',
                $request->ip(),
                $request->userAgent(),
                ['email' => $sessionEmail]
            );

            session()->forget(['password_reset_token', 'password_reset_email', 'password_reset_token_expiry']);

            return Inertia::render('Auth/ForgotPassword')->with(
                'error',
                'Invalid verification token. Please restart the password reset process.'
            );
        }

        return Inertia::render('Auth/ResetPassword', [
            'email' => $sessionEmail,
            'question_token' => $sessionToken,
        ]);
    }

    /**
     * Proses dan simpan password baru.
     *
     * Flow:
     * 1. Validasi input (password rules + confirmed)
     * 2. Verifikasi session token (HMAC check + expiry check)
     * 3. Update password user langsung (tidak via Password::reset())
     * 4. Terminate semua session lain user
     * 5. Regenerate session + login ulang user
     * 6. Log aktivitas
     *
     * @security Password::reset() TIDAK digunakan — langsung update via Eloquent
     * @security Semua session lain di-terminate — mencegah session hijacking
     * @security Session diregenerate — mencegah session fixation
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email', 'lowercase'],
            'password' => [
                'required',
                'string',
                'confirmed',
                PasswordRule::min(config('security.password.min_length', 12))
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
        ]);

        // Verifikasi session token (sekali lagi, defense-in-depth)
        $sessionToken = session()->get('password_reset_token');
        $sessionEmail = session()->get('password_reset_email');
        $tokenExpiry = session()->get('password_reset_token_expiry');

        // Validasi email di session cocok dengan email di request
        if (!$sessionToken || $sessionEmail !== $request->email) {
            return back()->with('error', 'Invalid or expired verification session. Please restart the password reset process.');
        }

        // Cek expiry
        if (now()->timestamp > $tokenExpiry) {
            session()->forget(['password_reset_token', 'password_reset_email', 'password_reset_token_expiry']);
            return redirect()->route('password.request')->with('error', 'Verification session expired. Please try again.');
        }

        // Verifikasi HMAC token integrity
        $expectedToken = hash_hmac('sha256', $sessionEmail . $tokenExpiry, config('app.key'));
        if (!hash_equals($expectedToken, $sessionToken)) {
            session()->forget(['password_reset_token', 'password_reset_email', 'password_reset_token_expiry']);
            return redirect()->route('password.request')->with('error', 'Invalid verification. Please restart.');
        }

        // Cari user dan update password secara langsung
        $user = \App\Models\User::where('email', $sessionEmail)->first();
        if (!$user) {
            return redirect()->route('password.request')->with('error', 'User not found. Please restart the process.');
        }

        // Update password — langsung via Eloquent
        $user->forceFill([
            'password' => Hash::make($request->password),
            'remember_token' => Str::random(60),
            'password_changed_at' => now(),
        ])->save();

        // Fire event untuk kompatibilitas (listener jika ada)
        event(new PasswordReset($user));

        // Terminate semua session lain milik user ini (force logout di device lain)
        \Illuminate\Support\Facades\DB::table('sessions')
            ->where('user_id', $user->id)
            ->where('id', '!=', $request->session()->getId())
            ->delete();

        // Log password reset completion
        ActivityLog::log(
            $user->id,
            'password_reset_complete',
            $request->ip(),
            $request->userAgent(),
            ['method' => 'security_questions']
        );

        // Bersihkan session reset tokens
        session()->forget([
            'password_reset_token',
            'password_reset_email',
            'password_reset_token_expiry',
            'password_reset_email_expiry',
        ]);

        // Regenerate session ID — mencegah session fixation
        $request->session()->regenerate();

        // Login user
        \Illuminate\Support\Facades\Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('dashboard')->with(
            'success',
            'Your password has been reset successfully. All other devices have been logged out.'
        );
    }
}
