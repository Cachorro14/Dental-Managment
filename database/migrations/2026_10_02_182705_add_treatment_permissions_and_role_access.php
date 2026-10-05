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
            'code' => 'TREATMENTS',
            'enabled' => false,
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);

        $permissionIds = [];

        foreach (['treatments.view', 'treatments.create', 'treatments.update', 'treatments.delete'] as $permissionName) {
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
            'CLINIC_ADMIN' => ['treatments.view', 'treatments.create', 'treatments.update'],
            'RECEPTIONIST' => ['treatments.view'],
            'DENTIST' => ['treatments.view', 'treatments.create', 'treatments.update'],
        ];

        foreach ($rolePermissions as $roleName => $permissions) {
            $roleId = DB::table('roles')
                ->where('name', $roleName)
                ->where('guard_name', 'web')
                ->value('id');

            if ($roleId === null) {
                continue;
            }

            DB::table('module_role')->insertOrIgnore([
                'role_id' => $roleId,
                'module_code' => 'TREATMENTS',
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ]);

            foreach ($permissions as $permissionName) {
                DB::table('role_has_permissions')->insertOrIgnore([
                    'role_id' => $roleId,
                    'permission_id' => $permissionIds[$permissionName],
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
        $roleIds = DB::table('roles')
            ->where('guard_name', 'web')
            ->whereIn('name', ['CLINIC_ADMIN', 'RECEPTIONIST', 'DENTIST'])
            ->pluck('id');
        $permissionIds = DB::table('permissions')
            ->where('guard_name', 'web')
            ->whereIn('name', ['treatments.view', 'treatments.create', 'treatments.update', 'treatments.delete'])
            ->pluck('id');

        DB::table('module_role')
            ->whereIn('role_id', $roleIds)
            ->where('module_code', 'TREATMENTS')
            ->delete();
        DB::table('role_has_permissions')->whereIn('permission_id', $permissionIds)->delete();
        DB::table('permissions')->whereIn('id', $permissionIds)->delete();
        DB::table('module_states')->where('code', 'TREATMENTS')->delete();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
