<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ActivityLog;
use App\Services\SecurityService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    protected SecurityService $security;

    public function __construct(SecurityService $security)
    {
        $this->security = $security;
    }

    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z0-9\s\-_\'.]+$/'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users'],
            'password' => [
                'required',
                'string',
                'confirmed',
                Password::min(config('security.password.min_length', 12))
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
                    ->uncompromised(),
            ],
        ]);

        // Check for common passwords
        if ($this->security->isCommonPassword($request->password)) {
            return back()->withErrors([
                'password' => 'This password is too common and easily guessed. Please choose a stronger password.',
            ])->withInput();
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'last_login_ip' => $request->ip(),
        ]);

        // Generate per-user encryption key and store encrypted
        $encryptionService = app(\App\Services\FileEncryptionService::class);
        $rawKey = $encryptionService->generateUserKey();
        $user->encryption_key = \Illuminate\Support\Facades\Crypt::encryptString($rawKey);
        $user->save();

        // Assign default User role
        $user->assignRole('User');

        event(new Registered($user));

        Auth::login($user);
        $request->session()->regenerate();

        ActivityLog::log($user->id, 'register', $request->ip(), $request->userAgent());

        return redirect()->route('dashboard');
    }
}
