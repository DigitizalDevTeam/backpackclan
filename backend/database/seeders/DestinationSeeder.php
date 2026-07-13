<?php

namespace Database\Seeders;

use App\Models\Destination;
use Illuminate\Database\Seeder;

class DestinationSeeder extends Seeder
{
    public function run(): void
    {
        $destinations = [
            $this->dest('Leh Ladakh', 'leh-ladakh', 'India', 'Ladakh', 'Land of high passes, turquoise lakes, and epic bike routes', '1', true, 0, [6, 7, 8, 9], [
                'Khardung La & high-altitude passes',
                'Pangong & Nubra Valley circuits',
                'Royal Enfield motorcycle expeditions',
            ]),
            $this->dest('Spiti Valley', 'spiti', 'India', 'Himachal Pradesh', 'The middle land — raw landscapes and ancient monasteries', '2', true, 1, [6, 7, 8, 9], [
                'Key Monastery & Chandratal',
                'Shimla–Kinnaur approach for safer acclimatization',
                'Ideal for bike tours and backpacking',
            ]),
            $this->dest('Kashmir', 'kashmir', 'India', 'Jammu & Kashmir', 'Paradise on earth — lakes, meadows, and alpine treks', '3', true, 2, [4, 5, 6, 7, 8, 9], [
                'Dal Lake & Gulmarg day trips',
                'Kashmir Great Lakes trek',
                'Houseboat stays in Srinagar',
            ]),
            $this->dest('Bhutan', 'bhutan', 'Bhutan', 'Western Bhutan', 'The last Shangri-La — dzongs, trails, and Gross National Happiness', '4', true, 3, [3, 4, 5, 9, 10, 11], [
                "Tiger's Nest (Paro Taktsang)",
                'Punakha Dzong & Thimphu highlights',
                'Licensed operator packages with SDF included',
            ]),
            $this->dest('Nepal', 'nepal', 'Nepal', 'Himalayas', 'Everest, Annapurna, and world-class trekking', '5', true, 4, [3, 4, 5, 9, 10, 11], [
                'Everest Base Camp & Annapurna options',
                'Kathmandu valley culture',
                'Expert high-altitude support teams',
            ]),
            $this->dest('Tawang', 'tawang', 'India', 'Arunachal Pradesh', 'Monasteries, high passes, and Northeast road trips', '5', true, 5, [5, 6, 7, 8, 9], [
                'Sela Pass & Tawang Monastery',
                'Great for bike expeditions',
                'Inner Line Permit handled on group trips',
            ]),
            $this->dest('Kerala', 'kerala', 'India', 'South India', 'Backwaters, tea hills, and slow backpacking vibes', '2', true, 6, [10, 11, 12, 1, 2], [
                'Alleppey houseboats',
                'Munnar tea estates',
                'Perfect for custom & backpacking trips',
            ]),
            $this->dest('Andaman', 'andaman', 'India', 'Bay of Islands', 'Turquoise waters, reefs, and island escapes', '4', true, 7, [11, 12, 1, 2, 3], [
                'Havelock & Neil Island',
                'Scuba & snorkel add-ons',
                'Ideal for custom private groups',
            ]),
            $this->dest('Vietnam', 'vietnam', 'Vietnam', 'Southeast Asia', 'Ha Giang loop, coastal roads, and café culture', '5', true, 8, [2, 3, 4, 9, 10, 11], [
                'Ha Giang motorcycle loop',
                'Hanoi to Ho Chi Minh options',
                'Street food & local stays',
            ]),
            $this->dest('Thailand', 'thailand', 'Thailand', 'Southeast Asia', 'Islands, jungles, and easy backpacking hubs', '3', true, 9, [11, 12, 1, 2, 3], [
                'Chiang Mai & islands',
                'Flexible backpacking routes',
                'Great for first-time international trips',
            ]),
            $this->dest('Bali', 'bali', 'Indonesia', 'Southeast Asia', 'Temples, surf towns, and custom honeymoon escapes', '4', true, 10, [4, 5, 6, 7, 8, 9], [
                'Ubud culture & rice terraces',
                'Beach + adventure mix',
                'Popular for custom departures',
            ]),
            $this->dest('Sikkim', 'sikkim', 'India', 'Northeast India', 'Monasteries and Kanchenjunga views', '7', true, 11, [3, 4, 5, 10, 11], [
                'Gangtok & Pelling',
                'North Sikkim high-altitude lakes',
                'Permit-supported group tours',
            ]),
            $this->dest('Meghalaya', 'meghalaya', 'India', 'Northeast India', 'Living root bridges and cloud forests', '2', true, 12, [9, 10, 11], [
                'Living root bridges of Nongriat',
                'Cherrapunji & Dawki river',
                'Backpacking-friendly circuits',
            ]),
        ];

        foreach ($destinations as $data) {
            Destination::query()->updateOrCreate(
                ['slug' => $data['slug']],
                $data
            );
        }
    }

    /**
     * @param  list<string>  $highlights
     * @param  list<int>  $months
     * @return array<string, mixed>
     */
    private function dest(
        string $name,
        string $slug,
        string $country,
        string $region,
        string $tagline,
        string $heroImageId,
        bool $featured,
        int $sortOrder,
        array $months,
        array $highlights
    ): array {
        $gallery = array_values(array_unique(array_filter([
            $heroImageId,
            '2',
            '7',
        ])));

        return [
            'name' => $name,
            'slug' => $slug,
            'country' => $country,
            'region' => $region,
            'tagline' => $tagline,
            'hero_image_id' => $heroImageId,
            'is_featured' => $featured,
            'sort_order' => $sortOrder,
            'status' => 'published',
            'overview' => [
                'content' => "<p>{$name} is one of Backpackclan's signature adventure hubs. {$tagline}.</p><p>Our local partners, permit support, and small-group departures make it easy to explore safely — whether you are riding, trekking, or backpacking.</p>",
                'highlights' => collect($highlights)->values()->map(fn (string $text, int $i) => [
                    'id' => 'h'.($i + 1),
                    'icon' => 'MapPin',
                    'text' => $text,
                ])->all(),
                'gallery' => $gallery,
            ],
            'banner' => [
                'headline' => "Explore {$name}",
                'subheadline' => $tagline,
                'cta_label' => "View {$name} Trips",
                'cta_url' => '/trips?destination='.$slug,
                'media_id' => $heroImageId,
            ],
            'linked_trip_ids' => [],
            'faqs' => [
                [
                    'id' => 'f1',
                    'question' => "When is the best time to visit {$name}?",
                    'answer' => 'See the recommended months on this page. We also publish seasonal departure calendars on each trip.',
                ],
                [
                    'id' => 'f2',
                    'question' => 'Do you handle permits and logistics?',
                    'answer' => 'Yes — on group departures we manage permits, stays, and local transport so you can focus on the experience.',
                ],
            ],
            'best_time' => [
                'content' => "<p>Recommended months for {$name} trips with Backpackclan.</p>",
                'recommended_months' => $months,
            ],
            'weather' => [],
            'map' => ['embed_url' => '', 'latitude' => null, 'longitude' => null],
            'seo' => [
                'meta_title' => "{$name} Tours & Trips | Backpackclan",
                'meta_description' => "Plan your {$name} adventure with Backpackclan — curated trips, expert guides, and fixed departures.",
                'og_image_id' => $heroImageId,
                'canonical_url' => 'https://backpackclan.com/destinations/'.$slug,
                'robots' => 'index, follow',
            ],
        ];
    }
}
