<?php

namespace App\Models;

use App\Support\CamelCase;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'code',
        'type',
        'value',
        'min_amount',
        'max_discount',
        'usage_limit',
        'used_count',
        'trip_slug',
        'is_active',
        'starts_at',
        'ends_at',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'integer',
            'min_amount' => 'integer',
            'max_discount' => 'integer',
            'usage_limit' => 'integer',
            'used_count' => 'integer',
            'is_active' => 'boolean',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toApiArray(): array
    {
        return CamelCase::convert([
            'id' => (string) $this->id,
            'code' => $this->code,
            'type' => $this->type,
            'value' => (int) $this->value,
            'min_amount' => (int) $this->min_amount,
            'max_discount' => $this->max_discount !== null ? (int) $this->max_discount : null,
            'usage_limit' => $this->usage_limit !== null ? (int) $this->usage_limit : null,
            'used_count' => (int) $this->used_count,
            'trip_slug' => $this->trip_slug,
            'is_active' => (bool) $this->is_active,
            'starts_at' => $this->starts_at?->toISOString(),
            'ends_at' => $this->ends_at?->toISOString(),
            'description' => $this->description,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ]);
    }
}
