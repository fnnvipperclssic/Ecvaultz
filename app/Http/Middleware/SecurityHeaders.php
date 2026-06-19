<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Injects security-related HTTP headers on every web response.
 *
 * Covers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
 * Permissions-Policy, and Cross-Origin isolation policies.
 * CSP allows unsafe-inline/unsafe-eval in local/dev for Vite HMR; tightened in production.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        return $response->withHeaders([
            'X-Content-Type-Options' => 'nosniff',
            'X-Frame-Options' => 'DENY',
            'X-XSS-Protection' => '1; mode=block',
            'Referrer-Policy' => 'strict-origin-when-cross-origin',
            'Permissions-Policy' => 'camera=(), microphone=(), geolocation=()',
            'Cross-Origin-Resource-Policy' => 'same-origin',
            'Cross-Origin-Opener-Policy' => 'same-origin',
            'Cross-Origin-Embedder-Policy' => 'unsafe-none',
            'Strict-Transport-Security' => sprintf(
                'max-age=%d%s',
                config('security.hsts.max_age', 31536000),
                config('security.hsts.include_subdomains', true) ? '; includeSubDomains' : ''
            ),
            'Content-Security-Policy' => $this->buildCSP(),
            'Cache-Control' => 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma' => 'no-cache',
        ]);
    }

    protected function buildCSP(): string
    {
        $csp = [
            "default-src 'self'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.bunny.net",
            "img-src 'self' data: blob:",
            "font-src 'self' https://fonts.gstatic.com https://fonts.bunny.net",
            "connect-src 'self' ws://localhost:5173 http://localhost:5173",
            "frame-src 'none'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
        ];

        // For development, allow unsafe-inline and unsafe-eval (needed for Vite HMR)
        if (app()->environment('local', 'testing')) {
            $csp[] = "script-src 'self' 'unsafe-inline' 'unsafe-eval'";
        } else {
            // Production: stricter CSP without unsafe-eval
            $csp[] = "script-src 'self' 'unsafe-inline'";
            $csp[] = "upgrade-insecure-requests";
        }

        return implode('; ', $csp);
    }
}
