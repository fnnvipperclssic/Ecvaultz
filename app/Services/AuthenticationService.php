<?php

namespace App\Services;

use App\Models\LoginAttempt;
use App\Models\User;
use App\Models\ActivityLog;

class AuthenticationService
{
    /**
     * Check if an account is locked due to too many failed attempts.
     */
    public function isAccountLocked(string $email): array
    {
        $threshold = (int) config('security.lockout.threshold', 5);
        $lockoutMinutes = (int) config('security.lockout.minutes', 15);

        $isLocked = LoginAttempt::isAccountLocked($email, $threshold, $lockoutMinutes);
        $remainingSeconds = LoginAttempt::remainingLockoutSeconds($email, $lockoutMinutes);

        return [
            'locked' => $isLocked,
            'remaining_seconds' => max(0, $remainingSeconds),
            'remaining_minutes' => ceil(max(0, $remainingSeconds) / 60),
            'threshold' => $threshold,
            'lockout_minutes' => $lockoutMinutes,
        ];
    }

    /**
     * Record a failed login attempt.
     */
    public function recordFailedAttempt(string $email, ?User $user, string $ip, ?string $userAgent, string $reason = 'invalid_password'): void
    {
        LoginAttempt::recordAttempt(
            email: $email,
            userId: $user?->id,
            ip: $ip,
            userAgent: $userAgent,
            success: false,
            failureReason: $reason
        );

        // Log suspicious activity if threshold reached
        $threshold = (int) config('security.lockout.threshold', 5);
        $recentCount = LoginAttempt::recentFailedCount($email);

        if ($recentCount >= $threshold && $user) {
            ActivityLog::log($user->id, 'account_locked', $ip, $userAgent, [
                'failed_attempts' => $recentCount,
                'threshold' => $threshold,
            ]);
        }
    }

    /**
     * Record a successful login attempt and clear failed attempts.
     */
    public function recordSuccessfulAttempt(User $user, string $ip, ?string $userAgent): void
    {
        LoginAttempt::recordAttempt(
            email: $user->email,
            userId: $user->id,
            ip: $ip,
            userAgent: $userAgent,
            success: true
        );

        // Clear previous failed attempts for this email
        LoginAttempt::clearForEmail($user->email);
    }

    /**
     * Get remaining login attempts before lockout.
     */
    public function getRemainingAttempts(string $email): int
    {
        $threshold = (int) config('security.lockout.threshold', 5);
        $recentCount = LoginAttempt::recentFailedCount($email);
        return max(0, $threshold - $recentCount);
    }

    /**
     * Check if the IP has changed significantly since last login.
     */
    public function detectIpAnomaly(User $user, string $currentIp): bool
    {
        $lastIp = $user->last_login_ip;
        if (!$lastIp) {
            return false;
        }

        if ($currentIp === '127.0.0.1' || $lastIp === '127.0.0.1') {
            return false;
        }

        $parts1 = explode('.', $currentIp);
        $parts2 = explode('.', $lastIp);

        if (count($parts1) !== 4 || count($parts2) !== 4) {
            return false;
        }

        // Different /16 subnet
        return $parts1[0] !== $parts2[0] || $parts1[1] !== $parts2[1];
    }
}
