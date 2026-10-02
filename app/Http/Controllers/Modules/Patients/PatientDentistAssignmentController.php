<?php

namespace App\Http\Controllers\Modules\Patients;

use App\Http\Controllers\Controller;
use App\Http\Requests\Modules\Patients\SyncPatientDentistsRequest;
use App\Models\Modules\Patients\Patient;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PatientDentistAssignmentController extends Controller
{
    public function edit(Patient $patient): Response
    {
        Gate::authorize('view', $patient);

        $dentists = User::role('DENTIST')->orderBy('name')->get(['id', 'name']);
        $assignedDentistIds = $patient->dentists()
            ->whereIn('users.id', $dentists->modelKeys())
            ->pluck('users.id')
            ->map(fn (int $dentistId): string => (string) $dentistId)
            ->all();

        return Inertia::render('Patients/AssignDentists', [
            'patient' => $patient->only(['id', 'first_name', 'last_name']),
            'dentists' => $dentists,
            'assignedDentistIds' => $assignedDentistIds,
        ]);
    }

    public function update(SyncPatientDentistsRequest $request, Patient $patient): RedirectResponse
    {
        DB::transaction(fn () => $patient->dentists()->sync($request->validated('dentists')));

        return redirect()->route('patients.show', $patient)
            ->with('status', 'Doctores asignados al paciente.');
    }
}
