<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

/**
 * Central user model with Spatie RBAC, 2FA, API tokens, and per-user file encryption.
 *
 * Sensitive fields (google2fa_secret, recovery_codes, encryption_key) are either
 * encrypted via Laravel's encrypted casting or hidden from JSON serialization.
 */
class User extends Authenticatable
{
    use HasApiTokens, Notifiable, SoftDeletes, HasRoles;

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
        'encryption_key',
        'is_admin',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'google2fa_secret',
        'recovery_codes',
        'encryption_key',
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

    public function securityQuestions(): HasMany
    {
        return $this->hasMany(SecurityQuestion::class);
    }

    public function loginAttempts(): HasMany
    {
        return $this->hasMany(LoginAttempt::class);
    }

    public function fileVersions(): HasMany
    {
        return $this->hasMany(FileVersion::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'notifiable_id')->where('notifiable_type', self::class);
    }

    public function settings(): HasMany
    {
        return $this->hasMany(UserSetting::class);
    }

    public function setting(string $key, mixed $default = null): mixed
    {
        return UserSetting::get($this, $key, $default);
    }

    public function setSetting(string $key, mixed $value): void
    {
        UserSetting::set($this, $key, $value);
    }

    public function getAllSettings(): array
    {
        return UserSetting::getAll($this);
    }

    public function unreadNotifications(): HasMany
    {
        return $this->notifications()->whereNull('read_at');
    }

    public function unreadNotificationsCount(): int
    {
        return $this->unreadNotifications()->count();
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
