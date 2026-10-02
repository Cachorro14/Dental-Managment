<?php

namespace App\Policies\Modules\Patients;

use App\Models\Modules\Patients\Patient;
use App\Models\User;

class PatientPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('patients.view')
            && ($user->can('patients.view_all') || $user->hasRole('DENTIST'));
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Patient $patient): bool
    {
        return $user->can('patients.view') && $this->canAccessPatient($user, $patient);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('patients.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Patient $patient): bool
    {
        return $user->can('patients.update') && $this->canAccessPatient($user, $patient);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Patient $patient): bool
    {
        return $user->can('patients.delete') && $this->canAccessPatient($user, $patient);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Patient $patient): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Patient $patient): bool
    {
        return false;
    }

    private function canAccessPatient(User $user, Patient $patient): bool
    {
        return $user->can('patients.view_all') || $patient->isAssignedToDentist($user);
    }
}
