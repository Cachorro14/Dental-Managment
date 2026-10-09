import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ActionButton from '@/Components/ActionButton';
import ActionLink from '@/Components/ActionLink';
import { Appointment, PageProps } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';

const statusLabels: Record<Appointment['status'], string> = {
    scheduled: 'Programada',
    confirmed: 'Confirmada',
    completed: 'Completada',
    cancelled: 'Cancelada',
};

export default function Show({ appointment, canSendWhatsAppReminder = false, canManageWhatsAppConsent = false, canNotifyDentistWhatsApp = false, patientConsentRecordedBy, patientConsentAudit = [], whatsappAutomaticReminderEnabled = false }: PageProps<{ appointment: Appointment; canSendWhatsAppReminder?: boolean; canManageWhatsAppConsent?: boolean; canNotifyDentistWhatsApp?: boolean; patientConsentRecordedBy?: string | null; patientConsentAudit?: Array<{ consent_given: boolean; recorded_at: string; recorded_by: number | null }>; whatsappAutomaticReminderEnabled?: boolean }>) {
    const permissions = usePage<PageProps>().props.auth.permissions;
    const canUpdate = permissions.includes('appointments.update');
    const canDelete = permissions.includes('appointments.delete');
    const canSendReminder = canSendWhatsAppReminder;
    const canNotifyDentist = canNotifyDentistWhatsApp && Boolean(appointment.dentist?.phone && appointment.dentist?.whatsapp_appointment_consent);
    const consentForm = useForm({ consent_given: Boolean(appointment.patient?.whatsapp_reminder_consent) });
    const changePatientConsent = (consentGiven: boolean) => {
        consentForm.setData('consent_given', consentGiven);
        consentForm.patch(route('appointments.reminders.whatsapp.consent.update', appointment.id), {
            preserveScroll: true,
            onError: () => consentForm.setData('consent_given', Boolean(appointment.patient?.whatsapp_reminder_consent)),
        });
    };
    const remove = () => {
        if (window.confirm('¿Eliminar esta cita?')) {
            router.delete(route('appointments.destroy', appointment.id));
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight theme-content-secondary">Detalle de la cita</h2>}>
            <Head title="Detalle de la cita" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8">
                    {(canUpdate || canDelete) && <div className="flex flex-wrap justify-end gap-3">
                        {canUpdate && <ActionLink href={route('appointments.edit', appointment.id)} icon="edit" variant="accent">Editar</ActionLink>}
                        {canDelete && <ActionButton type="button" onClick={remove} icon="trash" variant="danger">Eliminar</ActionButton>}
                    </div>}
                    <dl className="space-y-4 rounded-2xl theme-card p-6 shadow-sm">
                        <div><dt className="text-sm theme-content-muted">Paciente</dt><dd className="mt-1 text-lg font-semibold theme-content">{appointment.patient?.first_name} {appointment.patient?.last_name}</dd></div>
                        <div><dt className="text-sm theme-content-muted">Fecha</dt><dd className="mt-1 theme-content">{new Date(appointment.scheduled_at).toLocaleString('es-MX')}</dd></div>
                        <div><dt className="text-sm theme-content-muted">Duración</dt><dd className="mt-1 theme-content">{appointment.duration_minutes} minutos</dd></div>
                        <div><dt className="text-sm theme-content-muted">Dentista</dt><dd className="mt-1 theme-content">{appointment.dentist?.name ?? 'Sin asignar'}</dd></div>
                        <div><dt className="text-sm theme-content-muted">Estado</dt><dd className="mt-1 theme-content">{statusLabels[appointment.status]}</dd></div>
                        <div><dt className="text-sm theme-content-muted">Motivo</dt><dd className="mt-1 theme-content">{appointment.reason ?? '-'}</dd></div>
                        <div><dt className="text-sm theme-content-muted">Notas</dt><dd className="mt-1 whitespace-pre-wrap theme-content">{appointment.notes ?? '-'}</dd></div>
                    </dl>
                    <section className="theme-card space-y-4 rounded-2xl border theme-outline p-5 shadow-sm sm:p-6">
                        <div><h2 className="text-lg font-bold theme-content">Notificaciones por WhatsApp</h2><p className="mt-1 text-sm theme-content-secondary">Solo se usan para comunicaciones operativas de esta cita.</p></div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="theme-success rounded-xl border p-4"><p className="font-semibold">Paciente</p><p className="mt-1 text-sm">Teléfono: {appointment.patient?.phone || 'No registrado'}</p>{canManageWhatsAppConsent ? <label className="mt-3 flex min-h-11 items-start gap-3 text-sm"><input type="checkbox" checked={Boolean(appointment.patient?.whatsapp_reminder_consent)} disabled={consentForm.processing} onChange={(event) => changePatientConsent(event.target.checked)} className="mt-1 rounded border-current focus:ring-2 focus:ring-accent" /><span>Consentimiento físico registrado para recordatorios de citas por WhatsApp.</span></label> : <p className="mt-1 text-sm">Consentimiento físico: {appointment.patient?.whatsapp_reminder_consent ? 'Registrado' : 'No registrado'}</p>}{patientConsentRecordedBy && <p className="mt-2 text-xs">Último registro efectuado por {patientConsentRecordedBy}.</p>}{consentForm.errors.consent_given && <p className="theme-danger mt-2 border-0 bg-transparent p-0 text-sm">{consentForm.errors.consent_given}</p>}{patientConsentAudit.length > 0 && <ul className="mt-3 space-y-1 border-t border-current/20 pt-3 text-xs">{patientConsentAudit.map((audit, index) => <li key={`${audit.recorded_at}-${index}`}>{audit.consent_given ? 'Autorizó' : 'Revocó'} · {new Date(audit.recorded_at).toLocaleString('es-MX')}</li>)}</ul>}</div>
                            <div className="theme-info rounded-xl border p-4"><p className="font-semibold">Dentista asignado</p><p className="mt-1 text-sm">{appointment.dentist?.name ?? 'Sin asignar'} · {appointment.dentist?.phone ?? 'Sin teléfono WhatsApp'}</p><p className="mt-1 text-sm">Consentimiento físico: {appointment.dentist?.whatsapp_appointment_consent ? 'Registrado' : 'No registrado'}</p>{canNotifyDentistWhatsApp && <p className="mt-2 text-xs">El teléfono y el consentimiento se administran en la cuenta del personal.</p>}</div>
                        </div>
                        <ActionButton type="button" disabled={!canSendReminder} onClick={() => router.post(route('appointments.reminders.whatsapp.store', appointment.id))} icon="send" variant="accent">Enviar recordatorio al paciente</ActionButton>
                        {!canSendReminder && <p className="theme-content-secondary text-sm">El envío requiere que los recordatorios estén habilitados, permiso, consentimiento físico vigente, teléfono y cita programada en el futuro.</p>}
                        {whatsappAutomaticReminderEnabled && <p className="text-sm theme-content-secondary">Recordatorio automático configurado para aproximadamente 24 horas antes; se volverán a comprobar consentimiento y teléfono al enviarlo.</p>}
                        {canNotifyDentist && <p className="theme-info rounded-lg border px-3 py-2 text-sm">El dentista puede recibir una notificación cuando el paciente confirme su asistencia.</p>}
                        {appointment.reminders && appointment.reminders.length > 0 && <div><h3 className="font-semibold theme-content">Historial de envíos</h3><ul className="mt-2 divide-y divide-outline">{appointment.reminders.map((reminder) => <li key={reminder.id} className="py-2 text-sm theme-content-secondary">{reminder.recipient_type === 'patient' ? 'Paciente' : 'Dentista'} · {reminder.automatic ? 'Automático' : 'Manual'} · {reminder.recipient_phone} · {reminder.status === 'sent' ? 'Enviado' : reminder.status === 'failed' ? 'Falló' : 'En cola'}{reminder.sent_at ? ` · ${new Date(reminder.sent_at).toLocaleString('es-MX')}` : ''}{reminder.reply_received_at && <span className="theme-success mt-1 block rounded-md px-2 py-1">Respuesta: {reminder.reply_text} · {new Date(reminder.reply_received_at).toLocaleString('es-MX')}</span>}{reminder.failure_reason && <span className="theme-danger mt-1 block rounded-md px-2 py-1">{reminder.failure_reason}</span>}</li>)}</ul></div>}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
