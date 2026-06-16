<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        $user = \App\Models\User::where('email', $request->email)->first();

        // If user exists and has security questions, offer that option
        if ($user) {
            $questionService = app(\App\Services\SecurityQuestionService::class);
            if ($questionService->hasQuestions($user)) {
                // Store email in session and redirect to security questions verification
                session()->put('password_reset_email', $request->email);

                ActivityLog::log($user->id, 'password_reset_security_questions_offered', $request->ip(), $request->userAgent());

                return redirect()->route('password.security-questions')->with('success',
                    'You have security questions set up. Please answer them to reset your password, or use the email link below.');
            }
        }

        // Fall back to email-based reset
        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT && $user) {
            ActivityLog::log($user->id, 'password_reset_requested', $request->ip(), $request->userAgent(), [
                'email' => $request->email,
            ]);
        } elseif (!$user) {
            // Always return success to prevent user enumeration
            return back()->with('success', 'If that email exists, a password reset link has been sent.');
        }

        return $status === Password::RESET_LINK_SENT
            ? back()->with('success', __($status))
            : back()->withInput($request->only('email'))
                ->withErrors(['email' => __($status)]);
    }
}
