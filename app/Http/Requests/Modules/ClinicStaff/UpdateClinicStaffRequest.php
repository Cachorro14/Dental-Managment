<?php

namespace App\Http\Requests\Modules\ClinicStaff;

use App\Policies\Modules\ClinicStaff\ClinicStaffPolicy;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClinicStaffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('user')) ?? false;
    }

    /** @return array<string, array<int, string|Rule>> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users', 'email')->ignore($this->route('user'))],
            'license_number' => ['nullable', 'string', 'max:100'],
            'password' => ['nullable', 'string', 'confirmed', 'min:8'],
            'roles' => ['required', 'array', 'min:1', 'max:2'],
            'roles.*' => ['required', 'string', 'distinct', Rule::in(ClinicStaffPolicy::ASSIGNABLE_ROLES)],
        ];
    }
}
