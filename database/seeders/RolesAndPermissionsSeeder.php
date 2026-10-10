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
            'appointments.reminders.send',
            'patients.whatsapp_consent',
            'users.whatsapp_consent',
            'patients.view',
            'patients.view_all',
            'patients.assign_dentists',
            'patients.create',
            'patients.demographics.update',
            'patients.update',
            'patients.delete',
            'clinical_history.view_intake',
            'clinical_history.update_intake',
            'clinical_history.view_assessment',
            'clinical_history.update_assessment',
            'clinical_history.print',
            'odontogram.view',
            'odontogram.update',
            'treatments.view',
            'treatments.create',
            'treatments.update',
            'treatments.delete',
            'billing.view',
            'billing.charge',
            'billing.payment',
            'billing.void',
            'inventory.view',
            'inventory.create',
            'inventory.update',
            'inventory.adjust',
            'reports.view',
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
            'patients.whatsapp_consent',
            'users.whatsapp_consent',
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
            'appointments.reminders.send',
            'patients.whatsapp_consent',
            'users.whatsapp_consent',
            'patients.view',
            'patients.view_all',
            'patients.assign_dentists',
            'patients.update',
            'patients.delete',
            'settings.view',
            'settings.update',
            'odontogram.view',
            'clinical_history.view_intake',
            'clinical_history.update_intake',
            'clinical_history.view_assessment',
            'clinical_history.update_assessment',
            'clinical_history.print',
            'odontogram.update',
            'treatments.view',
            'treatments.create',
            'treatments.update',
            'billing.view',
            'billing.charge',
            'billing.payment',
            'billing.void',
            'inventory.view',
            'inventory.create',
            'inventory.update',
            'inventory.adjust',
            'reports.view',
        ]);

        $receptionist->syncPermissions([
            'patients.view',
            'patients.view_all',
            'patients.create',
            'appointments.view',
            'appointments.create',
            'appointments.update',
            'appointments.reminders.send',
            'patients.whatsapp_consent',
            'users.whatsapp_consent',
            'clinical_history.view_intake',
            'clinical_history.update_intake',
            'odontogram.view',
            'treatments.view',
            'billing.view',
            'billing.charge',
            'billing.payment',
            'inventory.view',
            'inventory.adjust',
            'reports.view',
        ]);

        $dentist->syncPermissions([
            'patients.view',
            'patients.create',
            'patients.demographics.update',
            'appointments.view',
            'appointments.create',
            'appointments.update',
            'appointments.reminders.send',
            'patients.whatsapp_consent',
            'users.whatsapp_consent',
            'clinical_history.view_intake',
            'clinical_history.update_intake',
            'clinical_history.view_assessment',
            'clinical_history.update_assessment',
            'clinical_history.print',
            'odontogram.view',
            'odontogram.update',
            'treatments.view',
            'treatments.create',
            'treatments.update',
            'billing.view',
            'billing.charge',
            'billing.payment',
            'inventory.view',
            'inventory.create',
            'inventory.adjust',
            'reports.view',
        ]);
    }
}
