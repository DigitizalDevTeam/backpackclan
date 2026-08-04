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
        'max_altitude',
        'summary',
        'cover_image_id',
        'brochure_media_id',
        'gallery',
        'overview',
        'itinerary',
        'inclusions',
        'exclusions',
        'things_to_carry',
        'cancellation_policy',
        'refund_policy',
        'faqs',
        'testimonials',
        'pricing',
        'addons',
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
            'things_to_carry' => 'array',
            'cancellation_policy' => 'array',
            'refund_policy' => 'array',
            'faqs' => 'array',
            'testimonials' => 'array',
            'pricing' => 'array',
            'addons' => 'array',
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

    public function tripReviews(): HasMany
    {
        return $this->hasMany(TripReview::class);
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
            'brochure_media_id' => $this->brochure_media_id,
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
            'things_to_carry' => self::linesToRepeater($this->things_to_carry),
            'cancellation_policy' => self::linesToRepeater($this->cancellation_policy),
            'refund_policy' => self::linesToRepeater($this->refund_policy),
            'max_altitude' => $this->max_altitude,
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

    /**
     * @param  array<int, mixed>|null  $lines
     * @return list<array{id: string, text: string}>
     */
    private static function linesToRepeater(?array $lines): array
    {
        if (! $lines) {
            return [];
        }

        return collect($lines)
            ->values()
            ->map(fn ($line, $index) => [
                'id' => 'l'.($index + 1),
                'text' => is_array($line) ? (string) ($line['text'] ?? '') : (string) $line,
            ])
            ->filter(fn (array $item) => $item['text'] !== '')
            ->values()
            ->all();
    }
}
