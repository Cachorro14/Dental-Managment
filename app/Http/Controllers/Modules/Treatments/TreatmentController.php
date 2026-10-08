<?php

namespace App\Http\Controllers\Modules\Treatments;

use App\Http\Controllers\Controller;
use App\Http\Requests\Modules\Treatments\StoreTreatmentRequest;
use App\Http\Requests\Modules\Treatments\UpdateTreatmentRequest;
use App\Models\Modules\Patients\Patient;
use App\Models\Modules\Treatments\Treatment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TreatmentController extends Controller
{
    public function index(Patient $patient): Response
    {
        Gate::authorize('viewAny', [Treatment::class, $patient]);

        return Inertia::render('Treatments/Index', [
            'patient' => $patient->only(['id', 'first_name', 'last_name']),
            'treatments' => Inertia::defer(fn () => $patient->treatments()
                ->with('dentist:id,name')
                ->latest()
                ->paginate(15)
                ->withQueryString()),
            'canCreate' => request()->user()->can('treatments.create'),
            'canUpdate' => request()->user()->can('treatments.update'),
        ]);
    }

    public function create(Patient $patient): Response
    {
        Gate::authorize('create', [Treatment::class, $patient]);

        return Inertia::render('Treatments/Create', [
            'patient' => $patient->only(['id', 'first_name', 'last_name']),
        ]);
    }

    public function store(StoreTreatmentRequest $request, Patient $patient): RedirectResponse
    {
        $data = $request->validated();
        $data['dentist_id'] = $request->user()->isDentistOnly() ? $request->user()->id : null;
        $data['created_by'] = $request->user()->id;
        $data['completed_at'] = $data['status'] === 'completed' ? today() : null;

        $treatment = $patient->treatments()->create($data);

        return redirect()->route('treatments.index', $patient)
            ->with('status', 'Tratamiento registrado correctamente.');
    }

    public function edit(Patient $patient, Treatment $treatment): Response
    {
        Gate::authorize('view', $treatment);

        return Inertia::render('Treatments/Edit', [
            'patient' => $patient->only(['id', 'first_name', 'last_name']),
            'treatment' => $treatment,
        ]);
    }

    public function update(UpdateTreatmentRequest $request, Patient $patient, Treatment $treatment): RedirectResponse
    {
        $data = $request->validated();
        $data['completed_at'] = $data['status'] === 'completed'
            ? ($data['completed_at'] ?? $treatment->completed_at ?? today())
            : null;

        $treatment->update($data);

        return redirect()->route('treatments.index', $patient)
            ->with('status', 'Tratamiento actualizado correctamente.');
    }
}
