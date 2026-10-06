<?php

namespace App\Http\Controllers\Modules\Appointments;

use App\Core\WhatsApp\ManualAppointmentReminder;
use App\Http\Controllers\Controller;
use App\Http\Requests\Modules\Appointments\SendAppointmentReminderRequest;
use App\Models\Modules\Appointments\Appointment;
use Illuminate\Http\RedirectResponse;
use Throwable;

class AppointmentReminderController extends Controller
{
    public function store(
        SendAppointmentReminderRequest $request,
        Appointment $appointment,
        ManualAppointmentReminder $reminder,
    ): RedirectResponse {
        abort_unless(config('services.whatsapp.enabled'), 404);

        try {
            $reminder->sendPatientReminder($appointment, $request->user());
        } catch (Throwable $exception) {
            report($exception);

            return back()->withErrors([
                'whatsapp' => $exception instanceof \DomainException
                    ? $exception->getMessage()
                    : 'No se pudo enviar el recordatorio. El intento quedó registrado; inténtalo de nuevo más tarde.',
            ]);
        }

        return back()->with('success', 'Recordatorio de WhatsApp enviado al paciente.');
    }
}
