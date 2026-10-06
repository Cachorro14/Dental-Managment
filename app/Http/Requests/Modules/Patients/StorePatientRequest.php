<?php

namespace App\Http\Requests\Modules\Patients;

use App\Models\Modules\Patients\Patient;
use Illuminate\Foundation\Http\FormRequest;

class StorePatientRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', Patient::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', 'string', 'in:female,male,other'],
            'phone' => ['nullable', 'string', 'max:40'],
            'email' => ['nullable', 'email', 'max:255', 'unique:patients,email'],
            'address' => ['nullable', 'string', 'max:1000'],
            'emergency_contact_name' => ['nullable', 'string', 'max:200'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:40'],
            'medical_notes' => ['nullable', 'string', 'max:5000'],
            'insurance_provider' => ['nullable', 'string', 'max:255'],
            'insurance_member_number' => ['nullable', 'string', 'max:100'],
            'marital_status' => ['nullable', 'string', 'max:40'],
            'nationality' => ['nullable', 'string', 'max:100'],
            'document_type' => ['nullable', 'string', 'max:40'],
            'document_number' => ['nullable', 'string', 'max:80'],
            'mobile_phone' => ['nullable', 'string', 'max:40'],
            'occupation' => ['nullable', 'string', 'max:255'],
            'insurance_holder' => ['nullable', 'string', 'max:255'],
            'workplace' => ['nullable', 'string', 'max:255'],
            'job_title' => ['nullable', 'string', 'max:255'],
            'whatsapp_reminder_consent' => ['sometimes', 'boolean'],
        ];
    }
}
