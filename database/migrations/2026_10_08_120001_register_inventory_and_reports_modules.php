<?php

use App\Core\Modules\ModuleState;
use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['INVENTORY', 'REPORTS'] as $code) {
            ModuleState::query()->updateOrCreate(['code' => $code], ['enabled' => true]);
        }

        foreach (['inventory.view', 'inventory.create', 'inventory.adjust', 'reports.view'] as $permissionName) {
            Permission::findOrCreate($permissionName, 'web');
        }

        foreach (['CLINIC_ADMIN', 'RECEPTIONIST', 'DENTIST'] as $roleName) {
            $role = Role::query()->where('name', $roleName)->first();
            $role?->givePermissionTo(['inventory.view', 'inventory.create', 'inventory.adjust', 'reports.view']);
        }
    }

    public function down(): void
    {
        ModuleState::query()->whereIn('code', ['INVENTORY', 'REPORTS'])->delete();
        Permission::query()->whereIn('name', ['inventory.view', 'inventory.create', 'inventory.adjust', 'reports.view'])->delete();
    }
};
