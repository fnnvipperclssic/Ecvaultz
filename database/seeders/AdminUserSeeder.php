<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\FileEncryptionService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $encryption = app(FileEncryptionService::class);

        // Admin Account
        $admin = User::create([
            'name' => 'Admin Ecvaultz',
            'email' => 'admin@ecvaultz.test',
            'password' => Hash::make('Admin@Ecvaultz#2024!'),
            'email_verified_at' => now(),
            'is_admin' => true,
            'last_login_at' => now(),
            'password_changed_at' => now(),
        ]);
        $admin->encryption_key = Crypt::encryptString($encryption->generateUserKey());
        $admin->save();
        $admin->assignRole('Admin');

        // Regular User Account
        $user = User::create([
            'name' => 'John Doe',
            'email' => 'user@ecvaultz.test',
            'password' => Hash::make('User@Ecvaultz#2024!'),
            'email_verified_at' => now(),
            'is_admin' => false,
            'last_login_at' => now(),
            'password_changed_at' => now(),
        ]);
        $user->encryption_key = Crypt::encryptString($encryption->generateUserKey());
        $user->save();
        $user->assignRole('User');

        // Demo User Account
        $demo = User::create([
            'name' => 'Sarah Chen',
            'email' => 'demo@ecvaultz.test',
            'password' => Hash::make('Demo@Ecvaultz#2024!'),
            'email_verified_at' => now(),
            'is_admin' => false,
            'last_login_at' => now(),
            'password_changed_at' => now(),
        ]);
        $demo->encryption_key = Crypt::encryptString($encryption->generateUserKey());
        $demo->save();
        $demo->assignRole('User');

        $this->command->info('Seed accounts created:');
        $this->command->info('  Admin : admin@ecvaultz.test  / Admin@Ecvaultz#2024!');
        $this->command->info('  User  : user@ecvaultz.test   / User@Ecvaultz#2024!');
        $this->command->info('  Demo  : demo@ecvaultz.test   / Demo@Ecvaultz#2024!');
    }
}
