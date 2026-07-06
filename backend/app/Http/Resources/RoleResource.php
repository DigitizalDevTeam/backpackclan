<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Role */
class RoleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'isSystem' => $this->is_system,
            'permissions' => $this->whenLoaded(
                'permissions',
                fn () => $this->permissions->pluck('slug')->values()->all()
            ),
            'userCount' => $this->whenCounted('users'),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
