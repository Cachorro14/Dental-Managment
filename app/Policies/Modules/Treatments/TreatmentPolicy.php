<?php

namespace App\Policies\Modules\Treatments;

use App\Models\Modules\Patients\Patient;
use App\Models\Modules\Treatments\Treatment;
use App\Models\User;

class TreatmentPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user, Patient $patient): bool
    {
        return $user->can('treatments.view') && $this->canAccessPatient($user, $patient);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Treatment $treatment): bool
    {
        return $user->can('treatments.view') && $this->canAccessPatient($user, $treatment->patient);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, Patient $patient): bool
    {
        return $user->can('treatments.create') && $this->canAccessPatient($user, $patient);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Treatment $treatment): bool
    {
        return $user->can('treatments.update') && $this->canAccessPatient($user, $treatment->patient);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Treatment $treatment): bool
    {
        return $user->can('treatments.delete') && $this->canAccessPatient($user, $treatment->patient);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Treatment $treatment): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Treatment $treatment): bool
    {
        return false;
    }

    private function canAccessPatient(User $user, Patient $patient): bool
    {
        return $user->can('patients.view_all') || $patient->isAssignedToDentist($user);
    }
}
