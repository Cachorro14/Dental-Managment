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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Appointment::class);
        $filters = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
        ]);
        $from = $filters['from'] ?? '';
        $to = $filters['to'] ?? '';
        $user = $request->user();

        return Inertia::render('Appointments/Index', [
            'appointments' => Inertia::defer(fn () => Appointment::query()
                ->with(['patient:id,first_name,last_name', 'dentist:id,name'])
                ->when(! $user->can('patients.view_all'), fn ($query) => $query->whereHas('patient.dentists', fn ($dentists) => $dentists->whereKey($user->id)))
                ->when($from !== '', fn ($query) => $query->whereDate('scheduled_at', '>=', $from))
                ->when($to !== '', fn ($query) => $query->whereDate('scheduled_at', '<=', $to))
                ->orderBy('scheduled_at')
                ->orderBy('id')
                ->paginate(15)
                ->withQueryString()),
            'filters' => ['from' => $from, 'to' => $to],
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Appointment::class);

        return Inertia::render('Appointments/Create', [
            'formOptions' => Inertia::defer(fn (): array => $this->formOptions(request()->user())),
            'isDentist' => request()->user()->isDentistOnly(),
        ]);
    }

    public function store(StoreAppointmentRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->user()->isDentistOnly()) {
            $data['dentist_id'] = $request->user()->id;
        }

        $appointment = Appointment::create($data);

        return redirect()->route('appointments.show', $appointment);
    }

    public function show(Appointment $appointment): Response
    {
        Gate::authorize('view', $appointment);
        $appointment->load([
            'patient' => fn ($query) => $query->with('whatsappConsentRecorder:id,name'),
            'dentist:id,name,phone,whatsapp_appointment_consent',
            'reminders.triggeredBy:id,name',
        ]);

        return Inertia::render('Appointments/Show', [
            'appointment' => $appointment->makeHidden([
                'patient.whatsapp_reminder_consent_recorded_by',
                'dentist.whatsapp_appointment_consent_recorded_by',
            ]),
            'canSendWhatsAppReminder' => request()->user()->can('sendReminder', $appointment)
                && $appointment->status === 'scheduled'
                && $appointment->scheduled_at->isFuture()
                && (bool) $appointment->patient?->whatsapp_reminder_consent
                && (bool) $appointment->patient?->phone
                && (bool) config('services.whatsapp.enabled'),
            'canManageWhatsAppConsent' => request()->user()->can('patients.whatsapp_consent'),
            'canNotifyDentistWhatsApp' => request()->user()->can('users.whatsapp_consent'),
            'patientConsentRecordedBy' => request()->user()->can('patients.whatsapp_consent')
                ? $appointment->patient->whatsappConsentRecorder?->name
                : null,
            'patientConsentAudit' => request()->user()->can('patients.whatsapp_consent')
                ? DB::table('whatsapp_consent_audits')->where('patient_id', $appointment->patient_id)->orderByDesc('recorded_at')->limit(5)->get(['consent_given', 'recorded_at', 'recorded_by'])
                : [],
            'whatsappAutomaticReminderEnabled' => (bool) config('services.whatsapp.automatic_reminders_enabled'),
        ]);
    }

    public function edit(Appointment $appointment): Response
    {
        Gate::authorize('update', $appointment);

        return Inertia::render('Appointments/Edit', [
            'appointment' => $appointment,
            'formOptions' => Inertia::defer(fn (): array => $this->formOptions(request()->user())),
            'isDentist' => request()->user()->isDentistOnly(),
        ]);
    }

    public function update(UpdateAppointmentRequest $request, Appointment $appointment): RedirectResponse
    {
        $data = $request->validated();

        if ($request->user()->isDentistOnly()) {
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
