<?php

namespace App\Models;

use App\Support\CamelCase;
use App\Support\PublicStorageUrl;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Media extends Model
{
    protected $table = 'media';

    protected $fillable = [
        'uuid',
        'filename',
        'url',
        'mime_type',
        'media_type',
        'size',
        'alt_text',
        'title',
        'uploaded_by',
    ];

    protected function casts(): array
    {
        return [
            'size' => 'integer',
        ];
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public static function mediaTypeFromMime(string $mime): string
    {
        if (str_starts_with($mime, 'image/')) {
            return 'image';
        }
        if (str_starts_with($mime, 'video/')) {
            return 'video';
        }

        return 'document';
    }

    /**
     * @return array<string, mixed>
     */
    public function toApiArray(): array
    {
        return CamelCase::convert([
            'id' => (string) $this->id,
            'uuid' => $this->uuid,
            'filename' => $this->filename,
            'url' => PublicStorageUrl::normalize($this->url),
            'mime_type' => $this->mime_type,
            'media_type' => $this->media_type,
            'size' => $this->size,
            'alt_text' => $this->alt_text,
            'title' => $this->title,
            'uploaded_by' => $this->uploaded_by ? (string) $this->uploaded_by : '',
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ]);
    }

    public static function makeFromUpload($file, int $userId): self
    {
        $mime = $file->getMimeType() ?? 'application/octet-stream';
        $filename = Str::uuid().'_'.$file->getClientOriginalName();
        $path = $file->storeAs('media', $filename, 'public');
        $title = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $title = str_replace(['-', '_'], ' ', $title);

        return self::query()->create([
            'uuid' => (string) Str::uuid(),
            'filename' => $file->getClientOriginalName(),
            'url' => PublicStorageUrl::fromPath($path),
            'mime_type' => $mime,
            'media_type' => self::mediaTypeFromMime($mime),
            'size' => $file->getSize(),
            'alt_text' => '',
            'title' => ucwords($title),
            'uploaded_by' => $userId,
        ]);
    }
}
