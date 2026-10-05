<?php

namespace App\Core\Billing;

use App\Models\Modules\Billing\BillingEntry;
use App\Models\Modules\Patients\Patient;
use App\Models\Modules\Treatments\Treatment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BillingLedger
{
    public function createCharge(
        Patient $patient,
        User $user,
        string $amount,
        string $description,
        ?Treatment $treatment = null,
        ?string $occurredAt = null,
    ): BillingEntry {
        return DB::transaction(function () use ($patient, $user, $amount, $description, $treatment, $occurredAt): BillingEntry {
            $patient = Patient::query()->whereKey($patient->getKey())->lockForUpdate()->firstOrFail();

            if ($treatment !== null) {
                $lockedTreatment = Treatment::query()->whereKey($treatment->getKey())->lockForUpdate()->firstOrFail();

                if ($lockedTreatment->patient_id !== $patient->id) {
                    throw ValidationException::withMessages(['treatment' => 'El tratamiento no pertenece a este paciente.']);
                }

                if ($lockedTreatment->billingEntry()->exists()) {
                    throw ValidationException::withMessages(['treatment' => 'Este tratamiento ya tiene un cargo registrado.']);
                }
            }

            if (bccomp($amount, '0.00', 2) <= 0) {
                throw ValidationException::withMessages(['amount' => 'El importe debe ser mayor que cero.']);
            }

            return $patient->billingEntries()->create([
                'treatment_id' => $treatment?->id,
                'created_by' => $user->id,
                'type' => 'charge',
                'amount' => $amount,
                'description' => $description,
                'occurred_at' => $occurredAt ?? now(),
            ]);
        }, attempts: 3);
    }

    public function createPayment(
        Patient $patient,
        User $user,
        string $amount,
        string $description,
        string $paymentMethod,
        ?string $occurredAt = null,
    ): BillingEntry {
        return DB::transaction(function () use ($patient, $user, $amount, $description, $paymentMethod, $occurredAt): BillingEntry {
            $patient = Patient::query()->whereKey($patient->getKey())->lockForUpdate()->firstOrFail();
            $balance = $this->balanceFor($patient);

            if (bccomp($amount, $balance, 2) > 0) {
                throw ValidationException::withMessages(['amount' => 'El pago no puede ser mayor al adeudo actual.']);
            }

            if (bccomp($amount, '0.00', 2) <= 0) {
                throw ValidationException::withMessages(['amount' => 'El importe debe ser mayor que cero.']);
            }

            return $patient->billingEntries()->create([
                'created_by' => $user->id,
                'type' => 'payment',
                'amount' => $amount,
                'description' => $description,
                'payment_method' => $paymentMethod,
                'occurred_at' => $occurredAt ?? now(),
            ]);
        }, attempts: 3);
    }

    public function void(BillingEntry $entry, User $user, string $reason): BillingEntry
    {
        return DB::transaction(function () use ($entry, $user, $reason): BillingEntry {
            $patient = Patient::query()->whereKey($entry->patient_id)->lockForUpdate()->firstOrFail();
            $lockedEntry = BillingEntry::query()->whereKey($entry->getKey())->lockForUpdate()->firstOrFail();

            if ($lockedEntry->voided_at !== null) {
                throw ValidationException::withMessages(['billingEntry' => 'Este movimiento ya fue anulado.']);
            }

            if ($lockedEntry->type === 'charge') {
                $paid = $this->totalFor($patient, 'payment');
                $chargesAfterVoid = bcsub($this->totalFor($patient, 'charge'), $lockedEntry->amount, 2);

                if (bccomp($paid, $chargesAfterVoid, 2) > 0) {
                    throw ValidationException::withMessages(['billingEntry' => 'No se puede anular este cargo porque existen pagos aplicados al saldo del paciente.']);
                }
            }

            $lockedEntry->update([
                'voided_by' => $user->id,
                'voided_at' => now(),
                'void_reason' => $reason,
            ]);

            return $lockedEntry;
        }, attempts: 3);
    }

    public function balanceFor(Patient $patient): string
    {
        return bcsub($this->totalFor($patient, 'charge'), $this->totalFor($patient, 'payment'), 2);
    }

    private function totalFor(Patient $patient, string $type): string
    {
        return (string) ($patient->billingEntries()
            ->where('type', $type)
            ->whereNull('voided_at')
            ->sum('amount'));
    }
}
