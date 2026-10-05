<?php

namespace Database\Seeders;

use App\Models\Modules\Patients\Patient;
use App\Models\Modules\Treatments\Treatment;
use App\Models\User;
use Illuminate\Database\Seeder;

class TreatmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $creator = User::query()->where('email', 'test@example.com')->first();

        if ($creator === null) {
            return;
        }

        foreach (Patient::query()->take(3)->get() as $patient) {
            Treatment::factory()->create([
                'patient_id' => $patient->id,
                'created_by' => $creator->id,
            ]);
        }
    }
}
