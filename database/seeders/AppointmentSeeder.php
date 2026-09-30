<?php

namespace Database\Seeders;

use App\Models\Modules\Appointments\Appointment;
use App\Models\Modules\Patients\Patient;
use Illuminate\Database\Seeder;

class AppointmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (Patient::query()->take(3)->get() as $patient) {
            Appointment::factory()->create([
                'patient_id' => $patient->id,
                'dentist_id' => null,
            ]);
        }
    }
}
