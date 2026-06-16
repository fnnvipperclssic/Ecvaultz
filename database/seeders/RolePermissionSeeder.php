<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // File permissions
            'files.view',
            'files.upload',
            'files.download',
            'files.delete',
            'files.restore',
            'files.force-delete',
            'files.rename',
            'files.move',
            'files.bulk-delete',

            // Folder permissions
            'folders.create',
            'folders.rename',
            'folders.delete',
            'folders.view',

            // Share permissions
            'shares.create',
            'shares.revoke',
            'shares.view',

            // Activity log permissions
            'logs.view',
            'logs.export',

            // User management permissions
            'users.manage',
            'users.view',
            'users.edit',
            'users.delete',
            'users.impersonate',

            // Admin permissions
            'admin.access',
            'admin.dashboard',
            'admin.settings.manage',
            'admin.storage.view',

            // Settings
            'settings.view',
            'settings.edit',

            // Security
            'security.2fa.manage',
            'security.questions.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Create Admin role and assign all permissions
        $adminRole = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        $adminRole->syncPermissions(Permission::all());

        // Create User role and assign basic permissions
        $userRole = Role::firstOrCreate(['name' => 'User', 'guard_name' => 'web']);
        $userRole->syncPermissions([
            'files.view',
            'files.upload',
            'files.download',
            'files.delete',
            'files.restore',
            'files.rename',
            'files.move',
            'files.bulk-delete',
            'folders.create',
            'folders.rename',
            'folders.delete',
            'folders.view',
            'shares.create',
            'shares.revoke',
            'shares.view',
            'logs.view',
            'settings.view',
            'security.2fa.manage',
            'security.questions.manage',
        ]);

        // Assign Admin role to existing admin users (is_admin = true)
        $adminUsers = \App\Models\User::where('is_admin', true)->get();
        foreach ($adminUsers as $user) {
            $user->assignRole('Admin');
        }

        // Assign User role to all non-admin users
        $regularUsers = \App\Models\User::where('is_admin', false)->get();
        foreach ($regularUsers as $user) {
            $user->assignRole('User');
        }
    }
}
