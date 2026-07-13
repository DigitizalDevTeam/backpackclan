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
                'category_slugs' => ['motor-biking'],
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
                'overview_content' => 'Ride Manali to Srinagar via the world’s highest motorable passes with road captains, mechanic support, and oxygen on every departure.',
            ],
            [
                'destination_slug' => 'spiti',
                'category_slugs' => ['motor-biking', 'backpacking'],
                'title' => 'Spiti Valley Bike Circuit',
                'slug' => 'spiti-valley-bike-circuit',
                'trip_type' => 'bike',
                'duration_days' => 8,
                'duration_nights' => 7,
                'difficulty' => 'challenging',
                'max_group_size' => 12,
                'min_age' => 18,
                'summary' => 'Motorcycle circuit through Spiti — Key Monastery, Kaza, and Chandratal windows.',
                'cover_image_id' => '2',
                'pricing' => ['base_price' => 26999, 'sale_price' => 23999, 'show_strike_through' => true, 'currency' => 'INR', 'price_per' => 'person'],
                'is_featured' => true,
                'status' => 'published',
                'sort_order' => 1,
                'overview_content' => 'A raw high-altitude bike route with gradual acclimatization via the Kinnaur approach.',
            ],
            [
                'destination_slug' => 'tawang',
                'category_slugs' => ['motor-biking'],
                'title' => 'Tawang Motorcycle Expedition',
                'slug' => 'tawang-motorcycle-expedition',
                'trip_type' => 'bike',
                'duration_days' => 7,
                'duration_nights' => 6,
                'difficulty' => 'moderate',
                'max_group_size' => 14,
                'summary' => 'Northeast bike expedition across Sela Pass to Tawang Monastery.',
                'cover_image_id' => '5',
                'pricing' => ['base_price' => 22999, 'sale_price' => 19999, 'show_strike_through' => true, 'currency' => 'INR', 'price_per' => 'person'],
                'is_featured' => true,
                'status' => 'published',
                'sort_order' => 2,
                'overview_content' => 'Ride into Arunachal with ILP support, scenic high passes, and monastery stays.',
            ],
            [
                'destination_slug' => 'vietnam',
                'category_slugs' => ['motor-biking'],
                'title' => 'Vietnam Ha Giang Loop',
                'slug' => 'vietnam-ha-giang-loop',
                'trip_type' => 'bike',
                'duration_days' => 6,
                'duration_nights' => 5,
                'difficulty' => 'moderate',
                'max_group_size' => 12,
                'summary' => 'International motorcycle loop through northern Vietnam’s karst mountains.',
                'cover_image_id' => '5',
                'pricing' => ['base_price' => 39999, 'sale_price' => 35999, 'show_strike_through' => true, 'currency' => 'INR', 'price_per' => 'person'],
                'is_featured' => true,
                'status' => 'published',
                'sort_order' => 3,
                'overview_content' => 'Guided Ha Giang riding with local captains, stays, and support vehicle.',
            ],
            [
                'destination_slug' => 'thailand',
                'category_slugs' => ['motor-biking'],
                'title' => 'Thailand Mountain Bike Escape',
                'slug' => 'thailand-mountain-bike-escape',
                'trip_type' => 'bike',
                'duration_days' => 5,
                'duration_nights' => 4,
                'difficulty' => 'moderate',
                'max_group_size' => 12,
                'summary' => 'Chiang Mai mountain roads and countryside loops for intermediate riders.',
                'cover_image_id' => '3',
                'pricing' => ['base_price' => 34999, 'sale_price' => 31999, 'show_strike_through' => true, 'currency' => 'INR', 'price_per' => 'person'],
                'is_featured' => true,
                'status' => 'published',
                'sort_order' => 3,
                'overview_content' => 'An international bike week with local captains, scenic loops, and café culture.',
            ],
            [
                'destination_slug' => 'spiti',
                'category_slugs' => ['backpacking'],
                'title' => 'Spiti Slow Travel Backpacking',
                'slug' => 'spiti-slow-travel-backpacking',
                'trip_type' => 'mixed',
                'duration_days' => 9,
                'duration_nights' => 8,
                'difficulty' => 'moderate',
                'max_group_size' => 16,
                'summary' => 'Backpacking through Spiti with homestays, cafés, and flexible days.',
                'cover_image_id' => '2',
                'pricing' => ['base_price' => 18999, 'sale_price' => 16999, 'show_strike_through' => true, 'currency' => 'INR', 'price_per' => 'person'],
                'is_featured' => true,
                'status' => 'published',
                'sort_order' => 4,
                'overview_content' => 'A slower Spiti for storytellers — local stays, photography windows, and light walks.',
            ],
            [
                'destination_slug' => 'kerala',
                'category_slugs' => ['backpacking'],
                'title' => 'Kerala Backwaters & Hills',
                'slug' => 'kerala-backwaters-hills',
                'trip_type' => 'mixed',
                'duration_days' => 6,
                'duration_nights' => 5,
                'difficulty' => 'easy',
                'max_group_size' => 18,
                'summary' => 'Backpacking Kerala — Alleppey backwaters to Munnar tea hills.',
                'cover_image_id' => '2',
                'pricing' => ['base_price' => 14999, 'show_strike_through' => false, 'currency' => 'INR', 'price_per' => 'person'],
                'is_featured' => false,
                'status' => 'published',
                'sort_order' => 5,
                'overview_content' => 'Easy-paced domestic backpacking with houseboat night and hill-station days.',
            ],
            [
                'destination_slug' => 'thailand',
                'category_slugs' => ['backpacking'],
                'title' => 'Thailand Backpacking Trail',
                'slug' => 'thailand-backpacking-trail',
                'trip_type' => 'mixed',
                'duration_days' => 8,
                'duration_nights' => 7,
                'difficulty' => 'easy',
                'max_group_size' => 16,
                'summary' => 'Bangkok to islands backpacking with hostels, ferries, and free days.',
                'cover_image_id' => '3',
                'pricing' => ['base_price' => 32999, 'sale_price' => 29999, 'show_strike_through' => true, 'currency' => 'INR', 'price_per' => 'person'],
                'is_featured' => true,
                'status' => 'published',
                'sort_order' => 6,
                'overview_content' => 'A flexible international backpacking route designed for first-timers.',
            ],
            [
                'destination_slug' => 'bali',
                'category_slugs' => ['backpacking', 'custom-departures'],
                'title' => 'Bali Culture & Surf Escape',
                'slug' => 'bali-culture-surf-escape',
                'trip_type' => 'mixed',
                'duration_days' => 7,
                'duration_nights' => 6,
                'difficulty' => 'easy',
                'max_group_size' => 14,
                'summary' => 'Ubud temples, rice terraces, and beach towns — backpacking or private custom.',
                'cover_image_id' => '4',
                'pricing' => ['base_price' => 37999, 'sale_price' => 34999, 'show_strike_through' => true, 'currency' => 'INR', 'price_per' => 'person'],
                'is_featured' => true,
                'status' => 'published',
                'sort_order' => 7,
                'overview_content' => 'Choose group backpacking vibe or request a custom private departure.',
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
                'sort_order' => 8,
                'overview_content' => 'One of India’s most scenic summer treks with experienced Himalayan trek leaders.',
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
                'sort_order' => 9,
                'overview_content' => 'Fully supported EBC with acclimatization days, tea-house stays, and oxygen readiness.',
            ],
            [
                'destination_slug' => 'sikkim',
                'category_slugs' => ['treks'],
                'title' => 'Sikkim Goecha La Trek',
                'slug' => 'sikkim-goecha-la-trek',
                'trip_type' => 'trek',
                'duration_days' => 10,
                'duration_nights' => 9,
                'difficulty' => 'challenging',
                'max_group_size' => 12,
                'summary' => 'Kanchenjunga viewpoints on the iconic Goecha La trail.',
                'cover_image_id' => '7',
                'pricing' => ['base_price' => 24999, 'sale_price' => 21999, 'show_strike_through' => true, 'currency' => 'INR', 'price_per' => 'person'],
                'is_featured' => false,
                'status' => 'published',
                'sort_order' => 10,
                'overview_content' => 'Autumn and spring windows for clear Kanchenjunga views.',
            ],
            [
                'destination_slug' => 'andaman',
                'category_slugs' => ['custom-departures'],
                'title' => 'Andaman Private Island Escape',
                'slug' => 'andaman-private-island-escape',
                'trip_type' => 'custom',
                'duration_days' => 5,
                'duration_nights' => 4,
                'difficulty' => 'easy',
                'max_group_size' => 10,
                'summary' => 'Custom private departure across Havelock & Neil with snorkel options.',
                'cover_image_id' => '4',
                'pricing' => ['base_price' => 28999, 'show_strike_through' => false, 'currency' => 'INR', 'price_per' => 'person'],
                'is_featured' => false,
                'status' => 'published',
                'sort_order' => 11,
                'overview_content' => 'Built for families and private groups — dates, stays, and activities on request.',
            ],
            [
                'destination_slug' => 'kerala',
                'category_slugs' => ['custom-departures'],
                'title' => 'Kerala Custom Family Circuit',
                'slug' => 'kerala-custom-family-circuit',
                'trip_type' => 'custom',
                'duration_days' => 6,
                'duration_nights' => 5,
                'difficulty' => 'easy',
                'max_group_size' => 12,
                'summary' => 'Private Kerala itinerary for families — backwaters, hills, and soft adventure.',
                'cover_image_id' => '2',
                'pricing' => ['base_price' => 24999, 'show_strike_through' => false, 'currency' => 'INR', 'price_per' => 'person'],
                'is_featured' => false,
                'status' => 'published',
                'sort_order' => 12,
                'overview_content' => 'Enquire for your own dates — we craft hotels, transfers, and optional activities.',
            ],
            [
                'destination_slug' => 'bhutan',
                'category_slugs' => ['custom-departures', 'backpacking'],
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
                'is_featured' => true,
                'status' => 'published',
                'sort_order' => 13,
                'overview_content' => 'Licensed operator package with SDF, guides, and comfortable stays.',
            ],
            // Keep older Spiti road-trip slug for existing links, mapped to backpacking.
            [
                'destination_slug' => 'spiti',
                'category_slugs' => ['backpacking'],
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
                'sort_order' => 14,
                'overview_content' => 'Classic Spiti road trip with monasteries, high villages, and photography stops.',
            ],
        ];

        foreach ($trips as $row) {
            $categorySlugs = $row['category_slugs'];
            $destinationSlug = $row['destination_slug'];
            $overviewContent = $row['overview_content'] ?? $row['summary'];
            unset($row['category_slugs'], $row['destination_slug'], $row['overview_content']);

            $destinationId = $destinations->get($destinationSlug);
            if (! $destinationId) {
                continue;
            }

            $row['destination_id'] = $destinationId;
            $row['gallery'] = array_values(array_filter([
                $row['cover_image_id'] ?? null,
                '2',
                '7',
            ]));
            $row['overview'] = [
                'content' => $overviewContent,
                'highlights' => [
                    ['id' => 'h1', 'text' => 'Expert trip leaders & local partners'],
                    ['id' => 'h2', 'text' => 'Permits & logistics handled on group departures'],
                    ['id' => 'h3', 'text' => 'Small groups for a better experience'],
                ],
                'route_map_embed' => '',
                'route_map_image_id' => null,
            ];
            $row['itinerary'] = $row['itinerary'] ?? [];
            $row['inclusions'] = $row['inclusions'] ?? [
                ['id' => 'i1', 'text' => 'Accommodation on twin-sharing basis'],
                ['id' => 'i2', 'text' => 'Meals as per itinerary'],
                ['id' => 'i3', 'text' => 'Experienced trip leader'],
                ['id' => 'i4', 'text' => 'Permits & entry fees where applicable'],
            ];
            $row['exclusions'] = $row['exclusions'] ?? [
                ['id' => 'e1', 'text' => 'Flights / train tickets'],
                ['id' => 'e2', 'text' => 'Personal expenses & tips'],
                ['id' => 'e3', 'text' => 'Travel insurance'],
            ];
            $row['faqs'] = $row['faqs'] ?? [
                [
                    'id' => 'f1',
                    'question' => 'Is this trip suitable for beginners?',
                    'answer' => 'Difficulty is listed on the trip page. Reach out if you want a custom easier alternative.',
                ],
            ];
            $row['testimonials'] = $row['testimonials'] ?? [];
            $row['seo'] = [
                'meta_title' => $row['title'].' | Backpackclan',
                'meta_description' => $row['summary'],
                'og_image_id' => $row['cover_image_id'],
                'canonical_url' => 'https://backpackclan.com/trips/'.$row['slug'],
                'robots' => 'index, follow',
            ];
            $row['is_featured'] = $row['is_featured'] ?? false;
            $row['min_age'] = $row['min_age'] ?? null;

            $trip = Trip::query()->updateOrCreate(['slug' => $row['slug']], $row);

            $categoryIds = collect($categorySlugs)
                ->map(fn (string $slug) => $categories->get($slug))
                ->filter()
                ->values()
                ->all();

            $trip->categories()->sync($categoryIds);
        }

        // Link published trips back onto destinations for admin counts.
        foreach (Destination::query()->get() as $destination) {
            $ids = Trip::query()
                ->where('destination_id', $destination->id)
                ->where('status', 'published')
                ->pluck('id')
                ->map(fn ($id) => (string) $id)
                ->values()
                ->all();
            $destination->update(['linked_trip_ids' => $ids]);
        }
    }
}
