<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Motor Biking',
                'slug' => 'motor-biking',
                'description' => '<p>High passes, open roads, and legendary Himalayan motorcycle circuits across India and beyond.</p>',
                'image_id' => '1',
                'sort_order' => 0,
            ],
            [
                'name' => 'Backpacking',
                'slug' => 'backpacking',
                'description' => '<p>Slow travel, local stays, and flexible itineraries for explorers who want the journey, not just the highlight reel.</p>',
                'image_id' => '2',
                'sort_order' => 1,
            ],
            [
                'name' => 'Treks',
                'slug' => 'treks',
                'description' => '<p>Season-ready Himalayan trails — from alpine lakes to Everest base camp, guided and safety-first.</p>',
                'image_id' => '7',
                'sort_order' => 2,
            ],
            [
                'name' => 'Custom Departures',
                'slug' => 'custom-departures',
                'description' => '<p>Private groups and bespoke itineraries built around your dates, pace, and budget.</p>',
                'image_id' => '4',
                'sort_order' => 3,
            ],
            [
                'name' => 'Weekend Getaways',
                'slug' => 'weekend-getaways',
                'description' => '<p>Short escapes perfect for a long weekend — no extended leave required.</p>',
                'image_id' => '3',
                'sort_order' => 4,
            ],
        ];

        foreach ($categories as $data) {
            Category::query()->updateOrCreate(
                ['slug' => $data['slug']],
                [
                    'name' => $data['name'],
                    'description' => $data['description'],
                    'image_id' => $data['image_id'] ?? null,
                    'sort_order' => $data['sort_order'],
                    'is_active' => true,
                ]
            );
        }

        // Retire legacy category slugs so admin + filters stay clean.
        Category::query()
            ->where(function ($q) {
                $q->whereIn('slug', ['bike-tours', 'group-tours', 'custom-trips', 'weekend-getaways-12'])
                    ->orWhere('name', 'like', 'Weekend Getaways %');
            })
            ->update(['is_active' => false]);
    }
}
