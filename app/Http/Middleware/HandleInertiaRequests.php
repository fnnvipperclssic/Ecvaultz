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
        $user = $request->user();

        // Resolve Spatie roles/permissions safely — fallback to null if tables not seeded
        $isAdmin = false;
        $roles = [];
        $permissions = [];

        if ($user) {
            try {
                $isAdmin = $user->hasRole('Admin');
            } catch (\Throwable) {
                $isAdmin = (bool) ($user->is_admin ?? false);
            }

            try {
                $roles = $user->getRoleNames()->toArray();
            } catch (\Throwable) {
                $roles = $isAdmin ? ['Admin'] : ['User'];
            }

            try {
                $permissions = $user->getAllPermissions()->pluck('name')->toArray();
            } catch (\Throwable) {
                $permissions = [];
            }
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'two_factor_enabled' => $user->two_factor_enabled,
                    'email_verified' => $user->hasVerifiedEmail(),
                    'is_admin' => $isAdmin,
                    'roles' => $roles,
                    'permissions' => $permissions,
                    'avatar_url' => $user->avatar_path
                        ? route('secure.avatar', ['user' => $user->id])
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
                'debug' => config('app.debug', false),
            ],
        ]);
    }
}
