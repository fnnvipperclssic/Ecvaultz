<?php

return [
    'max_upload_size' => (int) env('MAX_UPLOAD_SIZE', 52428800),
    'allowed_extensions' => explode(',', env('ALLOWED_EXTENSIONS', 'pdf,docx,xlsx,jpg,png,7z')),
    'allowed_mimes' => [
        'pdf' => 'application/pdf',
        'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        '7z' => 'application/x-7z-compressed',
    ],
    'upload_rate_limit' => (int) env('UPLOAD_RATE_LIMIT', 10),
    'download_rate_limit' => (int) env('DOWNLOAD_RATE_LIMIT', 20),
    'reset_request_limit' => (int) env('RESET_REQUEST_LIMIT', 3),
    'password' => [
        'min_length' => (int) env('PASSWORD_MIN_LENGTH', 12),
        'require_uppercase' => (bool) env('PASSWORD_REQUIRE_UPPERCASE', true),
        'require_numeric' => (bool) env('PASSWORD_REQUIRE_NUMERIC', true),
        'require_symbol' => (bool) env('PASSWORD_REQUIRE_SYMBOL', true),
    ],
    'soft_delete_retention_days' => (int) env('SOFT_DELETE_RETENTION_DAYS', 30),
    'max_bulk_delete' => (int) env('MAX_BULK_DELETE', 100),
    'confirmation_bulk_delete_threshold' => (int) env('CONFIRMATION_BULK_DELETE_THRESHOLD', 10),
    'clamav' => [
        'socket' => env('CLAMAV_SOCKET', 'unix:///var/run/clamav/clamd.ctl'),
        'scan_enabled' => (bool) env('SCAN_UPLOADS', true),
    ],
    'hsts' => [
        'max_age' => (int) env('HSTS_MAX_AGE', 31536000),
        'include_subdomains' => (bool) env('HSTS_INCLUDE_SUBDOMAINS', true),
    ],
    'session' => [
        'idle_timeout' => (int) env('SESSION_IDLE_TIMEOUT', 1800),
        'regenerate_on_login' => true,
        'regenerate_on_logout' => true,
        'regenerate_on_privilege_change' => true,
    ],
    'cache' => [
        'ttl_files' => (int) env('CACHE_TTL_FILES', 300),
    ],
];
