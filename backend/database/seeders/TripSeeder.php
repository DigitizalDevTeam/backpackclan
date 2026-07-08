<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Destination;
use App\Models\Trip;
use Illuminate\Database\Seeder;

class TripSeeder extends Seeder
{
    public function run(): void
    {
        $destinations = Destination::query()->pluck('id', 'slug');
        $categories = Category::query()->pluck('id', 'slug');

        $trips = [
            [
                'destination_slug' => 'leh-ladakh',
                'category_slugs' => ['bike-tours'],
                'title' => '11 Days Ladakh Bike Expedition',
                'slug' => 'leh-ladakh-bike-expedition',
                'trip_type' => 'bike',
                'duration_days' => 11,
                'duration_nights' => 10,
                'difficulty' => 'challenging',
                'max_group_size' => 12,
                'min_age' => 18,
                'summary' => 'Epic motorcycle journey across Khardung La, Nubra Valley, and Pangong Lake.',
                'cover_image_id' => '1',
                'pricing' => ['base_price' => 29999, 'sale_price' => 24999, 'show_strike_through' => true, 'currency' => 'INR', 'price_per' => 'person'],
                'is_featured' => true,
                'status' => 'published',
                'sort_order' => 0,
            ],
            [
                'destination_slug' => 'spiti',
                'category_slugs' => ['group-tours'],
                'title' => 'Spiti Valley Circuit',
                'slug' => 'spiti-valley-road-trip',
                'trip_type' => 'road_trip',
                'duration_days' => 7,
                'duration_nights' => 6,
                'difficulty' => 'moderate',
                'max_group_size' => 18,
                'summary' => '7-day road trip through Spiti Valley.',
                'cover_image_id' => '2',
                'pricing' => ['base_price' => 21999, 'sale_price' => 18999, 'show_strike_through' => true, 'currency' => 'INR', 'price_per' => 'person'],
                'is_featured' => true,
                'status' => 'published',
                'sort_order' => 1,
            ],
            [
                'destination_slug' => 'kashmir',
                'category_slugs' => ['treks'],
                'title' => 'Kashmir Great Lakes Trek',
                'slug' => 'kashmir-great-lakes-trek',
                'trip_type' => 'trek',
                'duration_days' => 7,
                'duration_nights' => 6,
                'difficulty' => 'challenging',
                'max_group_size' => 12,
                'summary' => 'Alpine trek through Kashmir high-altitude lakes.',
                'cover_image_id' => '3',
                'pricing' => ['base_price' => 15999, 'show_strike_through' => false, 'currency' => 'INR', 'price_per' => 'person'],
                'is_featured' => true,
                'status' => 'published',
                'sort_order' => 2,
            ],
            [
                'destination_slug' => 'bhutan',
                'category_slugs' => ['group-tours'],
                'title' => 'Bhutan Cultural Trail',
                'slug' => 'bhutan-cultural-trail',
                'trip_type' => 'mixed',
                'duration_days' => 6,
                'duration_nights' => 5,
                'difficulty' => 'easy',
                'max_group_size' => 16,
                'summary' => 'Cultural tour through Bhutan dzongs and monasteries.',
                'cover_image_id' => '4',
                'pricing' => ['base_price' => 35999, 'sale_price' => 32999, 'show_strike_through' => true, 'currency' => 'INR', 'price_per' => 'person'],
                'status' => 'published',
                'sort_order' => 3,
            ],
            [
                'destination_slug' => 'nepal',
                'category_slugs' => ['treks'],
                'title' => 'Everest Base Camp Trek',
                'slug' => 'everest-base-camp-trek',
                'trip_type' => 'trek',
                'duration_days' => 12,
                'duration_nights' => 11,
                'difficulty' => 'expert',
                'max_group_size' => 10,
                'min_age' => 18,
                'summary' => 'Classic EBC trek to the base of Everest.',
                'cover_image_id' => '5',
                'pricing' => ['base_price' => 49999, 'sale_price' => 45999, 'show_strike_through' => true, 'currency' => 'INR', 'price_per' => 'person'],
                'is_featured' => true,
                'status' => 'published',
                'sort_order' => 4,
            ],
        ];

        foreach ($trips as $row) {
            $categorySlugs = $row['category_slugs'];
            $destinationSlug = $row['destination_slug'];
            unset($row['category_slugs'], $row['destination_slug']);

            $destinationId = $destinations->get($destinationSlug);
            if (! $destinationId) {
                continue;
            }

            $row['destination_id'] = $destinationId;
            $row['gallery'] = [];
            $row['overview'] = ['content' => '', 'highlights' => [], 'route_map_embed' => '', 'route_map_image_id' => null];
            $row['itinerary'] = [];
            $row['inclusions'] = [];
            $row['exclusions'] = [];
            $row['faqs'] = [];
            $row['testimonials'] = [];
            $row['seo'] = [
                'meta_title' => $row['title'].' | Backpackclan',
                'meta_description' => $row['summary'],
                'og_image_id' => $row['cover_image_id'],
                'canonical_url' => 'https://backpackclan.com/trips/'.$row['slug'],
                'robots' => 'index, follow',
            ];

            $trip = Trip::query()->updateOrCreate(['slug' => $row['slug']], $row);

            $categoryIds = collect($categorySlugs)
                ->map(fn (string $slug) => $categories->get($slug))
                ->filter()
                ->values()
                ->all();

            $trip->categories()->sync($categoryIds);
        }
    }
}
