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
        $permissionIds = [];

        foreach (['patients.view_all', 'patients.assign_dentists'] as $permissionName) {
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

        $rolePermissions = [
            'CLINIC_ADMIN' => ['patients.view_all', 'patients.assign_dentists'],
            'RECEPTIONIST' => ['patients.view_all'],
        ];

        foreach ($rolePermissions as $roleName => $permissionNames) {
            $roleId = DB::table('roles')->where('name', $roleName)->where('guard_name', 'web')->value('id');

            if ($roleId === null) {
                continue;
            }

            foreach ($permissionNames as $permissionName) {
                DB::table('role_has_permissions')->insertOrIgnore([
                    'permission_id' => $permissionIds[$permissionName],
                    'role_id' => $roleId,
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
        $permissionIds = DB::table('permissions')
            ->where('guard_name', 'web')
            ->whereIn('name', ['patients.view_all', 'patients.assign_dentists'])
            ->pluck('id');

        DB::table('role_has_permissions')->whereIn('permission_id', $permissionIds)->delete();
        DB::table('permissions')->whereIn('id', $permissionIds)->delete();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
