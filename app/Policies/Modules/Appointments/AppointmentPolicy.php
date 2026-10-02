<?php

namespace App\Policies\Modules\Appointments;

use App\Models\Modules\Appointments\Appointment;
use App\Models\User;

class AppointmentPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('appointments.view')
            && ($user->can('patients.view_all') || $user->hasRole('DENTIST'));
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Appointment $appointment): bool
    {
        return $user->can('appointments.view') && $this->canAccessAppointment($user, $appointment);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('appointments.create')
            && ($user->can('patients.view_all') || $user->hasRole('DENTIST'));
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Appointment $appointment): bool
    {
        return $user->can('appointments.update') && $this->canAccessAppointment($user, $appointment);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Appointment $appointment): bool
    {
        return $user->can('appointments.delete') && $this->canAccessAppointment($user, $appointment);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Appointment $appointment): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Appointment $appointment): bool
    {
        return false;
    }

    private function canAccessAppointment(User $user, Appointment $appointment): bool
    {
        return $user->can('patients.view_all')
            || ($appointment->patient?->isAssignedToDentist($user) ?? false);
    }
}
