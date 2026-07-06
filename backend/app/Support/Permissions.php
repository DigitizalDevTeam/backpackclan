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
