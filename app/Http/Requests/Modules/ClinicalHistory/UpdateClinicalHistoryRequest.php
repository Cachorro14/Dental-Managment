<?php

namespace App\Http\Requests\Modules\ClinicalHistory;

use App\Models\Modules\ClinicalHistory\ClinicalHistory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

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
            && $this->user()?->can('update_assessment', $clinicalHistory);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'allergies' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'medical_conditions' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'current_medications' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'surgical_history' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'family_history' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'habits' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'clinical_notes' => ['sometimes', 'nullable', 'string', 'max:10000'],
            'assessment_data' => ['sometimes', 'array:responsible_dentist_id,office_location,license_number,consultation_reason,current_condition,vital_signs,extraoral_exam,intraoral_exam,soft_tissue_findings,gingival_bleeding,pus,tooth_mobility,occlusal_discomfort,facial_swelling,plaque_index,oral_hygiene,calculus,periodontal_disease,diagnosis,prognosis,treatment_plan_notes,observations,annex_number,treatment_plan_date'],
            'assessment_data.responsible_dentist_id' => ['nullable', 'integer', Rule::exists('users', 'id')],
            'assessment_data.office_location' => ['nullable', 'string', 'max:255'],
            'assessment_data.license_number' => ['nullable', 'string', 'max:100'],
            'assessment_data.consultation_reason' => ['nullable', 'string', 'max:5000'],
            'assessment_data.current_condition' => ['nullable', 'string', 'max:5000'],
            'assessment_data.vital_signs' => ['nullable', 'array'],
            'assessment_data.vital_signs.*' => ['nullable', 'string', 'max:100'],
            'assessment_data.extraoral_exam' => ['nullable', 'string', 'max:5000'],
            'assessment_data.intraoral_exam' => ['nullable', 'string', 'max:5000'],
            'assessment_data.soft_tissue_findings' => ['nullable', 'string', 'max:5000'],
            'assessment_data.gingival_bleeding' => ['nullable', Rule::in(['yes', 'no', 'unknown'])],
            'assessment_data.pus' => ['nullable', Rule::in(['yes', 'no', 'unknown'])],
            'assessment_data.tooth_mobility' => ['nullable', Rule::in(['yes', 'no', 'unknown'])],
            'assessment_data.occlusal_discomfort' => ['nullable', 'string', 'max:2000'],
            'assessment_data.facial_swelling' => ['nullable', Rule::in(['yes', 'no', 'unknown'])],
            'assessment_data.plaque_index' => ['nullable', 'string', 'max:100'],
            'assessment_data.oral_hygiene' => ['nullable', Rule::in(['very_good', 'good', 'poor', 'bad', 'unknown'])],
            'assessment_data.calculus' => ['nullable', Rule::in(['yes', 'no', 'unknown'])],
            'assessment_data.periodontal_disease' => ['nullable', Rule::in(['yes', 'no', 'unknown'])],
            'assessment_data.diagnosis' => ['nullable', 'string', 'max:10000'],
            'assessment_data.prognosis' => ['nullable', 'string', 'max:5000'],
            'assessment_data.treatment_plan_notes' => ['nullable', 'string', 'max:10000'],
            'assessment_data.observations' => ['nullable', 'string', 'max:10000'],
            'assessment_data.annex_number' => ['nullable', 'string', 'max:100'],
            'assessment_data.treatment_plan_date' => ['nullable', 'date'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            $dentistId = $this->input('assessment_data.responsible_dentist_id');
            $patient = $this->route('patient');

            if ($dentistId && ! $patient->dentists()->whereKey($dentistId)->whereHas('roles', fn ($query) => $query->where('name', 'DENTIST'))->exists()) {
                $validator->errors()->add('assessment_data.responsible_dentist_id', 'Selecciona un odontólogo asignado al paciente.');
            }
        }];
    }
}
