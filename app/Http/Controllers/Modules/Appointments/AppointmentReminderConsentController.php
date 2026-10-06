<?php

namespace App\Http\Controllers\Modules\Appointments;

use App\Http\Controllers\Controller;
use App\Http\Requests\Modules\Appointments\UpdateAppointmentReminderConsentRequest;
use App\Models\Modules\Appointments\Appointment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class AppointmentReminderConsentController extends Controller
{
    public function update(UpdateAppointmentReminderConsentRequest $request, Appointment $appointment): RedirectResponse
    {
        $consentGiven = (bool) $request->validated('consent_given');

        DB::transaction(function () use ($appointment, $consentGiven, $request): void {
            $patient = $appointment->patient()->lockForUpdate()->firstOrFail();
            $patient->forceFill([
                'whatsapp_reminder_consent' => $consentGiven,
                'whatsapp_reminder_consent_recorded_by' => $consentGiven ? $request->user()->id : null,
            ])->save();

            DB::table('whatsapp_consent_audits')->insert([
                'patient_id' => $patient->id,
                'recorded_by' => $request->user()->id,
                'consent_given' => $consentGiven,
                'recorded_at' => now(),
            ]);
        });

        return back()->with('success', 'Consentimiento de WhatsApp actualizado.');
    }
}
