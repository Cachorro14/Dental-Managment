<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    public function up(): void
    {
        $timestamp = now();
        $permissionIds = [];

        foreach ([
            'clinical_history.view_intake',
            'clinical_history.update_intake',
            'clinical_history.view_assessment',
            'clinical_history.update_assessment',
            'clinical_history.print',
        ] as $permissionName) {
            DB::table('permissions')->insertOrIgnore([
                'name' => $permissionName,
                'guard_name' => 'web',
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ]);
            $permissionIds[$permissionName] = DB::table('permissions')->where('name', $permissionName)->where('guard_name', 'web')->value('id');
        }

        $rolePermissions = [
            'CLINIC_ADMIN' => ['clinical_history.view_intake', 'clinical_history.update_intake', 'clinical_history.view_assessment', 'clinical_history.update_assessment', 'clinical_history.print'],
            'RECEPTIONIST' => ['clinical_history.view_intake', 'clinical_history.update_intake'],
            'DENTIST' => ['clinical_history.view_intake', 'clinical_history.update_intake', 'clinical_history.view_assessment', 'clinical_history.update_assessment', 'clinical_history.print'],
        ];

        $legacyPermissionId = DB::table('permissions')->where('name', 'clinical_history.view')->where('guard_name', 'web')->value('id');
        $legacyUpdateId = DB::table('permissions')->where('name', 'clinical_history.update')->where('guard_name', 'web')->value('id');

        foreach ($rolePermissions as $roleName => $permissionNames) {
            $roleId = DB::table('roles')->where('name', $roleName)->where('guard_name', 'web')->value('id');
            if ($roleId === null) {
                continue;
            }
            foreach ($permissionNames as $permissionName) {
                DB::table('role_has_permissions')->insertOrIgnore(['permission_id' => $permissionIds[$permissionName], 'role_id' => $roleId]);
            }
            if ($legacyPermissionId !== null) {
                DB::table('role_has_permissions')->where('role_id', $roleId)->where('permission_id', $legacyPermissionId)->delete();
            }
            if ($legacyUpdateId !== null && $roleName === 'RECEPTIONIST') {
                DB::table('role_has_permissions')->where('role_id', $roleId)->where('permission_id', $legacyUpdateId)->delete();
            }
        }

        $legacyPatientUpdateId = DB::table('permissions')->where('name', 'patients.update')->where('guard_name', 'web')->value('id');
        $dentistRoleId = DB::table('roles')->where('name', 'DENTIST')->where('guard_name', 'web')->value('id');
        if ($legacyPatientUpdateId !== null && $dentistRoleId !== null) {
            DB::table('role_has_permissions')->where('role_id', $dentistRoleId)->where('permission_id', $legacyPatientUpdateId)->delete();
        }

        DB::table('role_has_permissions')->whereIn('permission_id', DB::table('permissions')->whereIn('name', ['clinical_history.view_assessment', 'clinical_history.update_assessment', 'clinical_history.print'])->pluck('id'))
            ->whereIn('role_id', DB::table('roles')->where('name', 'RECEPTIONIST')->pluck('id'))
            ->delete();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        $names = ['clinical_history.view_intake', 'clinical_history.update_intake', 'clinical_history.view_assessment', 'clinical_history.update_assessment', 'clinical_history.print'];
        $permissionIds = DB::table('permissions')->where('guard_name', 'web')->whereIn('name', $names)->pluck('id');
        DB::table('role_has_permissions')->whereIn('permission_id', $permissionIds)->delete();
        DB::table('permissions')->whereIn('id', $permissionIds)->delete();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
