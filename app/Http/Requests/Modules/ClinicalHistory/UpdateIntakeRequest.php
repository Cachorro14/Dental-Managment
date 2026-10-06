<?php

namespace App\Http\Requests\Modules\ClinicalHistory;

use App\Models\Modules\ClinicalHistory\ClinicalHistory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateIntakeRequest extends FormRequest
{
    public function authorize(): bool
    {
        $patient = $this->route('patient');

        return $this->user()?->can('view', $patient)
            && $this->user()?->can('update_intake', $patient->clinicalHistory ?? new ClinicalHistory(['patient_id' => $patient->id]));
    }

    /** @return array<string, array<int, string|Rule>> */
    public function rules(): array
    {
        $booleanAnswers = ['yes', 'no', 'unknown'];

        return [
            'intake_responses' => ['required', 'array:family,health,dental,oral,declaration_accepted,privacy_acknowledged'],
            'intake_responses.family' => ['required', 'array:father_alive,father_conditions,mother_alive,mother_conditions,has_siblings,siblings_health'],
            'intake_responses.family.*' => ['nullable', 'string', 'max:3000'],
            'intake_responses.family.father_alive' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.family.father_conditions' => ['nullable', 'string', 'max:3000'],
            'intake_responses.family.mother_alive' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.family.mother_conditions' => ['nullable', 'string', 'max:3000'],
            'intake_responses.family.has_siblings' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.family.siblings_health' => ['nullable', 'string', 'max:3000'],
            'intake_responses.health' => ['required', 'array:exercise_discomfort,drug_allergy,anesthesia_allergy,penicillin_allergy,poor_healing_or_bleeding,collagen_disorder,rheumatic_fever,diabetes,heart_condition,anticoagulants,high_blood_pressure,chagas,kidney_condition,gastric_ulcer,hepatitis,hepatitis_type,liver_condition,seizures,epilepsy,sti_history,other_contagious_disease,transfusions,previous_surgery,respiratory_condition,smokes,pregnant,other_medical_recommendation,medications,medications_last_five_years,sports,diabetes_control,bleeding_details,operation_when,pregnancy_months,homeopathic_treatment,clinician_name,referral_clinic'],
            'intake_responses.health.exercise_discomfort' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.health.drug_allergy' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.health.anesthesia_allergy' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.health.penicillin_allergy' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.health.poor_healing_or_bleeding' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.health.collagen_disorder' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.health.rheumatic_fever' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.health.diabetes' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.health.heart_condition' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.health.anticoagulants' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.health.high_blood_pressure' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.health.chagas' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.health.kidney_condition' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.health.gastric_ulcer' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.health.hepatitis' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.health.hepatitis_type' => ['nullable', Rule::in(['a', 'b', 'c', 'unknown'])],
            'intake_responses.health.liver_condition' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.health.seizures' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.health.epilepsy' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.health.sti_history' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.health.other_contagious_disease' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.health.transfusions' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.health.previous_surgery' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.health.respiratory_condition' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.health.smokes' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.health.pregnant' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.health.other_medical_recommendation' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.health.medications' => ['nullable', 'string', 'max:5000'],
            'intake_responses.health.medications_last_five_years' => ['nullable', 'string', 'max:5000'],
            'intake_responses.health.sports' => ['nullable', 'string', 'max:1000'],
            'intake_responses.health.diabetes_control' => ['nullable', 'string', 'max:2000'],
            'intake_responses.health.bleeding_details' => ['nullable', 'string', 'max:2000'],
            'intake_responses.health.operation_when' => ['nullable', 'string', 'max:500'],
            'intake_responses.health.pregnancy_months' => ['nullable', 'integer', 'between:1,45'],
            'intake_responses.health.homeopathic_treatment' => ['nullable', 'string', 'max:3000'],
            'intake_responses.health.clinician_name' => ['nullable', 'string', 'max:255'],
            'intake_responses.health.referral_clinic' => ['nullable', 'string', 'max:1000'],
            'intake_responses.dental' => ['required', 'array:previous_professional,took_medication,treatment_result,had_pain,tooth_trauma,fractured_tooth,speaking_difficulty,chewing_difficulty,opening_difficulty,swallowing_difficulty,reason,medication_names,medication_since,treatment_since,pain_intensity,pain_duration,pain_origin,pain_trigger,pain_location,pain_radiation,pain_relief,trauma_when,trauma_details,fracture_details,fracture_treatment'],
            'intake_responses.dental.previous_professional' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.dental.took_medication' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.dental.treatment_result' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.dental.had_pain' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.dental.pain_intensity' => ['nullable', Rule::in(['mild', 'moderate', 'severe'])],
            'intake_responses.dental.pain_duration' => ['nullable', Rule::in(['temporary', 'intermittent', 'continuous'])],
            'intake_responses.dental.pain_origin' => ['nullable', Rule::in(['spontaneous', 'provoked'])],
            'intake_responses.dental.pain_trigger' => ['nullable', Rule::in(['cold', 'heat', 'both', 'none', 'unknown'])],
            'intake_responses.dental.tooth_trauma' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.dental.fractured_tooth' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.dental.speaking_difficulty' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.dental.chewing_difficulty' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.dental.opening_difficulty' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.dental.swallowing_difficulty' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.dental.pain_relief' => ['nullable', 'string', 'max:3000'],
            'intake_responses.dental.reason' => ['nullable', 'string', 'max:5000'],
            'intake_responses.dental.medication_names' => ['nullable', 'string', 'max:5000'],
            'intake_responses.dental.medication_since' => ['nullable', 'string', 'max:500'],
            'intake_responses.dental.treatment_since' => ['nullable', 'string', 'max:500'],
            'intake_responses.dental.pain_location' => ['nullable', 'string', 'max:1000'],
            'intake_responses.dental.pain_radiation' => ['nullable', 'string', 'max:1000'],
            'intake_responses.dental.trauma_when' => ['nullable', 'string', 'max:500'],
            'intake_responses.dental.trauma_details' => ['nullable', 'string', 'max:3000'],
            'intake_responses.dental.fracture_details' => ['nullable', 'string', 'max:3000'],
            'intake_responses.dental.fracture_treatment' => ['nullable', 'string', 'max:3000'],
            'intake_responses.dental.speaking_difficulty' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.dental.chewing_difficulty' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.dental.opening_difficulty' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.dental.swallowing_difficulty' => ['nullable', Rule::in($booleanAnswers)],
            'intake_responses.declaration_accepted' => ['accepted'],
            'intake_responses.privacy_acknowledged' => ['accepted'],
        ];
    }
}
