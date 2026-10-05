<?php

namespace Database\Seeders;

use App\Models\Modules\Billing\BillingEntry;
use App\Models\Modules\Patients\Patient;
use App\Models\Modules\Treatments\Treatment;
use App\Models\User;
use Illuminate\Database\Seeder;

class BillingEntrySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::query()->where('email', 'test@example.com')->first();
        $patient = Patient::query()->first();

        if ($user === null || $patient === null) {
            return;
        }

        $treatment = Treatment::query()->whereBelongsTo($patient)->first();

        if ($treatment === null) {
            return;
        }

        if (! $treatment->billingEntry()->exists()) {
            BillingEntry::query()->create([
                'patient_id' => $patient->id,
                'treatment_id' => $treatment->id,
                'created_by' => $user->id,
                'type' => 'charge',
                'amount' => $treatment->cost,
                'description' => 'Tratamiento: '.$treatment->name,
                'occurred_at' => now()->subDays(3),
            ]);
        }

        BillingEntry::query()->firstOrCreate(
            ['patient_id' => $patient->id, 'description' => 'Abono de ejemplo'],
            [
                'created_by' => $user->id,
                'type' => 'payment',
                'amount' => bcdiv((string) $treatment->cost, '2', 2),
                'payment_method' => 'cash',
                'occurred_at' => now()->subDay(),
            ],
        );
    }
}
