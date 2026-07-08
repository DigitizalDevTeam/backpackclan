<?php

namespace App\Models;

use App\Support\CamelCase;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Trip extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'destination_id',
        'title',
        'slug',
        'trip_type',
        'duration_days',
        'duration_nights',
        'difficulty',
        'max_group_size',
        'min_age',
        'summary',
        'cover_image_id',
        'gallery',
        'overview',
        'itinerary',
        'inclusions',
        'exclusions',
        'faqs',
        'testimonials',
        'pricing',
        'seo',
        'is_featured',
        'status',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'gallery' => 'array',
            'overview' => 'array',
            'itinerary' => 'array',
            'inclusions' => 'array',
            'exclusions' => 'array',
            'faqs' => 'array',
            'testimonials' => 'array',
            'pricing' => 'array',
            'seo' => 'array',
            'is_featured' => 'boolean',
            'duration_days' => 'integer',
            'duration_nights' => 'integer',
            'max_group_size' => 'integer',
            'min_age' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function destination(): BelongsTo
    {
        return $this->belongsTo(Destination::class);
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'trip_category');
    }

    public function departures(): HasMany
    {
        return $this->hasMany(Departure::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function toApiArray(): array
    {
        return CamelCase::convert([
            'id' => (string) $this->id,
            'destination_id' => (string) $this->destination_id,
            'category_ids' => $this->categories->pluck('id')->map(fn ($id) => (string) $id)->values()->all(),
            'title' => $this->title,
            'slug' => $this->slug,
            'trip_type' => $this->trip_type,
            'duration_days' => $this->duration_days,
            'duration_nights' => $this->duration_nights,
            'difficulty' => $this->difficulty,
            'max_group_size' => $this->max_group_size,
            'min_age' => $this->min_age,
            'summary' => $this->summary ?? '',
            'cover_image_id' => $this->cover_image_id,
            'gallery' => $this->gallery ?? [],
            'overview' => $this->overview ?? [
                'content' => '',
                'highlights' => [],
                'route_map_embed' => '',
                'route_map_image_id' => null,
            ],
            'itinerary' => $this->itinerary ?? [],
            'inclusions' => $this->inclusions ?? [],
            'exclusions' => $this->exclusions ?? [],
            'faqs' => $this->faqs ?? [],
            'testimonials' => $this->testimonials ?? [],
            'pricing' => $this->pricing ?? [
                'base_price' => 0,
                'show_strike_through' => false,
                'currency' => 'INR',
                'price_per' => 'person',
            ],
            'seo' => $this->seo ?? [
                'meta_title' => '',
                'meta_description' => '',
                'og_image_id' => null,
                'canonical_url' => '',
                'robots' => 'index, follow',
            ],
            'is_featured' => $this->is_featured,
            'status' => $this->status,
            'sort_order' => $this->sort_order,
            'departures_count' => $this->departures()->count(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ]);
    }
}
