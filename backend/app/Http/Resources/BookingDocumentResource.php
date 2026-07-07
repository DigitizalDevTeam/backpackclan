<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\BookingDocument */
class BookingDocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'mimeType' => $this->mime_type,
            'category' => $this->category,
            'uploadedAt' => $this->created_at?->toISOString(),
        ];
    }
}
