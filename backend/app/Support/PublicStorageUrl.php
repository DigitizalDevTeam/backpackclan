<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

class PublicStorageUrl
{
    public static function fromPath(string $path): string
    {
        return Storage::disk('public')->url($path);
    }

    public static function normalize(?string $url): string
    {
        if ($url === null || $url === '') {
            return '';
        }

        if (preg_match('#^https?://#', $url) && ! str_contains($url, '/storage/')) {
            return $url;
        }

        if (preg_match('#/storage/(.+)$#', $url, $matches)) {
            return self::fromPath($matches[1]);
        }

        return $url;
    }

    public static function pathFromUrl(string $url): ?string
    {
        if (! preg_match('#/storage/(.+)$#', $url, $matches)) {
            return null;
        }

        return $matches[1];
    }
}
