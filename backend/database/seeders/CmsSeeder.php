<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\Banner;
use App\Models\HomepageSection;
use App\Models\Media;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\SeoMeta;
use App\Support\SeoPages;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CmsSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedMedia();
        $this->seedBanners();
        $this->seedSeo();
        $this->seedMenus();
        $this->seedHomepage();
        $this->seedActivity();
    }

    private function seedMedia(): void
    {
        $items = [
            ['uuid' => 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'filename' => 'ladakh-hero.jpg', 'url' => 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80', 'mime_type' => 'image/jpeg', 'media_type' => 'image', 'size' => 312000, 'alt_text' => 'Scenic mountain road in Ladakh', 'title' => 'Ladakh Hero Banner'],
            ['uuid' => 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'filename' => 'spiti-valley.jpg', 'url' => 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', 'mime_type' => 'image/jpeg', 'media_type' => 'image', 'size' => 287000, 'alt_text' => 'Spiti Valley snow-capped peaks', 'title' => 'Spiti Valley'],
            ['uuid' => 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'filename' => 'kashmir-dal-lake.jpg', 'url' => 'https://images.unsplash.com/photo-1593693397690-362cb1aeb21d?w=800&q=80', 'mime_type' => 'image/jpeg', 'media_type' => 'image', 'size' => 265000, 'alt_text' => 'Shikara boats on Dal Lake, Kashmir', 'title' => 'Kashmir Dal Lake'],
            ['uuid' => 'd4e5f6a7-b8c9-0123-def0-234567890123', 'filename' => 'bhutan-monastery.jpg', 'url' => 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80', 'mime_type' => 'image/jpeg', 'media_type' => 'image', 'size' => 298000, 'alt_text' => "Tiger's Nest monastery in Bhutan", 'title' => 'Bhutan Monastery'],
            ['uuid' => 'e5f6a7b8-c9d0-1234-ef01-345678901234', 'filename' => 'nepal-everest.jpg', 'url' => 'https://images.unsplash.com/photo-1544735716-392fe8d79f04?w=800&q=80', 'mime_type' => 'image/jpeg', 'media_type' => 'image', 'size' => 341000, 'alt_text' => 'Mount Everest view from Nepal', 'title' => 'Nepal Everest'],
            ['uuid' => 'f6a7b8c9-d0e1-2345-f012-456789012345', 'filename' => 'bike-tour-promo.mp4', 'url' => 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'mime_type' => 'video/mp4', 'media_type' => 'video', 'size' => 2500000, 'alt_text' => 'Motorcycle tour promotional video', 'title' => 'Bike Tour Promo'],
            ['uuid' => 'a7b8c9d0-e1f2-3456-0123-567890123456', 'filename' => 'trek-group.jpg', 'url' => 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80', 'mime_type' => 'image/jpeg', 'media_type' => 'image', 'size' => 276000, 'alt_text' => 'Group trekking in the Himalayas', 'title' => 'Trek Group Photo'],
            ['uuid' => 'b8c9d0e1-f2a3-4567-1234-678901234567', 'filename' => 'travel-brochure.pdf', 'url' => '/media/sample-brochure.pdf', 'mime_type' => 'application/pdf', 'media_type' => 'document', 'size' => 156000, 'alt_text' => 'Backpackclan travel brochure', 'title' => 'Travel Brochure 2026'],
        ];

        foreach ($items as $item) {
            Media::query()->updateOrCreate(['uuid' => $item['uuid']], array_merge($item, ['uploaded_by' => 1]));
        }
    }

    private function seedBanners(): void
    {
        $banners = [
            ['title' => 'Summer Ladakh Campaign', 'placement' => 'homepage_hero', 'media_type' => 'image', 'media_id' => '1', 'headline' => 'Conquer the Himalayas', 'subheadline' => 'Epic bike tours & treks across Ladakh, Spiti & beyond', 'link_url' => '/trips', 'cta_buttons' => [['id' => 'cta1', 'label' => 'Explore Trips', 'url' => '/trips', 'style' => 'primary'], ['id' => 'cta2', 'label' => 'Custom Trip', 'url' => '/contact', 'style' => 'outline']], 'starts_at' => '2026-04-01', 'ends_at' => '2026-09-30', 'sort_order' => 0, 'is_active' => true],
            ['title' => 'Spiti Valley Promo', 'placement' => 'homepage_secondary', 'media_type' => 'image', 'media_id' => '2', 'headline' => 'Spiti Valley Awaits', 'subheadline' => '7-day road trip through the middle land', 'link_url' => '/destinations/spiti', 'cta_buttons' => [['id' => 'cta3', 'label' => 'View Packages', 'url' => '/destinations/spiti', 'style' => 'primary']], 'starts_at' => null, 'ends_at' => null, 'sort_order' => 1, 'is_active' => true],
            ['title' => 'Bike Tour Video Hero', 'placement' => 'homepage_hero', 'media_type' => 'video', 'media_id' => '6', 'headline' => 'Ride the Roof of the World', 'subheadline' => 'Experience the thrill of Himalayan motorcycle tours', 'link_url' => '/trips?type=bike', 'cta_buttons' => [['id' => 'cta4', 'label' => 'Watch & Book', 'url' => '/trips?type=bike', 'style' => 'primary']], 'starts_at' => null, 'ends_at' => null, 'sort_order' => 2, 'is_active' => false],
            ['title' => 'Kashmir Destination Banner', 'placement' => 'destination_page', 'media_type' => 'image', 'media_id' => '3', 'headline' => 'Paradise on Earth', 'subheadline' => 'Discover Kashmir with Backpackclan', 'link_url' => '/destinations/kashmir', 'cta_buttons' => [['id' => 'cta5', 'label' => 'Explore Kashmir', 'url' => '/destinations/kashmir', 'style' => 'secondary']], 'starts_at' => '2026-05-01', 'ends_at' => '2026-10-31', 'sort_order' => 0, 'is_active' => true],
        ];

        foreach ($banners as $banner) {
            Banner::query()->updateOrCreate(['title' => $banner['title']], $banner);
        }
    }

    private function seedSeo(): void
    {
        foreach (SeoPages::definitions() as $page) {
            $defaults = SeoPages::defaults()[$page['pageKey']] ?? [];
            SeoMeta::query()->updateOrCreate(
                ['page_key' => $page['pageKey']],
                $defaults
            );
        }
    }

    private function seedMenus(): void
    {
        $header = Menu::query()->updateOrCreate(['slug' => 'header'], ['name' => 'Header Menu', 'location' => 'header']);
        $footer = Menu::query()->updateOrCreate(['slug' => 'footer'], ['name' => 'Footer Menu', 'location' => 'footer']);
        $mobile = Menu::query()->updateOrCreate(['slug' => 'mobile'], ['name' => 'Mobile Menu', 'location' => 'mobile']);

        MenuItem::query()->whereIn('menu_id', [$header->id, $footer->id, $mobile->id])->delete();

        $destinations = MenuItem::query()->create(['menu_id' => $header->id, 'label' => 'Destinations', 'url' => '/destinations', 'target' => '_self', 'icon' => 'MapPin', 'sort_order' => 1, 'is_active' => true]);

        $headerItems = [
            ['label' => 'Home', 'url' => '/', 'icon' => 'Home', 'sort_order' => 0],
            ['label' => 'Trips', 'url' => '/trips', 'icon' => 'Compass', 'sort_order' => 2],
            ['label' => 'Blog', 'url' => '/blog', 'icon' => 'BookOpen', 'sort_order' => 3],
            ['label' => 'About', 'url' => '/about', 'icon' => 'Info', 'sort_order' => 4],
            ['label' => 'Contact', 'url' => '/contact', 'icon' => 'Phone', 'sort_order' => 5],
        ];
        foreach ($headerItems as $item) {
            MenuItem::query()->create(array_merge($item, ['menu_id' => $header->id, 'target' => '_self', 'is_active' => true]));
        }

        foreach (['Leh Ladakh', 'Spiti Valley', 'Kashmir', 'Bhutan', 'Nepal'] as $i => $name) {
            MenuItem::query()->create([
                'menu_id' => $header->id,
                'parent_id' => $destinations->id,
                'label' => $name,
                'url' => '/destinations/'.Str::slug($name),
                'target' => '_self',
                'sort_order' => $i,
                'is_active' => true,
            ]);
        }

        $footerLabels = ['About Us', 'All Trips', 'Blog', 'Contact', 'Privacy Policy', 'Terms & Conditions'];
        foreach ($footerLabels as $i => $label) {
            MenuItem::query()->create([
                'menu_id' => $footer->id,
                'label' => $label,
                'url' => '/'.Str::slug($label),
                'target' => '_self',
                'sort_order' => $i,
                'is_active' => true,
            ]);
        }

        foreach (['Home', 'Destinations', 'Trips', 'Contact'] as $i => $label) {
            MenuItem::query()->create([
                'menu_id' => $mobile->id,
                'label' => $label,
                'url' => $label === 'Home' ? '/' : '/'.Str::slug($label),
                'target' => '_self',
                'icon' => $label === 'Contact' ? 'Phone' : ($label === 'Destinations' ? 'MapPin' : ($label === 'Trips' ? 'Compass' : 'Home')),
                'sort_order' => $i,
                'is_active' => true,
            ]);
        }
    }

    private function seedHomepage(): void
    {
        $sections = json_decode(file_get_contents(database_path('seeders/data/homepage_sections.json')), true);

        foreach ($sections as $section) {
            HomepageSection::query()->updateOrCreate(
                ['slug' => $section['slug']],
                [
                    'title' => $section['title'],
                    'type' => $section['type'],
                    'sort_order' => $section['sort_order'],
                    'is_enabled' => $section['is_enabled'],
                    'content' => $section['content'],
                ]
            );
        }
    }

    private function seedActivity(): void
    {
        $logs = [
            ['action' => 'Homepage hero section updated', 'module' => 'homepage'],
            ['action' => 'New banner added for summer campaign', 'module' => 'banners'],
            ['action' => 'Header menu reordered', 'module' => 'menus'],
            ['action' => 'SEO meta updated for homepage', 'module' => 'seo'],
            ['action' => 'Ladakh hero image uploaded', 'module' => 'media'],
            ['action' => 'Global settings — branding updated', 'module' => 'settings'],
        ];

        foreach ($logs as $log) {
            ActivityLog::query()->firstOrCreate($log);
        }
    }
}
