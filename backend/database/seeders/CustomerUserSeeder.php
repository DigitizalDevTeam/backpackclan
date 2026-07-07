<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class CustomerUserSeeder extends Seeder
{
    public function run(): void
    {
        $customerRole = Role::query()->where('slug', 'customer')->firstOrFail();

        $customers = [
            [
                'name' => 'Amit Sharma',
                'email' => 'customer@demo.com',
                'phone' => '+91 98765 43210',
                'password' => 'password',
            ],
            [
                'name' => 'Priya Verma',
                'email' => 'priya@email.com',
                'phone' => '+91 91234 56789',
                'password' => 'password123',
            ],
        ];

        foreach ($customers as $data) {
            User::query()->updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'phone' => $data['phone'],
                    'password' => $data['password'],
                    'role_id' => $customerRole->id,
                    'is_active' => true,
                ]
            );
        }
    }
}
