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
            'code' => 'BILLING',
            'enabled' => false,
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);

        $permissionIds = [];
        foreach (['billing.view', 'billing.charge', 'billing.payment', 'billing.void'] as $permissionName) {
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
            'CLINIC_ADMIN' => ['billing.view', 'billing.charge', 'billing.payment', 'billing.void'],
            'RECEPTIONIST' => ['billing.view', 'billing.charge', 'billing.payment'],
            'DENTIST' => ['billing.view', 'billing.charge', 'billing.payment'],
        ];

        foreach ($rolePermissions as $roleName => $permissions) {
            $roleId = DB::table('roles')->where('name', $roleName)->where('guard_name', 'web')->value('id');

            if ($roleId === null) {
                continue;
            }

            DB::table('module_role')->insertOrIgnore([
                'role_id' => $roleId,
                'module_code' => 'BILLING',
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
            ->whereIn('name', ['billing.view', 'billing.charge', 'billing.payment', 'billing.void'])
            ->pluck('id');

        DB::table('module_role')->whereIn('role_id', $roleIds)->where('module_code', 'BILLING')->delete();
        DB::table('role_has_permissions')->whereIn('permission_id', $permissionIds)->delete();
        DB::table('permissions')->whereIn('id', $permissionIds)->delete();
        DB::table('module_states')->where('code', 'BILLING')->delete();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
