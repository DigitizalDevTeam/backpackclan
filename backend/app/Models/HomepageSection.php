<?php

namespace App\Models;

use App\Support\CamelCase;
use Illuminate\Database\Eloquent\Model;

class HomepageSection extends Model
{
    protected $fillable = [
        'slug',
        'title',
        'type',
        'sort_order',
        'is_enabled',
        'content',
    ];

    protected function casts(): array
    {
        return [
            'content' => 'array',
            'is_enabled' => 'boolean',
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
            'slug' => $this->slug,
            'title' => $this->title,
            'type' => $this->type,
            'sort_order' => $this->sort_order,
            'is_enabled' => $this->is_enabled,
            'content' => $this->content ?? [],
            'updated_at' => $this->updated_at?->toISOString(),
        ]);
    }
}
