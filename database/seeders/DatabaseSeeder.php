<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the catalogs every installation needs. Safe to run in production:
     * it creates no users and no patient data. Create the first administrator
     * with `php artisan app:create-admin`; load demo data locally with
     * `php artisan db:seed --class=DevelopmentSeeder`.
     */
    public function run(): void
    {
        $this->call(RolesAndPermissionsSeeder::class);
        $this->call(ModuleCatalogSeeder::class);
        $this->call(ClinicSettingsSeeder::class);
    }
}
