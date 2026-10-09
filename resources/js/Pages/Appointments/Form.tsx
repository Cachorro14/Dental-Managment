import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import ToothLoader from '@/Components/ToothLoader';
import { Appointment, Patient } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type Props = {
    appointment?: Appointment;
    patients?: Pick<Patient, 'id' | 'first_name' | 'last_name'>[];
    dentists?: { id: number; name: string }[];
    isDentist: boolean;
};

export default function Form({ appointment, patients, dentists, isDentist }: Props) {
    const form = useForm({
        patient_id: appointment?.patient_id?.toString() ?? '',
        dentist_id: appointment?.dentist_id?.toString() ?? '',
        scheduled_at: appointment?.scheduled_at?.slice(0, 16) ?? '',
        duration_minutes: appointment?.duration_minutes?.toString() ?? '30',
        status: appointment?.status ?? 'scheduled',
        reason: appointment?.reason ?? '',
        notes: appointment?.notes ?? '',
    });
    const optionsLoaded = patients !== undefined && dentists !== undefined;

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const options = { onSuccess: () => form.reset() };
        appointment ? form.patch(route('appointments.update', appointment.id), options) : form.post(route('appointments.store'), options);
    };

    return (
        <form onSubmit={submit} className="space-y-6 rounded-lg theme-card p-6 shadow-sm">
            {!optionsLoaded && <div className="rounded-xl theme-page"><ToothLoader label="Cargando pacientes y dentistas" compact /></div>}
            {optionsLoaded && patients.length === 0 && <p className="rounded-xl theme-warning p-4 text-sm theme-content">No hay pacientes disponibles para tu cuenta. Solicita al administrador de la clínica que revise las asignaciones.</p>}
            <div><InputLabel htmlFor="patient_id" value="Paciente" /><select id="patient_id" disabled={!optionsLoaded} value={form.data.patient_id} onChange={(e) => form.setData('patient_id', e.target.value)} className="theme-content mt-1 block w-full rounded-xl border-outline-strong bg-surface-raised shadow-sm disabled:cursor-wait disabled:bg-surface-sunken"><option value="">Selecciona un paciente</option>{patients?.map((patient) => <option key={patient.id} value={patient.id}>{patient.last_name}, {patient.first_name}</option>)}</select>{form.errors.patient_id && <p className="theme-danger mt-1 rounded-md px-2 py-1 text-sm">{form.errors.patient_id}</p>}</div>
            {isDentist ? <p className="theme-info rounded-xl border p-4 text-sm">{appointment ? 'Esta cita conservará el dentista asignado.' : 'La nueva cita se asignará a tu cuenta como dentista.'}</p> : <div><InputLabel htmlFor="dentist_id" value="Dentista" /><select id="dentist_id" disabled={!optionsLoaded} value={form.data.dentist_id} onChange={(e) => form.setData('dentist_id', e.target.value)} className="theme-content mt-1 block w-full rounded-xl border-outline-strong bg-surface-raised disabled:cursor-wait disabled:bg-surface-sunken"><option value="">Sin asignar</option>{dentists?.map((dentist) => <option key={dentist.id} value={dentist.id}>{dentist.name}</option>)}</select></div>}
            <div className="grid gap-6 sm:grid-cols-3"><div><InputLabel htmlFor="scheduled_at" value="Fecha y hora" /><TextInput id="scheduled_at" type="datetime-local" value={form.data.scheduled_at} onChange={(e) => form.setData('scheduled_at', e.target.value)} className="mt-1 block w-full" required /></div><div><InputLabel htmlFor="duration_minutes" value="Duración (minutos)" /><TextInput id="duration_minutes" type="number" min="15" max="240" value={form.data.duration_minutes} onChange={(e) => form.setData('duration_minutes', e.target.value)} className="mt-1 block w-full" required /></div><div><InputLabel htmlFor="status" value="Estado" /><select id="status" value={form.data.status} onChange={(e) => form.setData('status', e.target.value as typeof form.data.status)} className="theme-content mt-1 block w-full rounded-xl border-outline-strong bg-surface-raised"><option value="scheduled">Programada</option><option value="confirmed">Confirmada</option><option value="completed">Completada</option><option value="cancelled">Cancelada</option></select></div></div>
            <div><InputLabel htmlFor="reason" value="Motivo" /><TextInput id="reason" value={form.data.reason} onChange={(e) => form.setData('reason', e.target.value)} className="mt-1 block w-full" /></div>
            <div><InputLabel htmlFor="notes" value="Notas" /><textarea id="notes" value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} className="theme-content mt-1 block w-full rounded-xl border-outline-strong bg-surface-raised" rows={4} /></div>
            <PrimaryButton icon={appointment ? 'save' : 'add'} disabled={form.processing || !optionsLoaded || patients?.length === 0}>{appointment ? 'Guardar cita' : 'Crear cita'}</PrimaryButton>
        </form>
    );
}
