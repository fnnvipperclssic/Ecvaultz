<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoginAttempt extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'email',
        'user_id',
        'ip_address',
        'user_agent',
        'success',
        'failure_reason',
        'created_at',
    ];

    protected $casts = [
        'success' => 'boolean',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function recordAttempt(
        string $email,
        ?int $userId,
        string $ip,
        ?string $userAgent,
        bool $success,
        ?string $failureReason = null
    ): self {
        return static::create([
            'email' => $email,
            'user_id' => $userId,
            'ip_address' => $ip,
            'user_agent' => $userAgent,
            'success' => $success,
            'failure_reason' => $failureReason,
            'created_at' => now(),
        ]);
    }

    public static function recentFailedCount(string $email, int $minutes = 15): int
    {
        return static::where('email', $email)
            ->where('success', false)
            ->where('created_at', '>=', now()->subMinutes($minutes))
            ->count();
    }

    public static function isAccountLocked(string $email, int $threshold = 5, int $lockoutMinutes = 15): bool
    {
        $recentCount = static::recentFailedCount($email, $lockoutMinutes);
        if ($recentCount < $threshold) {
            return false;
        }

        // Check if the last failed attempt was within the lockout window
        $lastFailed = static::where('email', $email)
            ->where('success', false)
            ->latest('created_at')
            ->first();

        if (!$lastFailed) {
            return false;
        }

        return $lastFailed->created_at->addMinutes($lockoutMinutes)->isFuture();
    }

    public static function remainingLockoutSeconds(string $email, int $lockoutMinutes = 15): int
    {
        $lastFailed = static::where('email', $email)
            ->where('success', false)
            ->latest('created_at')
            ->first();

        if (!$lastFailed) {
            return 0;
        }

        $unlockAt = $lastFailed->created_at->addMinutes($lockoutMinutes);
        return max(0, now()->diffInSeconds($unlockAt, false));
    }

    public static function clearForEmail(string $email): void
    {
        static::where('email', $email)->where('success', false)->delete();
    }
}
