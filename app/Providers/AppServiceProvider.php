<?php

/**
 * Application Service Provider — Core Service Registration & Policy Binding
 *
 * Mendaftarkan:
 * - Authorization Policies (OWASP A01 — Broken Access Control)
 * - HTTPS enforcement untuk production
 * - Rate limiting configuration
 *
 * @package App\Providers
 * @security OWASP A01/A02 — Policy registration + HTTPS enforcement
 */

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use App\Models\User;
use App\Models\File;
use App\Models\Folder;
use App\Models\Tag;
use App\Models\DataRoom;
use App\Models\FileShare;
use App\Policies\FilePolicy;
use App\Policies\FolderPolicy;
use App\Policies\TagPolicy;
use App\Policies\DataRoomPolicy;
use App\Policies\FileSharePolicy;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register application services.
     *
     * @security Force HTTPS scheme di production untuk mencegah mixed content
     *           dan memastikan semua cookie dikirim dengan flag Secure (OWASP A02).
     */
    public function register(): void
    {
        // Force HTTPS di production environment
        // Penting: pastikan web server (Nginx/Apache) sudah dikonfigurasi SSL
        if ($this->app->environment('production') && env('FORCE_HTTPS', false)) {
            URL::forceScheme('https');
            // Force root URL ke HTTPS
            $this->app['request']->server->set('HTTPS', 'on');
        }
    }

    /**
     * Bootstrap application services.
     *
     * Register semua authorization policies untuk model-level access control.
     * Admin role bypass semua Gate checks via Gate::before di AuthServiceProvider.
     *
     * @security OWASP A01 — Setiap model memiliki Policy class untuk
     *           memastikan hanya user yang berwenang yang bisa mengakses.
     */
    public function boot(): void
    {
        // Register model policies — OWASP A01 (Broken Access Control)
        Gate::policy(File::class, FilePolicy::class);
        Gate::policy(Folder::class, FolderPolicy::class);
        Gate::policy(Tag::class, TagPolicy::class);
        Gate::policy(DataRoom::class, DataRoomPolicy::class);
        Gate::policy(FileShare::class, FileSharePolicy::class);

        $this->configureRateLimiting();
    }

    /**
     * Configure global rate limiting.
     *
     * Rate limiting detail dikonfigurasi di RouteServiceProvider dan
     * per-route middleware throttle.
     *
     * @security OWASP A04 — Rate limiting mencegah brute force dan DoS
     */
    protected function configureRateLimiting(): void
    {
        // Rate limiting dikonfigurasi via RouteServiceProvider::boot()
        // dan middleware throttle di route definitions
    }
}
