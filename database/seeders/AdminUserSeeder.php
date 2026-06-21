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

        // Admin Account — use firstOrCreate for idempotent seeding
        $admin = User::firstOrCreate(
            ['email' => 'admin@ecvaultz.test'],
            [
                'name' => 'Admin Ecvaultz',
                'password' => Hash::make('Admin@Ecvaultz#2024!'),
                'email_verified_at' => now(),
                'is_admin' => true,
                'last_login_at' => now(),
                'password_changed_at' => now(),
            ]
        );
        if (!$admin->encryption_key) {
            $admin->encryption_key = Crypt::encryptString($encryption->generateUserKey());
            $admin->save();
        }
        $admin->assignRole('Admin');

        // Regular User Account
        $user = User::firstOrCreate(
            ['email' => 'user@ecvaultz.test'],
            [
                'name' => 'John Doe',
                'password' => Hash::make('User@Ecvaultz#2024!'),
                'email_verified_at' => now(),
                'is_admin' => false,
                'last_login_at' => now(),
                'password_changed_at' => now(),
            ]
        );
        if (!$user->encryption_key) {
            $user->encryption_key = Crypt::encryptString($encryption->generateUserKey());
            $user->save();
        }
        $user->assignRole('User');

        // Demo User Account
        $demo = User::firstOrCreate(
            ['email' => 'demo@ecvaultz.test'],
            [
                'name' => 'Sarah Chen',
                'password' => Hash::make('Demo@Ecvaultz#2024!'),
                'email_verified_at' => now(),
                'is_admin' => false,
                'last_login_at' => now(),
                'password_changed_at' => now(),
            ]
        );
        if (!$demo->encryption_key) {
            $demo->encryption_key = Crypt::encryptString($encryption->generateUserKey());
            $demo->save();
        }
        $demo->assignRole('User');

        $this->command->info('Seed accounts created:');
        $this->command->info('  Admin : admin@ecvaultz.test  / Admin@Ecvaultz#2024!');
        $this->command->info('  User  : user@ecvaultz.test   / User@Ecvaultz#2024!');
        $this->command->info('  Demo  : demo@ecvaultz.test   / Demo@Ecvaultz#2024!');
    }
}
