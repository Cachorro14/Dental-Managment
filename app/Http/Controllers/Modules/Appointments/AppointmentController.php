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

        $appointments = Appointment::query()
            ->with(['patient:id,first_name,last_name', 'dentist:id,name'])
            ->when($date !== '', fn ($query) => $query->whereDate('scheduled_at', $date))
            ->orderBy('scheduled_at')
            ->orderBy('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Appointments/Index', [
            'appointments' => $appointments,
            'filters' => ['date' => $date],
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Appointment::class);

        return Inertia::render('Appointments/Create', $this->formOptions());
    }

    public function store(StoreAppointmentRequest $request): RedirectResponse
    {
        $appointment = Appointment::create($request->validated());

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
            ...$this->formOptions(),
        ]);
    }

    public function update(UpdateAppointmentRequest $request, Appointment $appointment): RedirectResponse
    {
        $appointment->update($request->validated());

        return redirect()->route('appointments.show', $appointment);
    }

    public function destroy(Appointment $appointment): RedirectResponse
    {
        Gate::authorize('delete', $appointment);
        $appointment->delete();

        return redirect()->route('appointments.index');
    }

    /** @return array{patients: Collection, dentists: Collection} */
    private function formOptions(): array
    {
        return [
            'patients' => Patient::query()->orderBy('last_name')->orderBy('first_name')->get(['id', 'first_name', 'last_name']),
            'dentists' => User::role('DENTIST')->orderBy('name')->get(['id', 'name']),
        ];
    }
}
