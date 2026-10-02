<?php

namespace App\Policies\Modules\Odontogram;

use App\Models\Modules\Odontogram\OdontogramEntry;
use App\Models\User;

class OdontogramEntryPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('odontogram.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, OdontogramEntry $odontogramEntry): bool
    {
        return $user->can('odontogram.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('odontogram.update');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, OdontogramEntry $odontogramEntry): bool
    {
        return $user->can('odontogram.update');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, OdontogramEntry $odontogramEntry): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, OdontogramEntry $odontogramEntry): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, OdontogramEntry $odontogramEntry): bool
    {
        return false;
    }
}
