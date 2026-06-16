<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'two_factor_enabled' => $request->user()->two_factor_enabled,
                    'email_verified' => $request->user()->hasVerifiedEmail(),
                    'is_admin' => $request->user()->hasRole('Admin'),
                    'roles' => $request->user()->getRoleNames(),
                    'permissions' => $request->user()->getAllPermissions()->pluck('name'),
                    'avatar_url' => $request->user()->avatar_path
                        ? route('secure.avatar', ['user' => $request->user()->id])
                        : null,
                ] : null,
                'two_factor_challenge' => session('auth.2fa.challenge', false),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
            ],
            'csrf_token' => csrf_token(),
            'app' => [
                'name' => config('app.name', 'Ecvaultz'),
                'url' => config('app.url'),
                'max_upload_size' => config('security.max_upload_size', 52428800),
                'allowed_extensions' => config('security.allowed_extensions', []),
            ],
        ]);
    }
}
