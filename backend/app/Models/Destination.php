<?php

namespace App\Models;

use App\Support\CamelCase;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Destination extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'country',
        'region',
        'tagline',
        'hero_image_id',
        'overview',
        'banner',
        'linked_trip_ids',
        'faqs',
        'best_time',
        'weather',
        'map',
        'seo',
        'is_featured',
        'sort_order',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'overview' => 'array',
            'banner' => 'array',
            'linked_trip_ids' => 'array',
            'faqs' => 'array',
            'best_time' => 'array',
            'weather' => 'array',
            'map' => 'array',
            'seo' => 'array',
            'is_featured' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toApiArray(): array
    {
        $linked = $this->linked_trip_ids ?? [];

        return CamelCase::convert([
            'id' => (string) $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'country' => $this->country,
            'region' => $this->region,
            'tagline' => $this->tagline ?? '',
            'hero_image_id' => $this->hero_image_id,
            'overview' => $this->overview ?? [
                'content' => '',
                'highlights' => [],
                'gallery' => [],
            ],
            'banner' => $this->banner ?? [
                'headline' => '',
                'subheadline' => '',
                'cta_label' => '',
                'cta_url' => '',
                'media_id' => null,
            ],
            'linked_trip_ids' => $linked,
            'faqs' => $this->faqs ?? [],
            'best_time' => $this->best_time ?? [
                'content' => '',
                'recommended_months' => [],
            ],
            'weather' => $this->weather ?? [],
            'map' => $this->map ?? [
                'embed_url' => '',
                'latitude' => null,
                'longitude' => null,
            ],
            'seo' => $this->seo ?? [
                'meta_title' => '',
                'meta_description' => '',
                'og_image_id' => null,
                'canonical_url' => '',
                'robots' => 'index, follow',
            ],
            'is_featured' => $this->is_featured,
            'sort_order' => $this->sort_order,
            'status' => $this->status,
            'trip_count' => count($linked),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ]);
    }
}
