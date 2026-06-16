<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\File;
use App\Models\Folder;
use App\Policies\FilePolicy;
use App\Policies\FolderPolicy;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        File::class => FilePolicy::class,
        Folder::class => FolderPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        Gate::before(function ($user) {
            if ($user->hasRole('Admin')) {
                return true;
            }
        });

        Gate::define('access-admin', function (User $user) {
            return $user->hasRole('Admin');
        });

        Gate::define('viewLogs', function (User $user) {
            return $user->isAdmin();
        });

        Gate::define('manageUsers', function (User $user) {
            return $user->isAdmin();
        });
    }
}
