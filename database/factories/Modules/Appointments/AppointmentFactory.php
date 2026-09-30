<?php

namespace Database\Factories\Modules\Appointments;

use App\Models\Modules\Appointments\Appointment;
use App\Models\Modules\Patients\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Appointment>
 */
class AppointmentFactory extends Factory
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
            'dentist_id' => User::factory(),
            'scheduled_at' => fake()->dateTimeBetween('now', '+30 days'),
            'duration_minutes' => fake()->randomElement([30, 45, 60]),
            'status' => 'scheduled',
            'reason' => fake()->sentence(4),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
