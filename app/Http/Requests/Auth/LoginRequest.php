<?php

namespace App\Http\Requests\Auth;

use App\Mail\AccountLockoutMail;
use App\Models\User;
use App\Services\AuthenticationService;
use App\Services\HIBPService;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string'],
            'remember' => ['boolean'],
        ];
    }

    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();
        $this->ensureAccountIsNotLocked();

        if (!Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            // Record failed attempt
            $auth = app(AuthenticationService::class);
            $user = \App\Models\User::where('email', $this->input('email'))->first();
            $auth->recordFailedAttempt(
                email: $this->input('email'),
                user: $user,
                ip: $this->ip(),
                userAgent: $this->userAgent(),
                reason: 'invalid_password'
            );

            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        RateLimiter::clear($this->throttleKey());

        // Check password against HIBP breach database (k-anonymity model)
        // This does not block login, only provides a warning
        try {
            $hibp = app(HIBPService::class);
            $result = $hibp->checkPassword($this->input('password'));
            if ($result['breached']) {
                session()->flash('hibp_warning', $result['message']);
                Log::info('User logged in with compromised password', [
                    'user_id' => Auth::id(),
                    'breach_count' => $result['count'],
                ]);
            }
        } catch (\Throwable $e) {
            // HIBP check failure should not block login
            Log::warning('HIBP check failed during login', [
                'email' => $this->input('email'),
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function ensureIsNotRateLimited(): void
    {
        if (!RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        // Send lockout email to user
        try {
            $user = User::where('email', $this->input('email'))->first();
            if ($user) {
                Mail::to($user->email)->send(new AccountLockoutMail(
                    user: $user,
                    failedAttempts: 5,
                    lockoutMinutes: (int) ceil($seconds / 60),
                ));
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Failed to send account lockout email', [
                'email' => $this->input('email'),
                'error' => $e->getMessage(),
            ]);
        }

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', ['seconds' => $seconds, 'minutes' => ceil($seconds / 60)]),
        ]);
    }

    public function ensureAccountIsNotLocked(): void
    {
        $auth = app(AuthenticationService::class);
        $status = $auth->isAccountLocked($this->input('email'));

        if ($status['locked']) {
            throw ValidationException::withMessages([
                'email' => sprintf(
                    'Account is locked due to too many failed attempts. Please try again in %d minute(s).',
                    $status['remaining_minutes']
                ),
            ]);
        }
    }

    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')) . '|' . $this->ip());
    }
}
