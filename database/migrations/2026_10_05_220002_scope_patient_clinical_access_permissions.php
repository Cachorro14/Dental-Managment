<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    public function up(): void
    {
        $timestamp = now();
        $names = ['clinical_history.view_intake', 'clinical_history.update_intake', 'clinical_history.view_assessment', 'clinical_history.update_assessment', 'clinical_history.print'];
        $permissionIds = [];

        foreach ($names as $name) {
            DB::table('permissions')->insertOrIgnore([
                'name' => $name,
                'guard_name' => 'web',
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ]);
            $permissionIds[$name] = DB::table('permissions')->where('name', $name)->where('guard_name', 'web')->value('id');
        }

        $rolePermissions = [
            'CLINIC_ADMIN' => $names,
            'RECEPTIONIST' => ['clinical_history.view_intake', 'clinical_history.update_intake'],
            'DENTIST' => $names,
        ];

        foreach ($rolePermissions as $roleName => $permissions) {
            $roleId = DB::table('roles')->where('name', $roleName)->where('guard_name', 'web')->value('id');
            if ($roleId === null) {
                continue;
            }
            foreach ($permissions as $permission) {
                DB::table('role_has_permissions')->insertOrIgnore([
                    'role_id' => $roleId,
                    'permission_id' => $permissionIds[$permission],
                ]);
            }
        }

        $receptionistRoleId = DB::table('roles')->where('name', 'RECEPTIONIST')->where('guard_name', 'web')->value('id');
        $clinicalPermissionIds = DB::table('permissions')->whereIn('name', ['clinical_history.view_assessment', 'clinical_history.update_assessment', 'clinical_history.print'])->pluck('id');
        if ($receptionistRoleId !== null) {
            DB::table('role_has_permissions')->where('role_id', $receptionistRoleId)->whereIn('permission_id', $clinicalPermissionIds)->delete();
        }

        $legacyPermissionIds = DB::table('permissions')->whereIn('name', ['clinical_history.view', 'clinical_history.update'])->pluck('id');
        DB::table('role_has_permissions')->whereIn('permission_id', $legacyPermissionIds)->delete();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
