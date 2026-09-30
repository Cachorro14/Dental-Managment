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

        return Inertia::render('Dashboard', [
            'dashboard' => [
                'patients' => $patientsEnabled && $user->can('patients.view') ? Patient::query()->count() : null,
                'appointmentsToday' => $appointmentsEnabled && $user->can('appointments.view') ? Appointment::query()->whereDate('scheduled_at', today())->count() : null,
                'pendingAppointments' => $appointmentsEnabled && $user->can('appointments.view') ? Appointment::query()->whereIn('status', ['scheduled', 'confirmed'])->where('scheduled_at', '>=', now())->count() : null,
                'upcoming' => $appointmentsEnabled && $user->can('appointments.view')
                    ? Appointment::query()->with('patient:id,first_name,last_name')->whereIn('status', ['scheduled', 'confirmed'])->where('scheduled_at', '>=', now())->orderBy('scheduled_at')->limit(5)->get(['id', 'patient_id', 'scheduled_at', 'status'])
                    : [],
            ],
        ]);
    }
}
