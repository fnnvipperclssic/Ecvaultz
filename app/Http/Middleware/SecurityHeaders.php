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

        $headers = [
            'X-Content-Type-Options' => 'nosniff',
            'X-Frame-Options' => 'DENY',
            // 'X-XSS-Protection' REMOVED — deprecated header, removed from modern browsers
            // XSS protection is handled by CSP + React auto-escaping instead
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
        ];

        // BinaryFileResponse, StreamedResponse, etc. don't have withHeaders()
        // Use headers->set() as a universal fallback
        if (method_exists($response, 'withHeaders')) {
            return $response->withHeaders($headers);
        }

        foreach ($headers as $key => $value) {
            $response->headers->set($key, $value);
        }

        return $response;
    }

    protected function buildCSP(): string
    {
        // Determine Vite dev server origin for local development
        $isLocal = app()->environment('local', 'testing');
        $viteOrigin = $isLocal ? 'http://127.0.0.1:5173 http://localhost:5173' : '';
        $viteWs = $isLocal ? 'ws://127.0.0.1:5173 ws://localhost:5173' : '';

        $csp = [
            "default-src 'self'" . ($isLocal ? " {$viteOrigin}" : ''),
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.bunny.net" . ($isLocal ? " {$viteOrigin}" : ''),
            "img-src 'self' data: blob:" . ($isLocal ? " {$viteOrigin}" : ''),
            "font-src 'self' https://fonts.gstatic.com https://fonts.bunny.net" . ($isLocal ? " {$viteOrigin}" : ''),
            "connect-src 'self'" . ($isLocal ? " {$viteWs} {$viteOrigin}" : ''),
            "frame-src 'none'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
        ];

        // For development, allow Vite HMR origins + unsafe-inline/unsafe-eval
        if ($isLocal) {
            $csp[] = "script-src 'self' 'unsafe-inline' 'unsafe-eval' {$viteOrigin}";
        } else {
            // Production: stricter CSP without unsafe-eval
            $csp[] = "script-src 'self' 'unsafe-inline'";
            if (env('FORCE_HTTPS', false)) {
                $csp[] = "upgrade-insecure-requests";
            }
        }

        return implode('; ', $csp);
    }
}
