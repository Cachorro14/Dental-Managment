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
                ['enabled' => in_array($code, ['USER_MANAGEMENT', 'PATIENTS'], true)],
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
            'SUPER_ADMIN' => array_keys($catalog->modules()),
            'RECEPTIONIST' => ['PATIENTS', 'APPOINTMENTS'],
            'DENTIST' => ['PATIENTS', 'APPOINTMENTS'],
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
