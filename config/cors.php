<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'secure/download/*'],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    'allowed_origins' => array_filter([
        env('APP_URL', 'https://ecvaultz.test'),
        env('VITE_DEV_URL'), // Allow Vite dev server origin during development (e.g. http://localhost:5173)
    ]),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['Content-Type', 'X-Requested-With', 'X-XSRF-TOKEN', 'Authorization'],
    'exposed_headers' => ['Content-Disposition'],
    'max_age' => 86400,
    'supports_credentials' => true,
];
