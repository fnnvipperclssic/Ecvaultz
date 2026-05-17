<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\FrameGuard;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\RequireTwoFactor;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\View\Middleware\ShareErrorsFromSession;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Auth\Middleware\EnsureEmailIsVerified;
use Illuminate\Http\Middleware\TrustProxies;
use Illuminate\Http\Middleware\HandleCors;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(remove: [
            \Illuminate\Http\Middleware\FrameGuard::class,
        ]);

        $middleware->appendToGroup('web', [
            HandleCors::class,
            SecurityHeaders::class,
            HandleInertiaRequests::class,
        ]);

        $middleware->alias([
            'auth' => Authenticate::class,
            'verified' => EnsureEmailIsVerified::class,
            '2fa' => RequireTwoFactor::class,
            'inertia' => HandleInertiaRequests::class,
        ]);

        $middleware->trustProxies(at: env('TRUSTED_PROXIES', '127.0.0.1,::1'));

        $middleware->validateCsrfTokens(except: [
            // No CSRF exceptions - all routes protected
        ]);
    })
    ->withCommands([
        __DIR__.'/../app/Console/Commands',
    ])
    ->withSchedule(function ($schedule) {
        $schedule->command('ecvaultz:cleanup-expired-files')->dailyAt('02:00');
        $schedule->command('ecvaultz:cleanup-expired-shares')->hourly();
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->dontReport([]);
    })
    ->create();
