<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Hash;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'google2fa_secret',
        'two_factor_enabled',
        'recovery_codes',
        'avatar_path',
        'last_login_at',
        'last_login_ip',
        'password_changed_at',
        'is_admin',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'google2fa_secret',
        'recovery_codes',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'password_changed_at' => 'datetime',
        'two_factor_enabled' => 'boolean',
        'is_admin' => 'boolean',
        'recovery_codes' => 'encrypted:array',
        'google2fa_secret' => 'encrypted',
        'password' => 'hashed',
    ];

    public function files(): HasMany
    {
        return $this->hasMany(File::class);
    }

    public function folders(): HasMany
    {
        return $this->hasMany(Folder::class);
    }

    public function sharedWithMe(): HasMany
    {
        return $this->hasMany(FileShare::class, 'shared_with_user_id');
    }

    public function sharedByMe(): HasMany
    {
        return $this->hasMany(FileShare::class, 'shared_by_user_id');
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    public function isAdmin(): bool
    {
        return $this->is_admin;
    }

    public function hasTwoFactorEnabled(): bool
    {
        return $this->two_factor_enabled;
    }

    public function markTwoFactorEnabled(): void
    {
        $this->forceFill([
            'two_factor_enabled' => true,
        ])->save();
    }

    public function disableTwoFactor(): void
    {
        $this->forceFill([
            'two_factor_enabled' => false,
            'google2fa_secret' => null,
            'recovery_codes' => null,
        ])->save();
    }
}
