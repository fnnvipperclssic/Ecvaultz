<?php

/**
 * Prevent SSRF (Server-Side Request Forgery) Middleware
 *
 * Menerapkan OWASP A10 (Server-Side Request Forgery) protection dengan
 * memvalidasi URL outbound sebelum melakukan HTTP request.
 *
 * Proteksi:
 * - Resolve hostname ke IP address
 * - Block private/RFC1918 IP ranges (10.x, 172.16-31.x, 192.168.x)
 * - Block loopback addresses (127.x, ::1, localhost)
 * - Block link-local addresses (169.254.x)
 * - Allowlist domain yang dikenal aman (api.pwnedpasswords.com)
 *
 * Digunakan oleh service yang melakukan outbound HTTP calls seperti:
 * - HIBPService (Have I Been Pwned API)
 *
 * @package App\Http\Middleware
 * @security OWASP A10 — SSRF Prevention
 */

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class PreventSsrf
{
    /**
     * Domain allowlist yang sudah diverifikasi aman.
     * Request ke domain ini tidak akan di-block.
     *
     * @var array<string>
     */
    private const ALLOWED_DOMAINS = [
        'api.pwnedpasswords.com',
    ];

    /**
     * IP ranges yang di-block (private network + loopback).
     *
     * @var array<array{string, string}>
     */
    private const BLOCKED_RANGES = [
        ['10.0.0.0', '10.255.255.255'],       // Class A private
        ['172.16.0.0', '172.31.255.255'],     // Class B private
        ['192.168.0.0', '192.168.255.255'],   // Class C private
        ['127.0.0.0', '127.255.255.255'],     // Loopback IPv4
        ['169.254.0.0', '169.254.255.255'],   // Link-local
        ['0.0.0.0', '0.255.255.255'],         // Current network
        ['224.0.0.0', '239.255.255.255'],     // Multicast
        ['240.0.0.0', '255.255.255.255'],     // Reserved/Future use
    ];

    /**
     * Validasi URL sebelum melakukan outbound HTTP request.
     *
     * Static method — bisa dipanggil dari service tanpa melalui HTTP request cycle.
     *
     * @param string $url URL yang akan di-validasi
     * @return bool True jika URL aman (tidak mengarah ke internal network)
     * @throws \InvalidArgumentException Jika URL tidak valid atau mengarah ke internal network
     *
     * @security Mencegah attacker memanfaatkan server untuk mengakses
     *           internal network resources (metadata services, internal APIs, dll)
     */
    public static function validateUrl(string $url): bool
    {
        $parsedUrl = parse_url($url);

        if (!isset($parsedUrl['host'])) {
            throw new \InvalidArgumentException('URL tidak memiliki host yang valid.');
        }

        $host = $parsedUrl['host'];

        // Allowlist check — domain yang sudah diverifikasi aman
        foreach (self::ALLOWED_DOMAINS as $allowed) {
            if ($host === $allowed || str_ends_with($host, '.' . $allowed)) {
                return true;
            }
        }

        // Block localhost dan variasinya
        $blockedHosts = ['localhost', '127.0.0.1', '::1', '0.0.0.0'];
        if (in_array($host, $blockedHosts, true)) {
            Log::warning('SSRF blocked: localhost access attempted', [
                'url' => $url,
                'host' => $host,
            ]);
            throw new \InvalidArgumentException('Access to localhost is blocked for security reasons.');
        }

        // Resolve hostname ke IP
        $ips = @dns_get_record($host, DNS_A);
        if (empty($ips)) {
            $ips = @dns_get_record($host, DNS_AAAA);
        }

        // Jika DNS resolution gagal, coba gethostbyname sebagai fallback
        if (empty($ips)) {
            $ip = @gethostbyname($host);
            if ($ip === $host) {
                // gethostbyname gagal — host tidak valid
                Log::warning('SSRF blocked: unable to resolve host', [
                    'url' => $url,
                    'host' => $host,
                ]);
                throw new \InvalidArgumentException('Unable to resolve hostname for security validation.');
            }

            if (self::isBlockedIp($ip)) {
                Log::warning('SSRF blocked: internal IP detected', [
                    'url' => $url,
                    'host' => $host,
                    'resolved_ip' => $ip,
                ]);
                throw new \InvalidArgumentException('Access to internal/private networks is blocked.');
            }

            return true;
        }

        // Cek setiap IP hasil DNS resolution
        foreach ($ips as $record) {
            $ip = $record['ip'] ?? ($record['ipv6'] ?? null);
            if ($ip && self::isBlockedIp($ip)) {
                Log::warning('SSRF blocked: DNS resolved to internal IP', [
                    'url' => $url,
                    'host' => $host,
                    'resolved_ip' => $ip,
                ]);
                throw new \InvalidArgumentException('Access to internal/private networks is blocked.');
            }
        }

        return true;
    }

    /**
     * Cek apakah IP address termasuk dalam range yang di-block.
     *
     * @param string $ip IP address (IPv4 atau IPv6)
     * @return bool True jika IP di-block
     */
    private static function isBlockedIp(string $ip): bool
    {
        // IPv6 loopback
        if ($ip === '::1') {
            return true;
        }

        // IPv4 private range check
        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            $ipLong = ip2long($ip);

            foreach (self::BLOCKED_RANGES as $range) {
                $start = ip2long($range[0]);
                $end = ip2long($range[1]);

                if ($ipLong >= $start && $ipLong <= $end) {
                    return true;
                }
            }
        }

        return false;
    }
}
