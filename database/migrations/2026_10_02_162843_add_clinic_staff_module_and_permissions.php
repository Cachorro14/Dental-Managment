<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $timestamp = now();

        DB::table('module_states')->insertOrIgnore([
            'code' => 'CLINIC_STAFF',
            'enabled' => true,
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);

        $permissionIds = [];

        foreach (['clinic_staff.view', 'clinic_staff.create', 'clinic_staff.update'] as $permissionName) {
            DB::table('permissions')->insertOrIgnore([
                'name' => $permissionName,
                'guard_name' => 'web',
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ]);

            $permissionIds[$permissionName] = DB::table('permissions')
                ->where('name', $permissionName)
                ->where('guard_name', 'web')
                ->value('id');
        }

        $clinicAdminRoleId = DB::table('roles')
            ->where('name', 'CLINIC_ADMIN')
            ->where('guard_name', 'web')
            ->value('id');

        if ($clinicAdminRoleId !== null) {
            DB::table('module_role')->insertOrIgnore([
                'role_id' => $clinicAdminRoleId,
                'module_code' => 'CLINIC_STAFF',
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ]);

            foreach ($permissionIds as $permissionId) {
                DB::table('role_has_permissions')->insertOrIgnore([
                    'role_id' => $clinicAdminRoleId,
                    'permission_id' => $permissionId,
                ]);
            }
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $clinicAdminRoleId = DB::table('roles')
            ->where('name', 'CLINIC_ADMIN')
            ->where('guard_name', 'web')
            ->value('id');
        $permissionIds = DB::table('permissions')
            ->where('guard_name', 'web')
            ->whereIn('name', ['clinic_staff.view', 'clinic_staff.create', 'clinic_staff.update'])
            ->pluck('id');

        if ($clinicAdminRoleId !== null) {
            DB::table('module_role')
                ->where('role_id', $clinicAdminRoleId)
                ->where('module_code', 'CLINIC_STAFF')
                ->delete();
            DB::table('role_has_permissions')
                ->where('role_id', $clinicAdminRoleId)
                ->whereIn('permission_id', $permissionIds)
                ->delete();
        }

        DB::table('permissions')->whereIn('id', $permissionIds)->delete();
        DB::table('module_states')->where('code', 'CLINIC_STAFF')->delete();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
