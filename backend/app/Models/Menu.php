<?php

namespace App\Models;

use App\Support\CamelCase;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Menu extends Model
{
    protected $fillable = ['name', 'slug', 'location'];

    public function items(): HasMany
    {
        return $this->hasMany(MenuItem::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function toApiArray(int $itemCount = 0, int $activeCount = 0): array
    {
        return CamelCase::convert([
            'id' => (string) $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'location' => $this->location,
            'item_count' => $itemCount,
            'active_count' => $activeCount,
        ]);
    }
}
