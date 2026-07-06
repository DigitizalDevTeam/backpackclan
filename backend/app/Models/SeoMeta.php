<?php

namespace App\Models;

use App\Support\CamelCase;
use Illuminate\Database\Eloquent\Model;

class SeoMeta extends Model
{
    protected $table = 'seo_meta';

    protected $fillable = [
        'page_key',
        'meta_title',
        'meta_description',
        'og_image_id',
        'canonical_url',
        'robots',
        'schema_json',
    ];

    /**
     * @return array<string, mixed>
     */
    public function toApiArray(): array
    {
        return CamelCase::convert([
            'id' => (string) $this->id,
            'page_key' => $this->page_key,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'og_image_id' => $this->og_image_id,
            'canonical_url' => $this->canonical_url,
            'robots' => $this->robots,
            'schema_json' => $this->schema_json ?? '',
            'updated_at' => $this->updated_at?->toISOString(),
        ]);
    }
}
