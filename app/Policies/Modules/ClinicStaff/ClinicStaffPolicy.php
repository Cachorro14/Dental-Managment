<?php

namespace App\Policies\Modules\ClinicStaff;

use App\Models\User;

class ClinicStaffPolicy
{
    /** @var list<string> */
    public const ASSIGNABLE_ROLES = ['DENTIST', 'RECEPTIONIST'];

    public function viewAny(User $user): bool
    {
        return $user->can('clinic_staff.view');
    }

    public function create(User $user): bool
    {
        return $user->can('clinic_staff.create');
    }

    public function view(User $user, User $clinicStaffMember): bool
    {
        return $user->can('clinic_staff.view') && $this->isManageableStaffMember($clinicStaffMember);
    }

    public function update(User $user, User $clinicStaffMember): bool
    {
        return $user->can('clinic_staff.update') && $this->isManageableStaffMember($clinicStaffMember);
    }

    private function isManageableStaffMember(User $user): bool
    {
        $roleNames = $user->getRoleNames();

        return $roleNames->isNotEmpty()
            && $roleNames->every(fn (string $roleName): bool => in_array($roleName, self::ASSIGNABLE_ROLES, true));
    }
}
