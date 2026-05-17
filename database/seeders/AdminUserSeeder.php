<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin Ecvaultz',
            'email' => 'admin@ecvaultz.test',
            'password' => Hash::make('Ecvaultz@Admin2024!'),
            'email_verified_at' => now(),
            'is_admin' => true,
        ]);
    }
}
