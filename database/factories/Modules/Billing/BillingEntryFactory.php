<?php

namespace Database\Factories\Modules\Billing;

use App\Models\Modules\Billing\BillingEntry;
use App\Models\Modules\Patients\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BillingEntry>
 */
class BillingEntryFactory extends Factory
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
            'treatment_id' => null,
            'created_by' => User::factory(),
            'type' => 'charge',
            'amount' => fake()->randomFloat(2, 100, 5000),
            'description' => fake()->sentence(4),
            'payment_method' => null,
            'occurred_at' => now(),
            'voided_by' => null,
            'voided_at' => null,
            'void_reason' => null,
        ];
    }

    public function payment(): static
    {
        return $this->state(fn (): array => [
            'type' => 'payment',
            'payment_method' => fake()->randomElement(['cash', 'card', 'transfer', 'other']),
        ]);
    }
}
