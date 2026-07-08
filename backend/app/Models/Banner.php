<?php

namespace App\Models;

use App\Support\CamelCase;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    protected $fillable = [
        'title',
        'placement',
        'destination_id',
        'media_type',
        'media_id',
        'headline',
        'subheadline',
        'link_url',
        'cta_buttons',
        'starts_at',
        'ends_at',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'cta_buttons' => 'array',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toApiArray(): array
    {
        return CamelCase::convert([
            'id' => (string) $this->id,
            'title' => $this->title,
            'placement' => $this->placement,
            'destination_id' => $this->destination_id,
            'media_type' => $this->media_type,
            'media_id' => $this->media_id,
            'headline' => $this->headline,
            'subheadline' => $this->subheadline,
            'link_url' => $this->link_url,
            'cta_buttons' => $this->cta_buttons ?? [],
            'starts_at' => $this->starts_at?->toISOString(),
            'ends_at' => $this->ends_at?->toISOString(),
            'sort_order' => $this->sort_order,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ]);
    }
}
