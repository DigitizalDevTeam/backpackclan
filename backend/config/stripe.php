<?php

return [
    'key' => env('STRIPE_KEY'),
    'secret' => env('STRIPE_SECRET'),
    'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
    'currency' => env('STRIPE_CURRENCY', 'inr'),
    /** Percentage of total due as minimum deposit when unpaid */
    'deposit_percent' => (int) env('BOOKING_DEPOSIT_PERCENT', 30),
];
