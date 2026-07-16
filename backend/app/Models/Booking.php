<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Booking extends Model
{
    protected $fillable = [
        'user_id',
        'trip_id',
        'departure_id',
        'booking_ref',
        'trip_slug',
        'trip_title',
        'destination',
        'batch_date',
        'travelers',
        'adults',
        'children',
        'traveler_details',
        'contact_phone',
        'contact_email',
        'status',
        'total_amount',
        'paid_amount',
        'balance_due',
        'invoice_number',
        'voucher_code',
        'coupon_code',
        'discount_amount',
        'addons_total',
        'subtotal_amount',
        'selected_addons',
    ];

    protected function casts(): array
    {
        return [
            'batch_date' => 'date',
            'travelers' => 'integer',
            'adults' => 'integer',
            'children' => 'integer',
            'traveler_details' => 'array',
            'selected_addons' => 'array',
            'total_amount' => 'integer',
            'paid_amount' => 'integer',
            'balance_due' => 'integer',
            'discount_amount' => 'integer',
            'addons_total' => 'integer',
            'subtotal_amount' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }

    public function departure(): BelongsTo
    {
        return $this->belongsTo(Departure::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(BookingDocument::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function tripReview(): HasOne
    {
        return $this->hasOne(TripReview::class);
    }
}
