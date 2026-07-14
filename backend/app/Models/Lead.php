<?php

namespace App\Models;

use App\Support\CamelCase;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Lead extends Model
{
    public const TYPES = [
        'contact',
        'callback',
        'general',
        'custom_trip',
        'corporate',
        'partner',
        'career',
    ];

    public const STATUSES = [
        'new',
        'contacted',
        'qualified',
        'converted',
        'closed',
    ];

    protected $fillable = [
        'type',
        'status',
        'name',
        'email',
        'phone',
        'payload',
        'source_url',
        'admin_notes',
        'assigned_to',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
        ];
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * @return array<string, mixed>
     */
    public function toApiArray(): array
    {
        return CamelCase::convert([
            'id' => (string) $this->id,
            'type' => $this->type,
            'status' => $this->status,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'payload' => $this->payload ?? [],
            'source_url' => $this->source_url,
            'admin_notes' => $this->admin_notes,
            'assigned_to' => $this->assigned_to ? (string) $this->assigned_to : null,
            'assignee' => $this->relationLoaded('assignee') && $this->assignee
                ? [
                    'id' => (string) $this->assignee->id,
                    'name' => $this->assignee->name,
                    'email' => $this->assignee->email,
                ]
                : null,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ]);
    }
}
