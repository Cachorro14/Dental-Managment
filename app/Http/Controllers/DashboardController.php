<?php

namespace App\Http\Controllers;

use App\Core\Modules\ModuleManager;
use App\Models\Modules\Appointments\Appointment;
use App\Models\Modules\Patients\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private ModuleManager $modules) {}

    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $patientsEnabled = $this->modules->isEnabled('PATIENTS') && $this->modules->isAccessibleBy($user, 'PATIENTS');
        $appointmentsEnabled = $this->modules->isEnabled('APPOINTMENTS') && $this->modules->isAccessibleBy($user, 'APPOINTMENTS');
        $billingEnabled = $this->modules->isEnabled('BILLING')
            && $this->modules->isAccessibleBy($user, 'BILLING')
            && $user->can('billing.view')
            && ($user->can('patients.view_all') || $user->hasRole('DENTIST'));

        return Inertia::render('Dashboard', [
            'dashboard' => Inertia::defer(fn (): array => [
                'patients' => $patientsEnabled && $user->can('patients.view') ? Patient::query()->count() : null,
                'appointmentsToday' => $appointmentsEnabled && $user->can('appointments.view') ? Appointment::query()->whereDate('scheduled_at', today())->count() : null,
                'pendingAppointments' => $appointmentsEnabled && $user->can('appointments.view') ? Appointment::query()->whereIn('status', ['scheduled', 'confirmed'])->where('scheduled_at', '>=', now())->count() : null,
                'upcoming' => $appointmentsEnabled && $user->can('appointments.view')
                    ? Appointment::query()->with('patient:id,first_name,last_name')->whereIn('status', ['scheduled', 'confirmed'])->where('scheduled_at', '>=', now())->orderBy('scheduled_at')->limit(5)->get(['id', 'patient_id', 'scheduled_at', 'status'])
                    : [],
                'debtors' => $billingEnabled
                    ? Patient::query()
                        ->select('patients.id', 'patients.first_name', 'patients.last_name')
                        ->selectSub(function ($query): void {
                            $query->from('billing_entries')
                                ->selectRaw('COALESCE(SUM(amount), 0)')
                                ->whereColumn('billing_entries.patient_id', 'patients.id')
                                ->where('type', 'charge')
                                ->whereNull('voided_at');
                        }, 'charges_total')
                        ->selectSub(function ($query): void {
                            $query->from('billing_entries')
                                ->selectRaw('COALESCE(SUM(amount), 0)')
                                ->whereColumn('billing_entries.patient_id', 'patients.id')
                                ->where('type', 'payment')
                                ->whereNull('voided_at');
                        }, 'payments_total')
                        ->when(! $user->can('patients.view_all'), fn ($query) => $query->whereHas('dentists', fn ($dentists) => $dentists->whereKey($user->id)))
                        ->get(['id', 'first_name', 'last_name'])
                        ->map(fn (Patient $patient): array => [
                            'id' => $patient->id,
                            'first_name' => $patient->first_name,
                            'last_name' => $patient->last_name,
                            'balance' => bcsub((string) ($patient->charges_total ?? '0.00'), (string) ($patient->payments_total ?? '0.00'), 2),
                        ])
                        ->filter(fn (array $patient): bool => bccomp($patient['balance'], '0.00', 2) > 0)
                        ->sortByDesc('balance')
                        ->take(10)
                        ->values()
                    : null,
            ]),
        ]);
    }
}
