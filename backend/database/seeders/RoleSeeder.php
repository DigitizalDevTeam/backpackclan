<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Support\Permissions;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $all = Permissions::all();

        $adminPerms = $all;

        $editorPerms = array_values(array_filter(
            $all,
            fn (string $slug) => ! str_starts_with($slug, 'users.')
                && ! str_starts_with($slug, 'roles.')
                && ! str_starts_with($slug, 'settings.')
                && ! str_ends_with($slug, '.delete')
        ));

        $viewerPerms = array_values(array_filter(
            $all,
            fn (string $slug) => str_ends_with($slug, '.view')
        ));

        $roles = [
            [
                'name' => 'Super Administrator',
                'slug' => 'super-admin',
                'description' => 'Full system access including role management',
                'is_system' => true,
                'permissions' => $all,
            ],
            [
                'name' => 'Administrator',
                'slug' => 'admin',
                'description' => 'Manage users, content, and site settings',
                'is_system' => true,
                'permissions' => $adminPerms,
            ],
            [
                'name' => 'Editor',
                'slug' => 'editor',
                'description' => 'Create and edit CMS content',
                'is_system' => true,
                'permissions' => $editorPerms,
            ],
            [
                'name' => 'Viewer',
                'slug' => 'viewer',
                'description' => 'Read-only access to CMS modules',
                'is_system' => true,
                'permissions' => $viewerPerms,
            ],
            [
                'name' => 'Customer',
                'slug' => 'customer',
                'description' => 'Traveler account for bookings and trip documents',
                'is_system' => true,
                'permissions' => [],
            ],
        ];

        foreach ($roles as $roleData) {
            $permissionSlugs = $roleData['permissions'];
            unset($roleData['permissions']);

            $role = Role::query()->updateOrCreate(
                ['slug' => $roleData['slug']],
                $roleData
            );

            $ids = Permission::query()->whereIn('slug', $permissionSlugs)->pluck('id');
            $role->permissions()->sync($ids);
        }
    }
}
