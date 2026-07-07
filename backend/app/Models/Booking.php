<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Booking extends Model
{
    protected $fillable = [
        'user_id',
        'booking_ref',
        'trip_slug',
        'trip_title',
        'destination',
        'batch_date',
        'travelers',
        'status',
        'total_amount',
        'paid_amount',
        'balance_due',
        'invoice_number',
        'voucher_code',
    ];

    protected function casts(): array
    {
        return [
            'batch_date' => 'date',
            'travelers' => 'integer',
            'total_amount' => 'integer',
            'paid_amount' => 'integer',
            'balance_due' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(BookingDocument::class);
    }
}
