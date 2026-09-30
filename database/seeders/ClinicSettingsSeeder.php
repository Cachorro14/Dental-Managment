<?php

namespace Database\Seeders;

use App\Core\Settings\ClinicSetting;
use App\Core\Settings\ClinicSettings;
use Illuminate\Database\Seeder;

class ClinicSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ((new ClinicSettings)->defaults() as $key => $value) {
            ClinicSetting::query()->firstOrCreate([
                'key' => $key,
            ], [
                'value' => $value,
            ]);
        }
    }
}
