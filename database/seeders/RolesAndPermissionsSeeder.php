<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'users.view',
            'users.create',
            'users.update',
            'users.delete',
            'roles.view',
            'roles.create',
            'roles.update',
            'roles.delete',
            'permissions.view',
            'modules.view',
            'modules.update',
            'settings.view',
            'settings.update',
            'audit.view',
            'branding.view',
            'branding.update',
            'appointments.view',
            'appointments.create',
            'appointments.update',
            'appointments.delete',
            'patients.view',
            'patients.create',
            'patients.update',
            'patients.delete',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $superAdmin = Role::findOrCreate('SUPER_ADMIN', 'web');
        $clinicAdmin = Role::findOrCreate('CLINIC_ADMIN', 'web');
        $receptionist = Role::findOrCreate('RECEPTIONIST', 'web');
        $dentist = Role::findOrCreate('DENTIST', 'web');

        $superAdmin->syncPermissions([
            'users.view',
            'users.create',
            'users.update',
            'users.delete',
            'roles.view',
            'roles.create',
            'roles.update',
            'roles.delete',
            'permissions.view',
            'modules.view',
            'modules.update',
            'settings.view',
            'settings.update',
            'audit.view',
            'branding.view',
            'branding.update',
        ]);

        $clinicAdmin->syncPermissions([
            'users.view',
            'users.create',
            'users.update',
            'settings.view',
            'settings.update',
        ]);

        $receptionist->syncPermissions([
            'patients.view',
            'patients.create',
            'patients.update',
            'appointments.view',
            'appointments.create',
            'appointments.update',
        ]);

        $dentist->syncPermissions([
            'patients.view',
            'patients.update',
            'appointments.view',
            'appointments.create',
            'appointments.update',
        ]);
    }
}
