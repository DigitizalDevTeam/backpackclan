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
                'name' => 'Bike Tours',
                'slug' => 'bike-tours',
                'description' => '<p>Epic motorcycle expeditions across the Himalayas — Ladakh, Spiti, and beyond.</p>',
                'image_id' => '2',
                'sort_order' => 0,
            ],
            [
                'name' => 'Treks',
                'slug' => 'treks',
                'description' => '<p>Guided trekking adventures from easy day hikes to challenging high-altitude trails.</p>',
                'image_id' => '3',
                'sort_order' => 1,
            ],
            [
                'name' => 'Group Tours',
                'slug' => 'group-tours',
                'description' => '<p>Fixed-departure group tours with like-minded travellers and expert guides.</p>',
                'image_id' => '1',
                'sort_order' => 2,
            ],
            [
                'name' => 'Custom Trips',
                'slug' => 'custom-trips',
                'description' => '<p>Tailor-made itineraries designed around your dates, budget, and interests.</p>',
                'sort_order' => 3,
            ],
            [
                'name' => 'Weekend Getaways',
                'slug' => 'weekend-getaways',
                'description' => '<p>Short escapes perfect for a long weekend — no extended leave required.</p>',
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
    }
}
