<?php

return [
    'defaults' => [
        'guard' => 'web',
        'passwords' => 'users',
    ],
    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],
        'api' => [
            'driver' => 'sanctum',
            'provider' => 'users',
        ],
    ],
    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model' => App\Models\User::class,
        ],
    ],
    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => 'password_reset_tokens',
            'expire' => 60,
            'throttle' => env('RESET_REQUEST_LIMIT', 3),
        ],
    ],
    'password_timeout' => 300,
    'two_factor' => [
        'required' => env('TWO_FACTOR_REQUIRED', false),
        'window' => 1,
        'issuer' => env('TWO_FACTOR_ISSUER', 'Ecvaultz'),
    ],
];
