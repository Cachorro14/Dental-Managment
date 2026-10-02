<?php

namespace App\Http\Controllers\Modules\Patients;

use App\Http\Controllers\Controller;
use App\Http\Requests\Modules\Patients\StorePatientRequest;
use App\Http\Requests\Modules\Patients\UpdatePatientRequest;
use App\Models\Modules\Patients\Patient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Patient::class);

        $search = $request->string('search')->trim()->toString();

        $user = $request->user();

        return Inertia::render('Patients/Index', [
            'patients' => Inertia::defer(fn () => Patient::query()
                ->when(! $user->can('patients.view_all'), fn ($query) => $query->whereHas('dentists', fn ($dentists) => $dentists->whereKey($user->id)))
                ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search): void {
                    $query->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                }))
                ->orderBy('last_name')
                ->orderBy('first_name')
                ->paginate(15)
                ->withQueryString()),
            'filters' => ['search' => $search],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        Gate::authorize('create', Patient::class);

        return Inertia::render('Patients/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePatientRequest $request): RedirectResponse
    {
        $patient = DB::transaction(function () use ($request): Patient {
            $patient = Patient::create($request->validated());
            $user = $request->user();

            if ($user->hasRole('DENTIST')) {
                $patient->dentists()->attach($user->id);
            }

            return $patient;
        });

        return redirect()->route('patients.show', $patient);
    }

    /**
     * Display the specified resource.
     */
    public function show(Patient $patient): Response
    {
        Gate::authorize('view', $patient);

        return Inertia::render('Patients/Show', ['patient' => $patient]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Patient $patient): Response
    {
        Gate::authorize('update', $patient);

        return Inertia::render('Patients/Edit', ['patient' => $patient]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePatientRequest $request, Patient $patient): RedirectResponse
    {
        $patient->update($request->validated());

        return redirect()->route('patients.show', $patient);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Patient $patient): RedirectResponse
    {
        Gate::authorize('delete', $patient);
        $patient->delete();

        return redirect()->route('patients.index');
    }
}
