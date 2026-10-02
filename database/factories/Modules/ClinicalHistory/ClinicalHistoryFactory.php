<?php

namespace Database\Factories\Modules\ClinicalHistory;

use App\Models\Modules\ClinicalHistory\ClinicalHistory;
use App\Models\Modules\Patients\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ClinicalHistory>
 */
class ClinicalHistoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'patient_id' => Patient::factory(),
            'allergies' => fake()->optional()->sentence(),
            'medical_conditions' => fake()->optional()->sentence(),
            'current_medications' => fake()->optional()->sentence(),
            'surgical_history' => fake()->optional()->sentence(),
            'family_history' => fake()->optional()->sentence(),
            'habits' => fake()->optional()->sentence(),
            'clinical_notes' => fake()->optional()->paragraph(),
        ];
    }
}
