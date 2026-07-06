<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Super Admin',
                'email' => 'admin@backpackclan.com',
                'password' => 'password',
                'role_slug' => 'super-admin',
            ],
            [
                'name' => 'Content Editor',
                'email' => 'editor@backpackclan.com',
                'password' => 'password',
                'role_slug' => 'editor',
            ],
            [
                'name' => 'Read Only Viewer',
                'email' => 'viewer@backpackclan.com',
                'password' => 'password',
                'role_slug' => 'viewer',
            ],
        ];

        foreach ($users as $data) {
            $role = Role::query()->where('slug', $data['role_slug'])->firstOrFail();

            User::query()->updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => $data['password'],
                    'role_id' => $role->id,
                    'is_active' => true,
                ]
            );
        }
    }
}
