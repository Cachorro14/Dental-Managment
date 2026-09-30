import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Appointment, Patient } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type Props = {
    appointment?: Appointment;
    patients: Pick<Patient, 'id' | 'first_name' | 'last_name'>[];
    dentists: { id: number; name: string }[];
};

export default function Form({ appointment, patients, dentists }: Props) {
    const form = useForm({
        patient_id: appointment?.patient_id?.toString() ?? '',
        dentist_id: appointment?.dentist_id?.toString() ?? '',
        scheduled_at: appointment?.scheduled_at?.slice(0, 16) ?? '',
        duration_minutes: appointment?.duration_minutes?.toString() ?? '30',
        status: appointment?.status ?? 'scheduled',
        reason: appointment?.reason ?? '',
        notes: appointment?.notes ?? '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const options = { onSuccess: () => form.reset() };
        appointment ? form.patch(route('appointments.update', appointment.id), options) : form.post(route('appointments.store'), options);
    };

    return (
        <form onSubmit={submit} className="space-y-6 rounded-lg bg-white p-6 shadow-sm">
            <div><InputLabel htmlFor="patient_id" value="Paciente" /><select id="patient_id" value={form.data.patient_id} onChange={(e) => form.setData('patient_id', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"><option value="">Selecciona un paciente</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.last_name}, {patient.first_name}</option>)}</select>{form.errors.patient_id && <p className="mt-1 text-sm text-red-600">{form.errors.patient_id}</p>}</div>
            <div><InputLabel htmlFor="dentist_id" value="Dentista" /><select id="dentist_id" value={form.data.dentist_id} onChange={(e) => form.setData('dentist_id', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"><option value="">Sin asignar</option>{dentists.map((dentist) => <option key={dentist.id} value={dentist.id}>{dentist.name}</option>)}</select></div>
            <div className="grid gap-6 sm:grid-cols-3"><div><InputLabel htmlFor="scheduled_at" value="Fecha y hora" /><TextInput id="scheduled_at" type="datetime-local" value={form.data.scheduled_at} onChange={(e) => form.setData('scheduled_at', e.target.value)} className="mt-1 block w-full" required /></div><div><InputLabel htmlFor="duration_minutes" value="Duracion (minutos)" /><TextInput id="duration_minutes" type="number" min="15" max="240" value={form.data.duration_minutes} onChange={(e) => form.setData('duration_minutes', e.target.value)} className="mt-1 block w-full" required /></div><div><InputLabel htmlFor="status" value="Estado" /><select id="status" value={form.data.status} onChange={(e) => form.setData('status', e.target.value as typeof form.data.status)} className="mt-1 block w-full"><option value="scheduled">Programada</option><option value="confirmed">Confirmada</option><option value="completed">Completada</option><option value="cancelled">Cancelada</option></select></div></div>
            <div><InputLabel htmlFor="reason" value="Motivo" /><TextInput id="reason" value={form.data.reason} onChange={(e) => form.setData('reason', e.target.value)} className="mt-1 block w-full" /></div>
            <div><InputLabel htmlFor="notes" value="Notas" /><textarea id="notes" value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" rows={4} /></div>
            <PrimaryButton disabled={form.processing}>{appointment ? 'Guardar cita' : 'Crear cita'}</PrimaryButton>
        </form>
    );
}
