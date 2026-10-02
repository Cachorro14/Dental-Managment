<?php

namespace App\Http\Controllers\Modules\Appointments;

use App\Http\Controllers\Controller;
use App\Http\Requests\Modules\Appointments\StoreAppointmentRequest;
use App\Http\Requests\Modules\Appointments\UpdateAppointmentRequest;
use App\Models\Modules\Appointments\Appointment;
use App\Models\Modules\Patients\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Appointment::class);
        $date = $request->string('date')->trim()->toString();
        $user = $request->user();

        return Inertia::render('Appointments/Index', [
            'appointments' => Inertia::defer(fn () => Appointment::query()
                ->with(['patient:id,first_name,last_name', 'dentist:id,name'])
                ->when(! $user->can('patients.view_all'), fn ($query) => $query->whereHas('patient.dentists', fn ($dentists) => $dentists->whereKey($user->id)))
                ->when($date !== '', fn ($query) => $query->whereDate('scheduled_at', $date))
                ->orderBy('scheduled_at')
                ->orderBy('id')
                ->paginate(15)
                ->withQueryString()),
            'filters' => ['date' => $date],
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Appointment::class);

        return Inertia::render('Appointments/Create', [
            'formOptions' => Inertia::defer(fn (): array => $this->formOptions(request()->user())),
            'isDentist' => request()->user()->hasRole('DENTIST'),
        ]);
    }

    public function store(StoreAppointmentRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->user()->hasRole('DENTIST')) {
            $data['dentist_id'] = $request->user()->id;
        }

        $appointment = Appointment::create($data);

        return redirect()->route('appointments.show', $appointment);
    }

    public function show(Appointment $appointment): Response
    {
        Gate::authorize('view', $appointment);
        $appointment->load(['patient', 'dentist:id,name']);

        return Inertia::render('Appointments/Show', ['appointment' => $appointment]);
    }

    public function edit(Appointment $appointment): Response
    {
        Gate::authorize('update', $appointment);

        return Inertia::render('Appointments/Edit', [
            'appointment' => $appointment,
            'formOptions' => Inertia::defer(fn (): array => $this->formOptions(request()->user())),
            'isDentist' => request()->user()->hasRole('DENTIST'),
        ]);
    }

    public function update(UpdateAppointmentRequest $request, Appointment $appointment): RedirectResponse
    {
        $data = $request->validated();

        if ($request->user()->hasRole('DENTIST')) {
            $data['dentist_id'] = $appointment->dentist_id;
        }

        $appointment->update($data);

        return redirect()->route('appointments.show', $appointment);
    }

    public function destroy(Appointment $appointment): RedirectResponse
    {
        Gate::authorize('delete', $appointment);
        $appointment->delete();

        return redirect()->route('appointments.index');
    }

    /** @return array{patients: Collection, dentists: Collection} */
    private function formOptions(User $user): array
    {
        $patients = Patient::query()
            ->when(! $user->can('patients.view_all'), fn ($query) => $query->whereHas('dentists', fn ($dentists) => $dentists->whereKey($user->id)))
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name']);

        return [
            'patients' => $patients,
            'dentists' => User::role('DENTIST')->orderBy('name')->get(['id', 'name']),
        ];
    }
}
