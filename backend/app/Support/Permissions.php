<?php

namespace App\Support;

final class Permissions
{
    // Users & roles
    public const USERS_VIEW = 'users.view';
    public const USERS_CREATE = 'users.create';
    public const USERS_UPDATE = 'users.update';
    public const USERS_DELETE = 'users.delete';
    public const ROLES_VIEW = 'roles.view';
    public const ROLES_CREATE = 'roles.create';
    public const ROLES_UPDATE = 'roles.update';
    public const ROLES_DELETE = 'roles.delete';

    // Content modules
    public const MEDIA_VIEW = 'media.view';
    public const MEDIA_UPLOAD = 'media.upload';
    public const MEDIA_UPDATE = 'media.update';
    public const MEDIA_DELETE = 'media.delete';
    public const SEO_VIEW = 'seo.view';
    public const SEO_UPDATE = 'seo.update';
    public const MENUS_VIEW = 'menus.view';
    public const MENUS_UPDATE = 'menus.update';
    public const BANNERS_VIEW = 'banners.view';
    public const BANNERS_CREATE = 'banners.create';
    public const BANNERS_UPDATE = 'banners.update';
    public const BANNERS_DELETE = 'banners.delete';
    public const HOMEPAGE_VIEW = 'homepage.view';
    public const HOMEPAGE_UPDATE = 'homepage.update';
    public const SETTINGS_VIEW = 'settings.view';
    public const SETTINGS_UPDATE = 'settings.update';

    // Travel modules (Milestone 2)
    public const CATEGORIES_VIEW = 'categories.view';
    public const CATEGORIES_CREATE = 'categories.create';
    public const CATEGORIES_UPDATE = 'categories.update';
    public const CATEGORIES_DELETE = 'categories.delete';
    public const DESTINATIONS_VIEW = 'destinations.view';
    public const DESTINATIONS_CREATE = 'destinations.create';
    public const DESTINATIONS_UPDATE = 'destinations.update';
    public const DESTINATIONS_DELETE = 'destinations.delete';
    public const TRIPS_VIEW = 'trips.view';
    public const TRIPS_CREATE = 'trips.create';
    public const TRIPS_UPDATE = 'trips.update';
    public const TRIPS_DELETE = 'trips.delete';
    public const DEPARTURES_VIEW = 'departures.view';
    public const DEPARTURES_CREATE = 'departures.create';
    public const DEPARTURES_UPDATE = 'departures.update';
    public const DEPARTURES_DELETE = 'departures.delete';
    public const BOOKINGS_VIEW = 'bookings.view';
    public const BOOKINGS_CREATE = 'bookings.create';
    public const BOOKINGS_UPDATE = 'bookings.update';
    public const BOOKINGS_DELETE = 'bookings.delete';
    public const PRICING_VIEW = 'pricing.view';
    public const PRICING_UPDATE = 'pricing.update';
    public const COUPONS_VIEW = 'coupons.view';
    public const COUPONS_CREATE = 'coupons.create';
    public const COUPONS_UPDATE = 'coupons.update';
    public const COUPONS_DELETE = 'coupons.delete';
    public const LEADS_VIEW = 'leads.view';
    public const LEADS_CREATE = 'leads.create';
    public const LEADS_UPDATE = 'leads.update';
    public const LEADS_DELETE = 'leads.delete';
    public const BLOGS_VIEW = 'blogs.view';
    public const BLOGS_CREATE = 'blogs.create';
    public const BLOGS_UPDATE = 'blogs.update';
    public const BLOGS_DELETE = 'blogs.delete';

    /**
     * @return array<string, array{slug: string, name: string, group: string, description: string}>
     */
    public static function definitions(): array
    {
        return [
            self::USERS_VIEW => [
                'slug' => self::USERS_VIEW,
                'name' => 'View Users',
                'group' => 'users',
                'description' => 'View admin user list and profiles',
            ],
            self::USERS_CREATE => [
                'slug' => self::USERS_CREATE,
                'name' => 'Create Users',
                'group' => 'users',
                'description' => 'Create new admin users',
            ],
            self::USERS_UPDATE => [
                'slug' => self::USERS_UPDATE,
                'name' => 'Update Users',
                'group' => 'users',
                'description' => 'Edit admin users and change passwords',
            ],
            self::USERS_DELETE => [
                'slug' => self::USERS_DELETE,
                'name' => 'Delete Users',
                'group' => 'users',
                'description' => 'Remove admin users',
            ],
            self::ROLES_VIEW => [
                'slug' => self::ROLES_VIEW,
                'name' => 'View Roles',
                'group' => 'roles',
                'description' => 'View roles and their permissions',
            ],
            self::ROLES_CREATE => [
                'slug' => self::ROLES_CREATE,
                'name' => 'Create Roles',
                'group' => 'roles',
                'description' => 'Create custom admin roles',
            ],
            self::ROLES_UPDATE => [
                'slug' => self::ROLES_UPDATE,
                'name' => 'Update Roles',
                'group' => 'roles',
                'description' => 'Edit roles and assign permissions',
            ],
            self::ROLES_DELETE => [
                'slug' => self::ROLES_DELETE,
                'name' => 'Delete Roles',
                'group' => 'roles',
                'description' => 'Delete custom roles',
            ],
            self::MEDIA_VIEW => [
                'slug' => self::MEDIA_VIEW,
                'name' => 'View Media',
                'group' => 'media',
                'description' => 'Browse media library',
            ],
            self::MEDIA_UPLOAD => [
                'slug' => self::MEDIA_UPLOAD,
                'name' => 'Upload Media',
                'group' => 'media',
                'description' => 'Upload files to media library',
            ],
            self::MEDIA_UPDATE => [
                'slug' => self::MEDIA_UPDATE,
                'name' => 'Update Media',
                'group' => 'media',
                'description' => 'Edit media metadata',
            ],
            self::MEDIA_DELETE => [
                'slug' => self::MEDIA_DELETE,
                'name' => 'Delete Media',
                'group' => 'media',
                'description' => 'Delete media files',
            ],
            self::SEO_VIEW => [
                'slug' => self::SEO_VIEW,
                'name' => 'View SEO',
                'group' => 'seo',
                'description' => 'View SEO settings per page',
            ],
            self::SEO_UPDATE => [
                'slug' => self::SEO_UPDATE,
                'name' => 'Update SEO',
                'group' => 'seo',
                'description' => 'Edit SEO meta and OG settings',
            ],
            self::MENUS_VIEW => [
                'slug' => self::MENUS_VIEW,
                'name' => 'View Menus',
                'group' => 'menus',
                'description' => 'View navigation menus',
            ],
            self::MENUS_UPDATE => [
                'slug' => self::MENUS_UPDATE,
                'name' => 'Update Menus',
                'group' => 'menus',
                'description' => 'Edit menu structure and items',
            ],
            self::BANNERS_VIEW => [
                'slug' => self::BANNERS_VIEW,
                'name' => 'View Banners',
                'group' => 'banners',
                'description' => 'View promotional banners',
            ],
            self::BANNERS_CREATE => [
                'slug' => self::BANNERS_CREATE,
                'name' => 'Create Banners',
                'group' => 'banners',
                'description' => 'Create new banners',
            ],
            self::BANNERS_UPDATE => [
                'slug' => self::BANNERS_UPDATE,
                'name' => 'Update Banners',
                'group' => 'banners',
                'description' => 'Edit banners and toggle status',
            ],
            self::BANNERS_DELETE => [
                'slug' => self::BANNERS_DELETE,
                'name' => 'Delete Banners',
                'group' => 'banners',
                'description' => 'Delete banners',
            ],
            self::HOMEPAGE_VIEW => [
                'slug' => self::HOMEPAGE_VIEW,
                'name' => 'View Homepage',
                'group' => 'homepage',
                'description' => 'View homepage sections',
            ],
            self::HOMEPAGE_UPDATE => [
                'slug' => self::HOMEPAGE_UPDATE,
                'name' => 'Update Homepage',
                'group' => 'homepage',
                'description' => 'Edit and reorder homepage sections',
            ],
            self::SETTINGS_VIEW => [
                'slug' => self::SETTINGS_VIEW,
                'name' => 'View Settings',
                'group' => 'settings',
                'description' => 'View global site settings',
            ],
            self::SETTINGS_UPDATE => [
                'slug' => self::SETTINGS_UPDATE,
                'name' => 'Update Settings',
                'group' => 'settings',
                'description' => 'Edit global site settings',
            ],
            self::CATEGORIES_VIEW => [
                'slug' => self::CATEGORIES_VIEW,
                'name' => 'View Categories',
                'group' => 'categories',
                'description' => 'View trip categories',
            ],
            self::CATEGORIES_CREATE => [
                'slug' => self::CATEGORIES_CREATE,
                'name' => 'Create Categories',
                'group' => 'categories',
                'description' => 'Create trip categories',
            ],
            self::CATEGORIES_UPDATE => [
                'slug' => self::CATEGORIES_UPDATE,
                'name' => 'Update Categories',
                'group' => 'categories',
                'description' => 'Edit trip categories',
            ],
            self::CATEGORIES_DELETE => [
                'slug' => self::CATEGORIES_DELETE,
                'name' => 'Delete Categories',
                'group' => 'categories',
                'description' => 'Delete trip categories',
            ],
            self::DESTINATIONS_VIEW => [
                'slug' => self::DESTINATIONS_VIEW,
                'name' => 'View Destinations',
                'group' => 'destinations',
                'description' => 'View destination hub pages',
            ],
            self::DESTINATIONS_CREATE => [
                'slug' => self::DESTINATIONS_CREATE,
                'name' => 'Create Destinations',
                'group' => 'destinations',
                'description' => 'Create destination hub pages',
            ],
            self::DESTINATIONS_UPDATE => [
                'slug' => self::DESTINATIONS_UPDATE,
                'name' => 'Update Destinations',
                'group' => 'destinations',
                'description' => 'Edit destination hub pages',
            ],
            self::DESTINATIONS_DELETE => [
                'slug' => self::DESTINATIONS_DELETE,
                'name' => 'Delete Destinations',
                'group' => 'destinations',
                'description' => 'Delete destination hub pages',
            ],
            self::TRIPS_VIEW => [
                'slug' => self::TRIPS_VIEW,
                'name' => 'View Trips',
                'group' => 'trips',
                'description' => 'View travel products',
            ],
            self::TRIPS_CREATE => [
                'slug' => self::TRIPS_CREATE,
                'name' => 'Create Trips',
                'group' => 'trips',
                'description' => 'Create travel products',
            ],
            self::TRIPS_UPDATE => [
                'slug' => self::TRIPS_UPDATE,
                'name' => 'Update Trips',
                'group' => 'trips',
                'description' => 'Edit travel products',
            ],
            self::TRIPS_DELETE => [
                'slug' => self::TRIPS_DELETE,
                'name' => 'Delete Trips',
                'group' => 'trips',
                'description' => 'Delete travel products',
            ],
            self::DEPARTURES_VIEW => [
                'slug' => self::DEPARTURES_VIEW,
                'name' => 'View Departures',
                'group' => 'departures',
                'description' => 'View departure calendar and inventory',
            ],
            self::DEPARTURES_CREATE => [
                'slug' => self::DEPARTURES_CREATE,
                'name' => 'Create Departures',
                'group' => 'departures',
                'description' => 'Create departures and seat inventory',
            ],
            self::DEPARTURES_UPDATE => [
                'slug' => self::DEPARTURES_UPDATE,
                'name' => 'Update Departures',
                'group' => 'departures',
                'description' => 'Edit departures and seat counts',
            ],
            self::DEPARTURES_DELETE => [
                'slug' => self::DEPARTURES_DELETE,
                'name' => 'Delete Departures',
                'group' => 'departures',
                'description' => 'Delete departures',
            ],
            self::BOOKINGS_VIEW => [
                'slug' => self::BOOKINGS_VIEW,
                'name' => 'View Bookings',
                'group' => 'bookings',
                'description' => 'View customer bookings and payments',
            ],
            self::BOOKINGS_CREATE => [
                'slug' => self::BOOKINGS_CREATE,
                'name' => 'Create Bookings',
                'group' => 'bookings',
                'description' => 'Create bookings on behalf of customers',
            ],
            self::BOOKINGS_UPDATE => [
                'slug' => self::BOOKINGS_UPDATE,
                'name' => 'Update Bookings',
                'group' => 'bookings',
                'description' => 'Edit booking status, payments, and details',
            ],
            self::BOOKINGS_DELETE => [
                'slug' => self::BOOKINGS_DELETE,
                'name' => 'Delete Bookings',
                'group' => 'bookings',
                'description' => 'Cancel or delete bookings',
            ],
            self::PRICING_VIEW => [
                'slug' => self::PRICING_VIEW,
                'name' => 'View Pricing',
                'group' => 'pricing',
                'description' => 'View trip and departure pricing',
            ],
            self::PRICING_UPDATE => [
                'slug' => self::PRICING_UPDATE,
                'name' => 'Update Pricing',
                'group' => 'pricing',
                'description' => 'Edit trip and departure pricing',
            ],
            self::COUPONS_VIEW => [
                'slug' => self::COUPONS_VIEW,
                'name' => 'View Coupons',
                'group' => 'coupons',
                'description' => 'View discount coupons',
            ],
            self::COUPONS_CREATE => [
                'slug' => self::COUPONS_CREATE,
                'name' => 'Create Coupons',
                'group' => 'coupons',
                'description' => 'Create discount coupons',
            ],
            self::COUPONS_UPDATE => [
                'slug' => self::COUPONS_UPDATE,
                'name' => 'Update Coupons',
                'group' => 'coupons',
                'description' => 'Edit coupons, dates, and activation',
            ],
            self::COUPONS_DELETE => [
                'slug' => self::COUPONS_DELETE,
                'name' => 'Delete Coupons',
                'group' => 'coupons',
                'description' => 'Delete discount coupons',
            ],
            self::LEADS_VIEW => [
                'slug' => self::LEADS_VIEW,
                'name' => 'View Leads',
                'group' => 'leads',
                'description' => 'View inquiry and lead submissions',
            ],
            self::LEADS_CREATE => [
                'slug' => self::LEADS_CREATE,
                'name' => 'Create Leads',
                'group' => 'leads',
                'description' => 'Manually create lead and inquiry records',
            ],
            self::LEADS_UPDATE => [
                'slug' => self::LEADS_UPDATE,
                'name' => 'Update Leads',
                'group' => 'leads',
                'description' => 'Update lead status, notes, and assignment',
            ],
            self::LEADS_DELETE => [
                'slug' => self::LEADS_DELETE,
                'name' => 'Delete Leads',
                'group' => 'leads',
                'description' => 'Delete lead submissions',
            ],
            self::BLOGS_VIEW => [
                'slug' => self::BLOGS_VIEW,
                'name' => 'View Blogs',
                'group' => 'blogs',
                'description' => 'View blog posts',
            ],
            self::BLOGS_CREATE => [
                'slug' => self::BLOGS_CREATE,
                'name' => 'Create Blogs',
                'group' => 'blogs',
                'description' => 'Create blog posts',
            ],
            self::BLOGS_UPDATE => [
                'slug' => self::BLOGS_UPDATE,
                'name' => 'Update Blogs',
                'group' => 'blogs',
                'description' => 'Edit blog posts and publish status',
            ],
            self::BLOGS_DELETE => [
                'slug' => self::BLOGS_DELETE,
                'name' => 'Delete Blogs',
                'group' => 'blogs',
                'description' => 'Delete blog posts',
            ],
        ];
    }

    /**
     * @return list<string>
     */
    public static function all(): array
    {
        return array_keys(self::definitions());
    }
}
