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
        return $user->can('clinical_history.view_intake') || $user->can('clinical_history.view_assessment');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ClinicalHistory $clinicalHistory): bool
    {
        return $user->can('clinical_history.view_intake') || $user->can('clinical_history.view_assessment');
    }

    public function view_intake(User $user, ClinicalHistory $clinicalHistory): bool
    {
        return $user->can('clinical_history.view_intake');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('clinical_history.update_assessment');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ClinicalHistory $clinicalHistory): bool
    {
        return $user->can('clinical_history.update_assessment');
    }

    public function update_intake(User $user, ClinicalHistory $clinicalHistory): bool
    {
        return $user->can('clinical_history.update_intake');
    }

    public function view_assessment(User $user, ClinicalHistory $clinicalHistory): bool
    {
        return $user->can('clinical_history.view_assessment');
    }

    public function update_assessment(User $user, ClinicalHistory $clinicalHistory): bool
    {
        return $user->can('clinical_history.update_assessment');
    }

    public function print(User $user, ClinicalHistory $clinicalHistory): bool
    {
        return $user->can('clinical_history.print');
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
