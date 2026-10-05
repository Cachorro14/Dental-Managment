<?php

namespace Database\Seeders;

use App\Core\Modules\FeatureState;
use App\Core\Modules\ModuleCatalog;
use App\Core\Modules\ModuleState;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class ModuleCatalogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $catalog = new ModuleCatalog;

        foreach ($catalog->modules() as $code => $module) {
            ModuleState::query()->updateOrCreate(
                ['code' => $code],
                ['enabled' => in_array($code, ['USER_MANAGEMENT', 'PATIENTS', 'APPOINTMENTS', 'CLINIC_STAFF'], true)],
            );
        }

        foreach ($catalog->features() as $code => $feature) {
            FeatureState::query()->updateOrCreate(
                ['code' => $code],
                [
                    'module_code' => $feature['module'],
                    'enabled' => false,
                ],
            );
        }

        $moduleRoles = [
            'SUPER_ADMIN' => array_values(array_diff(array_keys($catalog->modules()), ['CLINIC_STAFF'])),
            'CLINIC_ADMIN' => ['APPOINTMENTS', 'BILLING', 'CLINIC_STAFF', 'CLINICAL_HISTORY', 'ODONTOGRAM', 'PATIENTS', 'TREATMENTS'],
            'RECEPTIONIST' => ['APPOINTMENTS', 'BILLING', 'CLINICAL_HISTORY', 'ODONTOGRAM', 'PATIENTS', 'TREATMENTS'],
            'DENTIST' => ['APPOINTMENTS', 'BILLING', 'CLINICAL_HISTORY', 'ODONTOGRAM', 'PATIENTS', 'TREATMENTS'],
        ];

        foreach ($moduleRoles as $roleName => $modules) {
            $role = Role::query()->where('name', $roleName)->first();

            if ($role === null) {
                continue;
            }

            foreach ($modules as $moduleCode) {
                DB::table('module_role')->updateOrInsert(
                    ['role_id' => $role->id, 'module_code' => $moduleCode],
                    ['created_at' => now(), 'updated_at' => now()],
                );
            }
        }
    }
}
