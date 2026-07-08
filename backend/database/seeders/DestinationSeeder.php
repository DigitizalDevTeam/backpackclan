<?php

namespace Database\Seeders;

use App\Models\Destination;
use Illuminate\Database\Seeder;

class DestinationSeeder extends Seeder
{
    public function run(): void
    {
        $destinations = [
            [
                'name' => 'Leh Ladakh',
                'slug' => 'leh-ladakh',
                'country' => 'India',
                'region' => 'Ladakh',
                'tagline' => 'Land of high passes, turquoise lakes, and epic bike routes',
                'hero_image_id' => '1',
                'is_featured' => true,
                'sort_order' => 0,
                'status' => 'published',
                'overview' => [
                    'content' => '<p>Leh Ladakh is the ultimate Himalayan adventure.</p>',
                    'highlights' => [
                        ['id' => 'h1', 'icon' => '🏔️', 'text' => 'Khardung La & high-altitude passes'],
                    ],
                    'gallery' => ['1', '2', '7'],
                ],
                'banner' => [
                    'headline' => 'Conquer Ladakh',
                    'subheadline' => 'Bike tours, road trips & treks',
                    'cta_label' => 'View Ladakh Trips',
                    'cta_url' => '/trips?destination=leh-ladakh',
                    'media_id' => '1',
                ],
                'linked_trip_ids' => ['t1'],
                'best_time' => [
                    'content' => '<p>June to September is ideal.</p>',
                    'recommended_months' => [6, 7, 8, 9],
                ],
                'seo' => [
                    'meta_title' => 'Leh Ladakh Tours | Backpackclan',
                    'meta_description' => 'Explore Leh Ladakh bike tours and treks.',
                    'og_image_id' => '1',
                    'canonical_url' => 'https://backpackclan.com/destinations/leh-ladakh',
                    'robots' => 'index, follow',
                ],
            ],
            [
                'name' => 'Spiti Valley',
                'slug' => 'spiti',
                'country' => 'India',
                'region' => 'Himachal Pradesh',
                'tagline' => 'The middle land — raw landscapes and ancient monasteries',
                'hero_image_id' => '2',
                'is_featured' => true,
                'sort_order' => 1,
                'status' => 'published',
            ],
            [
                'name' => 'Kashmir',
                'slug' => 'kashmir',
                'country' => 'India',
                'region' => 'Jammu & Kashmir',
                'tagline' => 'Paradise on earth',
                'hero_image_id' => '3',
                'is_featured' => true,
                'sort_order' => 2,
                'status' => 'published',
            ],
            [
                'name' => 'Bhutan',
                'slug' => 'bhutan',
                'country' => 'Bhutan',
                'region' => 'Western Bhutan',
                'tagline' => 'The last Shangri-La',
                'hero_image_id' => '4',
                'sort_order' => 3,
                'status' => 'published',
            ],
            [
                'name' => 'Nepal',
                'slug' => 'nepal',
                'country' => 'Nepal',
                'region' => 'Himalayas',
                'tagline' => 'Everest, Annapurna, and world-class trekking',
                'hero_image_id' => '5',
                'is_featured' => true,
                'sort_order' => 4,
                'status' => 'published',
            ],
            [
                'name' => 'Sikkim',
                'slug' => 'sikkim',
                'country' => 'India',
                'region' => 'Northeast India',
                'tagline' => 'Monasteries and Kanchenjunga views',
                'sort_order' => 5,
                'status' => 'draft',
            ],
            [
                'name' => 'Meghalaya',
                'slug' => 'meghalaya',
                'country' => 'India',
                'region' => 'Northeast India',
                'tagline' => 'Living root bridges and cloud forests',
                'sort_order' => 6,
                'status' => 'draft',
            ],
        ];

        foreach ($destinations as $data) {
            Destination::query()->updateOrCreate(
                ['slug' => $data['slug']],
                array_merge([
                    'tagline' => '',
                    'hero_image_id' => null,
                    'overview' => ['content' => '', 'highlights' => [], 'gallery' => []],
                    'banner' => [
                        'headline' => '',
                        'subheadline' => '',
                        'cta_label' => '',
                        'cta_url' => '',
                        'media_id' => null,
                    ],
                    'linked_trip_ids' => [],
                    'faqs' => [],
                    'best_time' => ['content' => '', 'recommended_months' => []],
                    'weather' => [],
                    'map' => ['embed_url' => '', 'latitude' => null, 'longitude' => null],
                    'seo' => [
                        'meta_title' => $data['name'].' | Backpackclan',
                        'meta_description' => 'Explore '.$data['name'].' with Backpackclan.',
                        'og_image_id' => null,
                        'canonical_url' => 'https://backpackclan.com/destinations/'.$data['slug'],
                        'robots' => 'index, follow',
                    ],
                    'is_featured' => false,
                ], $data)
            );
        }
    }
}
