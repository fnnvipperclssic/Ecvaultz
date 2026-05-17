<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class SecurityService
{
    public function validatePassword(string $password): bool
    {
        $rules = ['required', 'string', Password::min(config('security.password.min_length', 12))];

        if (config('security.password.require_uppercase', true)) {
            $rules[] = 'regex:/[A-Z]/';
        }
        if (config('security.password.require_numeric', true)) {
            $rules[] = 'regex:/[0-9]/';
        }
        if (config('security.password.require_symbol', true)) {
            $rules[] = 'regex:/[^A-Za-z0-9]/';
        }

        $validator = Validator::make(
            ['password' => $password],
            ['password' => $rules]
        );

        return !$validator->fails();
    }

    public function isCommonPassword(string $password): bool
    {
        $commonPasswords = [
            'password', 'password123', '12345678', 'qwerty123', 'letmein123',
            'admin12345', 'welcome123', 'monkey123', 'dragon123', 'master123',
            'football12', 'baseball12', 'sunshine1', 'princess1', 'iloveyou1',
        ];

        return in_array(strtolower($password), $commonPasswords);
    }

    public function hasSessionExpired(Request $request): bool
    {
        $lastActivity = $request->session()->get('last_activity');
        $idleTimeout = config('security.session.idle_timeout', 1800);

        if (!$lastActivity) {
            return false;
        }

        return (time() - $lastActivity) > $idleTimeout;
    }

    public function detectSessionAnomaly(Request $request, User $user): bool
    {
        $currentIp = $request->ip();
        $currentUserAgent = $request->userAgent();

        $lastLoginIp = $user->last_login_ip;

        // Detect suspicious IP change (different /16 subnet)
        if ($lastLoginIp && !$this->isInSameSubnet($currentIp, $lastLoginIp)) {
            ActivityLog::log($user->id, 'suspicious_ip_change', $currentIp, $currentUserAgent, [
                'previous_ip' => $lastLoginIp,
                'current_ip' => $currentIp,
            ]);
            return true;
        }

        return false;
    }

    public function logActivity(?int $userId, string $action, ?Request $request = null, array $metadata = []): void
    {
        ActivityLog::log(
            $userId,
            $action,
            $request?->ip(),
            $request?->userAgent(),
            $metadata
        );
    }

    protected function isInSameSubnet(string $ip1, string $ip2): bool
    {
        if ($ip1 === '127.0.0.1' || $ip2 === '127.0.0.1') {
            return true;
        }

        $parts1 = explode('.', $ip1);
        $parts2 = explode('.', $ip2);

        if (count($parts1) !== 4 || count($parts2) !== 4) {
            return true; // IPv6 or invalid - skip check
        }

        return $parts1[0] === $parts2[0] && $parts1[1] === $parts2[1];
    }

    public function validateFileExtension(string $filename): bool
    {
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        return in_array($ext, config('security.allowed_extensions', []));
    }

    public function generateSecureFilename(string $originalName): string
    {
        $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        return hash('sha256', uniqid('', true) . random_bytes(32)) . '.' . $ext;
    }
}
