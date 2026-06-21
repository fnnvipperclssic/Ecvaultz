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
        'avatar_path',
        'last_login_at',
        'last_login_ip',
        'password_changed_at',
        'storage_quota',
        'last_activity_at',
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
        'storage_quota' => 'integer',
        'last_activity_at' => 'datetime',
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

    /**
     * Check if user has administrator privileges.
     *
     * Uses Spatie RBAC role check first (authoritative source),
     * falls back to legacy is_admin column for backward compatibility.
     *
     * @return bool True if user is an administrator
     */
    public function isAdmin(): bool
    {
        // Check Spatie role first (authoritative)
        if ($this->hasRole('Admin')) {
            return true;
        }
        // Fallback to legacy column for backward compatibility
        return (bool) $this->is_admin;
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

    /**
     * Get the total storage used by this user's files in bytes.
     */
    public function getStorageUsedAttribute(): int
    {
        return (int) $this->files()->sum('size');
    }

    /**
     * Get the storage usage as a percentage of the quota.
     */
    public function getStorageUsedPercentAttribute(): float
    {
        if ($this->storage_quota <= 0) {
            return 0.0;
        }

        return round(($this->storage_used / $this->storage_quota) * 100, 2);
    }

    public function tags(): HasMany
    {
        return $this->hasMany(Tag::class);
    }
}
