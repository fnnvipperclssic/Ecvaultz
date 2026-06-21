<?php

/**
 * Check Security Questions Middleware
 *
 * Memastikan setiap user yang sudah terautentikasi telah menyelesaikan
 * setup security questions. Jika belum, redirect ke halaman setup.
 *
 * Security questions WAJIB untuk:
 * - Password reset (menggantikan email-based reset)
 * - Memenuhi OWASP A07 (Identification & Authentication Failures)
 *
 * Route yang dikecualikan:
 * - security-questions.create (setup page)
 * - security-questions.store (submit answers)
 * - logout
 * - profile.edit (agar user tetap bisa mengakses pengaturan)
 *
 * @package App\Http\Middleware
 * @security OWASP A07 — Mandatory identity verification setup
 */

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Services\SecurityQuestionService;

class CheckSecurityQuestions
{
    /**
     * Handle incoming request — cek apakah user sudah setup security questions.
     *
     * @param Request $request HTTP request
     * @param Closure $next Next middleware/controller
     * @return Response HTTP response or redirect
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Tidak ada user terautentikasi — skip (biarkan middleware auth yang handle)
        if (!$user) {
            return $next($request);
        }

        // Admin selalu dibolehkan (defense in depth — admin butuh akses)
        if ($user->isAdmin()) {
            return $next($request);
        }

        // Route yang dikecualikan dari pengecekan
        $excludedRoutes = [
            'security-questions.create',
            'security-questions.store',
            'logout',
            'profile.edit',
            'profile.update',
            'profile.password.update',
            'profile.avatar.update',
            '2fa.setup',
            '2fa.enable',
            '2fa.disable',
            '2fa.recovery.show',
            '2fa.recovery.regenerate',
            'verification.notice',
        ];

        // Cek apakah route saat ini termasuk yang dikecualikan
        if (in_array($request->route()->getName(), $excludedRoutes, true)) {
            return $next($request);
        }

        // Cek apakah user sudah setup security questions
        $questionService = app(SecurityQuestionService::class);
        if (!$questionService->hasQuestions($user)) {
            // Set flag mandatory setup
            session()->put('setup.security_questions', true);

            return redirect()->route('security-questions.create')->with(
                'warning',
                'You must set up security questions before accessing the application. These questions will be used to verify your identity when resetting your password.'
            );
        }

        return $next($request);
    }
}
