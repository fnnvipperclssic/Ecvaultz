<?php

/**
 * Laravel 11 Application Bootstrap
 *
 * Configures the application lifecycle:
 *   - Routing (web + api)
 *   - Middleware stack (CSRF, CORS, security headers, Inertia, 2FA)
 *   - Scheduled tasks (cleanup commands)
 *   - Exception handling
 */

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\FrameGuard;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\RequireTwoFactor;
use App\Http\Middleware\PreventSsrf;
use App\Http\Middleware\CheckPasswordExpiry;
use App\Http\Middleware\CheckSecurityQuestions;
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
            'permission' => \App\Http\Middleware\CheckPermission::class,
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'password.expiry' => CheckPasswordExpiry::class,         // OWASP A07: Password expiry enforcement
            'security.setup' => CheckSecurityQuestions::class,       // OWASP A07: Mandatory security questions
            'ssrf' => PreventSsrf::class,                            // OWASP A10: SSRF protection
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
        // Daily cleanup: permanently delete files past soft-delete retention
        $schedule->command('ecvaultz:cleanup-expired-files')->dailyAt('02:00');
        // Hourly: remove expired file shares
        $schedule->command('ecvaultz:cleanup-expired-shares')->hourly();
        // Daily: purge activity logs older than 90 days
        $schedule->command('ecvaultz:cleanup-activity-logs --days=90')->dailyAt('03:00');
        // Hourly: send queued pending notifications
        $schedule->command('ecvaultz:send-pending-notifications')->hourly();
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->dontReport([]);
    })
    ->create();
