<?php

namespace App\Http\Controllers\Modules\ClinicalHistory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Modules\ClinicalHistory\UpdateClinicalHistoryRequest;
use App\Models\Modules\Patients\Patient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ClinicalHistoryController extends Controller
{
    public function edit(Patient $patient): Response
    {
        Gate::authorize('view', $patient);

        $clinicalHistory = $patient->clinicalHistory()->firstOrNew([
            'patient_id' => $patient->id,
        ]);

        Gate::authorize('view', $clinicalHistory);

        return Inertia::render('ClinicalHistory/Edit', [
            'patient' => $patient->only(['id', 'first_name', 'last_name']),
            'clinicalHistory' => $clinicalHistory,
        ]);
    }

    public function update(UpdateClinicalHistoryRequest $request, Patient $patient): RedirectResponse
    {
        $clinicalHistory = $patient->clinicalHistory()->firstOrNew([
            'patient_id' => $patient->id,
        ]);

        Gate::authorize('update', $clinicalHistory);

        $clinicalHistory->fill($request->validated());
        $clinicalHistory->save();

        return redirect()->route('clinical-history.edit', $patient)
            ->with('status', 'Historia clinica actualizada.');
    }
}
