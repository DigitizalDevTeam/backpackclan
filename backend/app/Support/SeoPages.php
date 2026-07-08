<?php

namespace App\Support;

class SeoPages
{
    /**
     * @return list<array{pageKey: string, label: string, path: string, isPlaceholder?: bool}>
     */
    public static function definitions(): array
    {
        return [
            ['pageKey' => 'homepage', 'label' => 'Homepage', 'path' => '/'],
            ['pageKey' => 'about', 'label' => 'About Us', 'path' => '/about'],
            ['pageKey' => 'contact', 'label' => 'Contact', 'path' => '/contact'],
            ['pageKey' => 'blog', 'label' => 'Blog Index', 'path' => '/blog'],
            ['pageKey' => 'trips', 'label' => 'Trip Listing', 'path' => '/trips'],
            ['pageKey' => 'destinations', 'label' => 'Destinations', 'path' => '/destinations'],
        ];
    }

  /**
     * @return array<string, mixed>|null
     */
    public static function find(string $pageKey): ?array
    {
        foreach (self::definitions() as $page) {
            if ($page['pageKey'] === $pageKey) {
                return $page;
            }
        }

        return null;
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    public static function defaults(): array
    {
        return [
            'homepage' => [
                'meta_title' => 'Backpackclan — Adventure Tours in Ladakh, Spiti & Himalayas',
                'meta_description' => 'Book curated bike tours, treks, and group trips across Leh Ladakh, Spiti, Kashmir, Bhutan & Nepal. Guaranteed departures & expert guides.',
                'og_image_id' => '1',
                'canonical_url' => 'https://backpackclan.com/',
                'robots' => 'index, follow',
                'schema_json' => json_encode([
                    '@context' => 'https://schema.org',
                    '@type' => 'TravelAgency',
                    'name' => 'Backpackclan',
                    'url' => 'https://backpackclan.com',
                    'description' => 'Adventure travel tours across the Himalayas',
                ], JSON_PRETTY_PRINT),
            ],
            'about' => [
                'meta_title' => 'About Backpackclan — Your Himalayan Adventure Partner',
                'meta_description' => 'Learn about Backpackclan, our story, expert guides, and why thousands of travelers trust us for unforgettable Himalayan adventures.',
                'og_image_id' => '2',
                'canonical_url' => 'https://backpackclan.com/about',
                'robots' => 'index, follow',
                'schema_json' => '',
            ],
            'contact' => [
                'meta_title' => 'Contact Backpackclan — Plan Your Next Adventure',
                'meta_description' => 'Get in touch with Backpackclan for trip inquiries, custom tours, corporate bookings, and travel support.',
                'og_image_id' => null,
                'canonical_url' => 'https://backpackclan.com/contact',
                'robots' => 'index, follow',
                'schema_json' => '',
            ],
            'blog' => [
                'meta_title' => 'Travel Blog — Tips, Guides & Stories | Backpackclan',
                'meta_description' => 'Read travel guides, destination tips, and adventure stories from the Backpackclan team.',
                'og_image_id' => '5',
                'canonical_url' => 'https://backpackclan.com/blog',
                'robots' => 'index, follow',
                'schema_json' => '',
            ],
            'trips' => [
                'meta_title' => 'All Trips — Bike Tours, Treks & Group Adventures | Backpackclan',
                'meta_description' => 'Browse all Backpackclan trips. Filter by destination, budget, duration, and departure date.',
                'og_image_id' => '1',
                'canonical_url' => 'https://backpackclan.com/trips',
                'robots' => 'index, follow',
                'schema_json' => '',
            ],
            'destinations' => [
                'meta_title' => 'Destinations — Ladakh, Spiti, Kashmir & More | Backpackclan',
                'meta_description' => 'Explore Backpackclan destinations including Leh Ladakh, Spiti Valley, Kashmir, Bhutan, and Nepal.',
                'og_image_id' => '3',
                'canonical_url' => 'https://backpackclan.com/destinations',
                'robots' => 'index, follow',
                'schema_json' => '',
            ],
        ];
    }
}
