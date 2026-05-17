<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

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
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.bunny.net",
            "img-src 'self' data: blob:",
            "font-src 'self' https://fonts.gstatic.com https://fonts.bunny.net",
            "connect-src 'self' ws://localhost:5173",
            "frame-src 'none'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
        ];

        // Only force HTTPS upgrade in production
        if (app()->environment('production')) {
            $csp[] = "upgrade-insecure-requests";
        }

        return implode('; ', $csp);
    }
}
