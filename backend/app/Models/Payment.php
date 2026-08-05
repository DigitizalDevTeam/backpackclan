<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'booking_id',
        'user_id',
        'amount',
        'currency',
        'status',
        'provider',
        'mode',
        'stripe_payment_intent_id',
        'razorpay_order_id',
        'razorpay_payment_id',
        'cashfree_order_id',
        'cashfree_payment_id',
        'cashfree_payment_session_id',
        'meta',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'meta' => 'array',
            'paid_at' => 'datetime',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
