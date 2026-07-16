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
            ['pageKey' => 'privacy', 'label' => 'Privacy Policy', 'path' => '/privacy'],
            ['pageKey' => 'terms', 'label' => 'Terms & Conditions', 'path' => '/terms'],
            ['pageKey' => 'request_callback', 'label' => 'Request Callback', 'path' => '/request-callback'],
            ['pageKey' => 'inquire_custom_trip', 'label' => 'Custom Trip Inquiry', 'path' => '/inquire/custom-trip'],
            ['pageKey' => 'inquire_corporate', 'label' => 'Corporate Trips', 'path' => '/inquire/corporate'],
            ['pageKey' => 'partners_register', 'label' => 'Partner Registration', 'path' => '/partners/register'],
            ['pageKey' => 'careers_apply', 'label' => 'Careers', 'path' => '/careers/apply'],
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
            'privacy' => [
                'meta_title' => 'Privacy Policy — Backpackclan',
                'meta_description' => 'How Backpackclan collects, uses, and protects your personal information.',
                'og_image_id' => null,
                'canonical_url' => 'https://backpackclan.com/privacy',
                'robots' => 'index, follow',
                'schema_json' => '',
            ],
            'terms' => [
                'meta_title' => 'Terms & Conditions — Backpackclan',
                'meta_description' => 'Terms and conditions for booking trips and using Backpackclan services.',
                'og_image_id' => null,
                'canonical_url' => 'https://backpackclan.com/terms',
                'robots' => 'index, follow',
                'schema_json' => '',
            ],
            'request_callback' => [
                'meta_title' => 'Request a Callback — Backpackclan',
                'meta_description' => 'Request a phone callback from the Backpackclan travel team.',
                'og_image_id' => null,
                'canonical_url' => 'https://backpackclan.com/request-callback',
                'robots' => 'index, follow',
                'schema_json' => '',
            ],
            'inquire_custom_trip' => [
                'meta_title' => 'Plan a Custom Trip — Backpackclan',
                'meta_description' => 'Tell us your dates, group size, and destination — we will craft a private Himalayan itinerary.',
                'og_image_id' => null,
                'canonical_url' => 'https://backpackclan.com/inquire/custom-trip',
                'robots' => 'index, follow',
                'schema_json' => '',
            ],
            'inquire_corporate' => [
                'meta_title' => 'Corporate & Team Offsites — Backpackclan',
                'meta_description' => 'Curated corporate retreats, team offsites, and incentive trips across India and the Himalayas.',
                'og_image_id' => null,
                'canonical_url' => 'https://backpackclan.com/inquire/corporate',
                'robots' => 'index, follow',
                'schema_json' => '',
            ],
            'partners_register' => [
                'meta_title' => 'Partner With Backpackclan',
                'meta_description' => 'Register as a travel partner, influencer, or affiliate with Backpackclan.',
                'og_image_id' => null,
                'canonical_url' => 'https://backpackclan.com/partners/register',
                'robots' => 'index, follow',
                'schema_json' => '',
            ],
            'careers_apply' => [
                'meta_title' => 'Careers at Backpackclan',
                'meta_description' => 'Join the Backpackclan team — operations, content, sales, and on-ground trip leaders.',
                'og_image_id' => null,
                'canonical_url' => 'https://backpackclan.com/careers/apply',
                'robots' => 'index, follow',
                'schema_json' => '',
            ],
        ];
    }
}
