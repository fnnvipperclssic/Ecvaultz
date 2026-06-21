<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Have I Been Pwned (HIBP) password breach detection using k-anonymity model.
 *
 * SHA-1 hashes the password, sends only the first 5 hex chars to
 * https://api.pwnedpasswords.com/range/{prefix}, and checks whether the
 * hash suffix appears in the response. This ensures the full password hash
 * is never sent to the HIBP API.
 */
class HIBPService
{
    private const API_URL = 'https://api.pwnedpasswords.com/range/';
    private const CACHE_TTL = 86400; // 24 hours
    private const HTTP_TIMEOUT = 5; // seconds

    /**
     * Check a password against HIBP breach database using k-anonymity.
     *
     * @param string $password The plaintext password to check.
     * @return array{breached: bool, count: int, message: string}
     */
    public function checkPassword(string $password): array
    {
        $sha1Hash = strtoupper(sha1($password));
        $prefix = substr($sha1Hash, 0, 5);
        $suffix = substr($sha1Hash, 5);

        $cacheKey = 'hibp_' . $prefix;

        $responseBody = Cache::remember($cacheKey, self::CACHE_TTL, function () use ($prefix) {
            try {
                $response = Http::timeout(self::HTTP_TIMEOUT)
                    ->withHeaders(['User-Agent' => config('app.name', 'Ecvaultz') . '-HIBP-Checker/1.0'])
                    ->get(self::API_URL . $prefix);

                if ($response->successful()) {
                    return $response->body();
                }

                Log::warning('HIBP API request failed', [
                    'prefix' => $prefix,
                    'status' => $response->status(),
                ]);

                return null;
            } catch (\Throwable $e) {
                Log::warning('HIBP API request exception', [
                    'prefix' => $prefix,
                    'error' => $e->getMessage(),
                ]);

                return null;
            }
        });

        if ($responseBody === null) {
            return [
                'breached' => false,
                'count' => 0,
                'message' => 'Unable to check password breach status at this time.',
            ];
        }

        // Parse response — each line is HASH_SUFFIX:COUNT
        $lines = explode("\r\n", $responseBody);
        foreach ($lines as $line) {
            $parts = explode(':', $line);
            if (count($parts) === 2 && $parts[0] === $suffix) {
                $count = (int) $parts[1];

                return [
                    'breached' => true,
                    'count' => $count,
                    'message' => $this->buildMessage($count),
                ];
            }
        }

        return [
            'breached' => false,
            'count' => 0,
            'message' => 'Password not found in known breaches.',
        ];
    }

    /**
     * Build a user-facing message about the breach count.
     */
    protected function buildMessage(int $count): string
    {
        if ($count <= 0) {
            return 'Password not found in known breaches.';
        }

        if ($count === 1) {
            return 'This password has appeared in 1 known data breach. Consider changing it.';
        }

        if ($count < 10) {
            return "This password has appeared in {$count} known data breaches. You should change it.";
        }

        if ($count < 100) {
            return "This password has appeared in {$count} known data breaches. It is highly compromised — change it immediately.";
        }

        return "This password has appeared in {$count} known data breaches and is severely compromised. Change it immediately.";
    }
}
