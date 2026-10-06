<?php

namespace App\Http\Requests\Modules\ClinicStaff;

use App\Models\User;
use App\Policies\Modules\ClinicStaff\ClinicStaffPolicy;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClinicStaffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', User::class) ?? false;
    }

    /** @return array<string, array<int, string|Rule>> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:40'],
            'whatsapp_appointment_consent' => ['sometimes', 'boolean'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'license_number' => ['nullable', 'string', 'max:100'],
            'password' => ['required', 'string', 'confirmed', 'min:8'],
            'roles' => ['required', 'array', 'min:1', 'max:2'],
            'roles.*' => ['required', 'string', 'distinct', Rule::in(ClinicStaffPolicy::ASSIGNABLE_ROLES)],
        ];
    }
}
