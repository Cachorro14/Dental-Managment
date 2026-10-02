<?php

namespace Database\Factories\Modules\Odontogram;

use App\Models\Modules\Odontogram\OdontogramEntry;
use App\Models\Modules\Patients\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OdontogramEntry>
 */
class OdontogramEntryFactory extends Factory
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
            'tooth_number' => fake()->numberBetween(11, 48),
            'status' => 'healthy',
            'notes' => null,
        ];
    }
}
