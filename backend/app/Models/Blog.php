<?php

namespace App\Models;

use App\Support\CamelCase;
use Illuminate\Database\Eloquent\Model;

class Blog extends Model
{
    protected $fillable = [
        'slug',
        'title',
        'excerpt',
        'content',
        'image_id',
        'category',
        'author',
        'author_role',
        'published_at',
        'read_time',
        'tags',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'content' => 'array',
            'tags' => 'array',
            'published_at' => 'date',
            'read_time' => 'integer',
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
            'excerpt' => $this->excerpt,
            'content' => $this->content ?? [],
            'image_id' => $this->image_id,
            'category' => $this->category,
            'author' => $this->author,
            'author_role' => $this->author_role,
            'published_at' => $this->published_at?->format('Y-m-d'),
            'read_time' => $this->read_time,
            'tags' => $this->tags ?? [],
            'status' => $this->status,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ]);
    }
}
