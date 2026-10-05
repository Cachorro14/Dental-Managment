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
            'clinic_staff.view',
            'clinic_staff.create',
            'clinic_staff.update',
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
            'patients.view_all',
            'patients.assign_dentists',
            'patients.create',
            'patients.update',
            'patients.delete',
            'clinical_history.view',
            'clinical_history.update',
            'odontogram.view',
            'odontogram.update',
            'treatments.view',
            'treatments.create',
            'treatments.update',
            'treatments.delete',
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
            'clinic_staff.view',
            'clinic_staff.create',
            'clinic_staff.update',
            'appointments.view',
            'appointments.create',
            'appointments.update',
            'appointments.delete',
            'patients.view',
            'patients.view_all',
            'patients.assign_dentists',
            'settings.view',
            'settings.update',
            'clinical_history.view',
            'odontogram.view',
            'clinical_history.update',
            'odontogram.update',
            'treatments.view',
            'treatments.create',
            'treatments.update',
        ]);

        $receptionist->syncPermissions([
            'patients.view',
            'patients.view_all',
            'patients.create',
            'patients.update',
            'appointments.view',
            'appointments.create',
            'appointments.update',
            'clinical_history.view',
            'odontogram.view',
            'treatments.view',
        ]);

        $dentist->syncPermissions([
            'patients.view',
            'patients.create',
            'patients.update',
            'appointments.view',
            'appointments.create',
            'appointments.update',
            'clinical_history.view',
            'clinical_history.update',
            'odontogram.view',
            'odontogram.update',
            'treatments.view',
            'treatments.create',
            'treatments.update',
        ]);
    }
}
