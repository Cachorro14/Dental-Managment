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

        DB::table('permissions')->insertOrIgnore([
            'name' => 'patients.create',
            'guard_name' => 'web',
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);

        $roleId = DB::table('roles')->where('name', 'DENTIST')->where('guard_name', 'web')->value('id');
        $permissionId = DB::table('permissions')->where('name', 'patients.create')->where('guard_name', 'web')->value('id');

        if ($roleId !== null && $permissionId !== null) {
            DB::table('role_has_permissions')->insertOrIgnore([
                'role_id' => $roleId,
                'permission_id' => $permissionId,
            ]);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $roleId = DB::table('roles')->where('name', 'DENTIST')->where('guard_name', 'web')->value('id');
        $permissionId = DB::table('permissions')->where('name', 'patients.create')->where('guard_name', 'web')->value('id');

        if ($roleId !== null && $permissionId !== null) {
            DB::table('role_has_permissions')
                ->where('role_id', $roleId)
                ->where('permission_id', $permissionId)
                ->delete();
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
