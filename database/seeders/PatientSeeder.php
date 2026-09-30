<?php

namespace Database\Seeders;

use App\Models\Modules\Patients\Patient;
use Illuminate\Database\Seeder;

class PatientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Patient::factory()->count(5)->create();
    }
}
