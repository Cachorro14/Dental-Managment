<?php

namespace App\Policies\Modules\Billing;

use App\Models\Modules\Billing\BillingEntry;
use App\Models\Modules\Patients\Patient;
use App\Models\User;

class BillingEntryPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user, Patient $patient): bool
    {
        return $user->can('billing.view') && $this->canAccessPatient($user, $patient);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, BillingEntry $billingEntry): bool
    {
        return $user->can('billing.view') && $this->canAccessPatient($user, $billingEntry->patient);
    }

    public function charge(User $user, Patient $patient): bool
    {
        return $user->can('billing.charge') && $this->canAccessPatient($user, $patient);
    }

    public function payment(User $user, Patient $patient): bool
    {
        return $user->can('billing.payment') && $this->canAccessPatient($user, $patient);
    }

    public function void(User $user, BillingEntry $billingEntry): bool
    {
        return $user->can('billing.void')
            && $user->hasRole('CLINIC_ADMIN')
            && $billingEntry->voided_at === null
            && $this->canAccessPatient($user, $billingEntry->patient);
    }

    private function canAccessPatient(User $user, Patient $patient): bool
    {
        return $user->can('patients.view_all') || $patient->isAssignedToDentist($user);
    }
}
