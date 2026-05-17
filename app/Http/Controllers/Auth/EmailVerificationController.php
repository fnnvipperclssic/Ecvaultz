<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationController extends Controller
{
    public function notice(): Response
    {
        return Inertia::render('Auth/VerifyEmail');
    }

    public function verify(Request $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard'));
        }

        $request->validate(['id' => 'required|string', 'hash' => 'required|string']);

        if (!hash_equals(
            (string) $request->user()->getKey(),
            (string) $request->input('id')
        )) {
            return redirect()->route('login');
        }

        if (!hash_equals(
            sha1($request->user()->getEmailForVerification()),
            (string) $request->input('hash')
        )) {
            return redirect()->route('login');
        }

        $request->user()->markEmailAsVerified();

        return redirect()->intended(route('dashboard'));
    }

    public function resend(Request $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard'));
        }

        $request->user()->sendEmailVerificationNotification();

        return back()->with('success', 'Verification link sent!');
    }
}
