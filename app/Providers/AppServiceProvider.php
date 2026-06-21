<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use App\Models\User;
use App\Models\File;
use App\Policies\FilePolicy;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        if ($this->app->environment('production') && env('FORCE_HTTPS', false)) {
            URL::forceScheme('https');
        }
    }

    public function boot(): void
    {
        Gate::policy(File::class, FilePolicy::class);

        $this->configureRateLimiting();
    }

    protected function configureRateLimiting(): void
    {
        // Rate limiting is configured in RouteServiceProvider
    }
}
