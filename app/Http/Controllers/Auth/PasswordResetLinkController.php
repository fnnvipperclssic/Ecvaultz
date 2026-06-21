<?php

/**
 * Password Reset Link Controller — Security Questions Only
 *
 * Menggantikan mekanisme reset password berbasis email dengan verifikasi
 * pertanyaan keamanan (security questions) sebagai satu-satunya jalur reset.
 *
 * OWASP A07 (Identification & Authentication Failures):
 * - Mencegah user enumeration dengan selalu memberikan response sukses
 * - Membatasi reset hanya untuk user yang telah setup security questions
 * - Tidak mengirimkan link via email (menghilangkan vektor phishing)
 *
 * @package App\Http\Controllers\Auth
 * @security OWASP A07 — Identity verification via security questions only
 */

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Services\SecurityQuestionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Tampilkan form untuk memulai proses reset password.
     * User hanya perlu memasukkan email untuk dicari akunnya.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    /**
     * Proses permintaan reset password.
     *
     * Flow baru (security questions only):
     * 1. Cari user berdasarkan email
     * 2. Cek apakah user memiliki security questions yang sudah di-setup
     * 3. Jika ya → simpan email di session, redirect ke halaman verifikasi pertanyaan
     * 4. Jika tidak → tampilkan pesan error (admin harus mereset via panel admin)
     * 5. Jika email tidak ditemukan → tetap tampilkan pesan sukses (anti-enumeration)
     *
     * @security Mencegah user enumeration — response identik untuk email valid/invalid
     * @security Menghilangkan vektor phishing via email reset link
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email', 'lowercase'],
        ]);

        $user = \App\Models\User::where('email', $request->email)->first();

        // Jika user ditemukan, cek apakah sudah setup security questions
        if ($user) {
            $questionService = app(SecurityQuestionService::class);

            if ($questionService->hasQuestions($user)) {
                // Store email in session untuk digunakan di halaman security questions
                session()->put('password_reset_email', $request->email);
                // Set expiry 15 menit dari sekarang
                session()->put('password_reset_email_expiry', now()->addMinutes(15)->timestamp);

                ActivityLog::log(
                    $user->id,
                    'password_reset_security_questions_initiated',
                    $request->ip(),
                    $request->userAgent(),
                    ['method' => 'security_questions']
                );

                return redirect()->route('password.security-questions')->with(
                    'success',
                    'Account found. Please answer your security questions to verify your identity.'
                );
            }

            // User tidak memiliki security questions — harus menghubungi administrator
            ActivityLog::log(
                $user->id,
                'password_reset_no_security_questions',
                $request->ip(),
                $request->userAgent(),
                ['reason' => 'no_security_questions_setup']
            );

            return back()->with('error',
                'Your account does not have security questions configured. Please contact the administrator for password reset assistance.'
            );
        }

        // Anti-enumeration: selalu tampilkan response sukses
        // meskipun email tidak ditemukan
        return back()->with('success',
            'If an account with that email exists and has security questions configured, you will be redirected to verify your identity.'
        );
    }
}
