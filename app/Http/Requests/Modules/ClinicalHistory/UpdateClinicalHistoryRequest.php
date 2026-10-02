<?php

namespace App\Http\Requests\Modules\ClinicalHistory;

use App\Models\Modules\ClinicalHistory\ClinicalHistory;
use Illuminate\Foundation\Http\FormRequest;

class UpdateClinicalHistoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $patient = $this->route('patient');
        $clinicalHistory = $patient->clinicalHistory ?? new ClinicalHistory(['patient_id' => $patient->id]);

        return $this->user()?->can('view', $patient)
            && $this->user()?->can('update', $clinicalHistory);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'allergies' => ['nullable', 'string', 'max:5000'],
            'medical_conditions' => ['nullable', 'string', 'max:5000'],
            'current_medications' => ['nullable', 'string', 'max:5000'],
            'surgical_history' => ['nullable', 'string', 'max:5000'],
            'family_history' => ['nullable', 'string', 'max:5000'],
            'habits' => ['nullable', 'string', 'max:5000'],
            'clinical_notes' => ['nullable', 'string', 'max:10000'],
        ];
    }
}
