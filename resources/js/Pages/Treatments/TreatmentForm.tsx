import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

export type TreatmentData = {
    name: string;
    tooth_number: string;
    description: string;
    cost: string;
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
    scheduled_for: string;
    completed_at: string;
    notes: string;
};

export default function TreatmentForm({
    initialData,
    submitLabel,
    action,
    method,
}: {
    initialData: TreatmentData;
    submitLabel: string;
    action: string;
    method: 'post' | 'patch';
}) {
    const form = useForm<TreatmentData>(initialData);
    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (method === 'post') {
            form.post(action);
        } else {
            form.patch(action);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-5 rounded-2xl bg-white p-5 shadow-sm sm:p-7">
            <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <InputLabel htmlFor="name" value="Tratamiento" />
                    <TextInput id="name" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} className="mt-1 block w-full" required />
                    <InputError message={form.errors.name} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="tooth_number" value="Pieza dental (opcional, FDI)" />
                    <TextInput id="tooth_number" type="number" min="11" max="48" value={form.data.tooth_number} onChange={(event) => form.setData('tooth_number', event.target.value)} className="mt-1 block w-full" />
                    <InputError message={form.errors.tooth_number} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="cost" value="Costo" />
                    <TextInput id="cost" type="number" min="0" step="0.01" value={form.data.cost} onChange={(event) => form.setData('cost', event.target.value)} className="mt-1 block w-full" required />
                    <InputError message={form.errors.cost} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="status" value="Estado" />
                    <select id="status" value={form.data.status} onChange={(event) => form.setData('status', event.target.value as TreatmentData['status'])} className="mt-1 min-h-11 w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                        <option value="planned">Planeado</option><option value="in_progress">En curso</option><option value="completed">Completado</option><option value="cancelled">Cancelado</option>
                    </select>
                    <InputError message={form.errors.status} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="scheduled_for" value="Fecha programada" />
                    <TextInput id="scheduled_for" type="date" value={form.data.scheduled_for} onChange={(event) => form.setData('scheduled_for', event.target.value)} className="mt-1 block w-full" />
                    <InputError message={form.errors.scheduled_for} className="mt-2" />
                </div>
                {form.data.status === 'completed' && <div>
                    <InputLabel htmlFor="completed_at" value="Fecha de finalización" />
                    <TextInput id="completed_at" type="date" value={form.data.completed_at} onChange={(event) => form.setData('completed_at', event.target.value)} className="mt-1 block w-full" />
                    <InputError message={form.errors.completed_at} className="mt-2" />
                </div>}
                <div className="sm:col-span-2">
                    <InputLabel htmlFor="description" value="Descripción" />
                    <textarea id="description" value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} rows={3} className="mt-1 w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    <InputError message={form.errors.description} className="mt-2" />
                </div>
                <div className="sm:col-span-2">
                    <InputLabel htmlFor="notes" value="Notas clínicas" />
                    <textarea id="notes" value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} rows={3} className="mt-1 w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    <InputError message={form.errors.notes} className="mt-2" />
                </div>
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <PrimaryButton disabled={form.processing}>{submitLabel}</PrimaryButton>
            </div>
        </form>
    );
}
