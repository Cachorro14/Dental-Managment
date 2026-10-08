<?php

namespace App\Http\Controllers\Modules\ClinicalHistory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Modules\ClinicalHistory\UpdateClinicalHistoryRequest;
use App\Http\Requests\Modules\ClinicalHistory\UpdateIntakeRequest;
use App\Models\Modules\ClinicalHistory\ClinicalHistory;
use App\Models\Modules\Patients\Patient;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ClinicalHistoryController extends Controller
{
    public function questionnaire(Patient $patient): Response
    {
        Gate::authorize('view', $patient);
        $user = request()->user();
        Gate::authorize('view_intake', $patient->clinicalHistory ?? new ClinicalHistory(['patient_id' => $patient->id]));

        $clinicalHistory = $patient->clinicalHistory()->firstOrNew(['patient_id' => $patient->id]);

        return Inertia::render('ClinicalHistory/Questionnaire', [
            'patient' => $patient->only(['id', 'first_name', 'last_name']),
            'clinicalHistory' => [
                ...$clinicalHistory->only(['intake_responses', 'reviewed_at']),
                'intake_updated_at' => $clinicalHistory->intake_updated_at?->format('d/m/Y H:i'),
                'canEditIntake' => $user->can('clinical_history.update_intake'),
            ],
        ]);
    }

    public function edit(Patient $patient): Response
    {
        Gate::authorize('view', $patient);
        Gate::authorize('view_assessment', $patient->clinicalHistory ?? new ClinicalHistory(['patient_id' => $patient->id]));

        $clinicalHistory = $patient->clinicalHistory()->firstOrNew(['patient_id' => $patient->id]);
        $user = request()->user();

        Gate::authorize('view_assessment', $clinicalHistory);

        return Inertia::render('ClinicalHistory/Edit', [
            'patient' => $patient->only(['id', 'first_name', 'last_name']),
            'clinicalHistory' => [
                ...$clinicalHistory->only(['allergies', 'medical_conditions', 'current_medications', 'surgical_history', 'family_history', 'habits', 'clinical_notes', 'intake_responses', 'reviewed_at']),
                'intake_updated_at' => $clinicalHistory->intake_updated_at?->format('d/m/Y H:i'),
                'assessment_data' => $clinicalHistory->assessment_data,
                'responsible_dentist_id' => $clinicalHistory->responsible_dentist_id,
                'assessment_updated_at' => $clinicalHistory->assessment_updated_at,
                'canEditAssessment' => $user->can('clinical_history.update_assessment'),
                'canEditIntake' => $user->can('clinical_history.update_intake'),
                'canPrint' => $user->can('clinical_history.print'),
            ],
            'dentists' => $patient->dentists()
                ->whereHas('roles', fn ($query) => $query->where('name', 'DENTIST'))
                ->orderBy('name')
                ->get(['users.id', 'users.name'])
                ->map(fn (User $dentist) => [...$dentist->only(['id', 'name']), 'license_number' => $dentist->license_number]),
        ]);
    }

    public function update(UpdateClinicalHistoryRequest $request, Patient $patient): RedirectResponse
    {
        Gate::authorize('view', $patient);
        $clinicalHistory = $patient->clinicalHistory()->firstOrNew([
            'patient_id' => $patient->id,
        ]);

        Gate::authorize('update_assessment', $clinicalHistory);

        $data = $request->validated();
        $assessmentData = $data['assessment_data'] ?? $clinicalHistory->assessment_data ?? [];
        $responsibleDentistId = $assessmentData['responsible_dentist_id'] ?? $clinicalHistory->responsible_dentist_id;
        unset($assessmentData['responsible_dentist_id']);

        unset($data['assessment_data']);
        $clinicalHistory->fill($data);
        $clinicalHistory->assessment_data = $assessmentData;
        $clinicalHistory->responsible_dentist_id = $responsibleDentistId;
        $clinicalHistory->assessment_updated_by = $request->user()->id;
        $clinicalHistory->assessment_updated_at = now();
        $clinicalHistory->save();

        return redirect()->route('clinical-history.edit', $patient)
            ->with('status', 'Historia clinica actualizada.');
    }

    public function updateIntake(UpdateIntakeRequest $request, Patient $patient): RedirectResponse
    {
        Gate::authorize('view', $patient);
        Gate::authorize('update_intake', $patient->clinicalHistory ?? new ClinicalHistory(['patient_id' => $patient->id]));
        $clinicalHistory = $patient->clinicalHistory()->firstOrNew(['patient_id' => $patient->id]);
        $intakeResponses = $request->validated('intake_responses');
        $existingResponses = $clinicalHistory->intake_responses ?? [];
        if (isset($existingResponses['oral']) && ! array_key_exists('oral', $intakeResponses)) {
            $intakeResponses['oral'] = $existingResponses['oral'];
        }
        $clinicalHistory->intake_responses = $intakeResponses;
        $clinicalHistory->intake_updated_by = $request->user()->id;
        $clinicalHistory->intake_updated_at = now();
        $clinicalHistory->reviewed_by = null;
        $clinicalHistory->reviewed_at = null;
        $clinicalHistory->save();

        return redirect()->route('clinical-history.questionnaire', $patient)
            ->with('status', 'Cuestionario guardado. La revisión clínica quedó pendiente.');
    }

    public function review(Patient $patient): RedirectResponse
    {
        Gate::authorize('view', $patient);
        $clinicalHistory = $patient->clinicalHistory()->firstOrNew(['patient_id' => $patient->id]);
        Gate::authorize('update_assessment', $clinicalHistory);
        $clinicalHistory->reviewed_by = request()->user()->id;
        $clinicalHistory->reviewed_at = now();
        $clinicalHistory->save();

        return redirect()->route('clinical-history.edit', $patient)->with('status', 'Cuestionario marcado como revisado.');
    }

    public function print(Patient $patient): Response
    {
        Gate::authorize('view', $patient);
        Gate::authorize('view_assessment', $patient->clinicalHistory ?? new ClinicalHistory(['patient_id' => $patient->id]));
        Gate::authorize('print', $patient->clinicalHistory ?? new ClinicalHistory(['patient_id' => $patient->id]));

        $clinicalHistory = $patient->clinicalHistory()->firstOrNew(['patient_id' => $patient->id]);
        $odontogram = $patient->odontogramAssessments()->with(['creator:id,name', 'entries.findings'])->latest('assessed_at')->first();

        return Inertia::render('ClinicalHistory/Print', [
            'patient' => $patient->makeHidden(['medical_notes']),
            'clinicalHistory' => $clinicalHistory->makeHidden(['intake_updated_by', 'assessment_updated_by', 'reviewed_by']),
            'responsibleDentist' => User::query()->find($clinicalHistory->responsible_dentist_id, ['id', 'name', 'license_number']),
            'odontogram' => $odontogram ? [
                'assessed_at' => $odontogram->assessed_at->format('d/m/Y H:i'),
                'created_by' => $odontogram->creator?->name,
                'notes' => $odontogram->notes,
                'entries' => $odontogram->entries->map(fn ($entry): array => [
                    'tooth_number' => $entry->tooth_number,
                    'status' => $entry->status,
                    'notes' => $entry->notes,
                    'findings' => $entry->findings->map(fn ($finding): array => [
                        'surface' => $finding->surface,
                        'condition' => $finding->condition,
                        'severity' => $finding->severity,
                    ])->values()->all(),
                ])->values()->all(),
            ] : null,
        ]);
    }
}
