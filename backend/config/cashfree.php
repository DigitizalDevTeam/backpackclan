<?php

return [
    'app_id' => env('CASHFREE_APP_ID'),
    'secret_key' => env('CASHFREE_SECRET_KEY'),
    'webhook_secret' => env('CASHFREE_WEBHOOK_SECRET'),
    'currency' => env('CASHFREE_CURRENCY', env('STRIPE_CURRENCY', 'INR')),
    'env' => env('CASHFREE_ENV', 'sandbox'), // sandbox | production
    'api_version' => env('CASHFREE_API_VERSION', '2025-01-01'),
];
