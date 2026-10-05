<?php

namespace Database\Factories\Modules\Treatments;

use App\Models\Modules\Patients\Patient;
use App\Models\Modules\Treatments\Treatment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Treatment>
 */
class TreatmentFactory extends Factory
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
            'dentist_id' => null,
            'created_by' => User::factory(),
            'tooth_number' => fake()->optional()->randomElement([11, 16, 21, 26, 31, 36, 41, 46]),
            'name' => fake()->randomElement(['Limpieza dental', 'Restauración', 'Endodoncia', 'Extracción']),
            'description' => fake()->optional()->sentence(),
            'cost' => fake()->randomFloat(2, 50, 2500),
            'status' => 'planned',
            'scheduled_for' => fake()->optional()->dateTimeBetween('now', '+30 days'),
            'completed_at' => null,
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
