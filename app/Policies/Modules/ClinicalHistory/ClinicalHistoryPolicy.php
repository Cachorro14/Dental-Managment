<?php

namespace App\Policies\Modules\ClinicalHistory;

use App\Models\Modules\ClinicalHistory\ClinicalHistory;
use App\Models\User;

class ClinicalHistoryPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('clinical_history.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ClinicalHistory $clinicalHistory): bool
    {
        return $user->can('clinical_history.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('clinical_history.update');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ClinicalHistory $clinicalHistory): bool
    {
        return $user->can('clinical_history.update');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ClinicalHistory $clinicalHistory): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ClinicalHistory $clinicalHistory): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ClinicalHistory $clinicalHistory): bool
    {
        return false;
    }
}
