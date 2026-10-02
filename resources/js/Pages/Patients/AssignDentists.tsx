import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DentistSummary, Patient } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

export default function AssignDentists({
    patient,
    dentists,
    assignedDentistIds,
}: {
    patient: Pick<Patient, 'id' | 'first_name' | 'last_name'>;
    dentists: DentistSummary[];
    assignedDentistIds: string[];
}) {
    const form = useForm<{ dentists: string[] }>({ dentists: assignedDentistIds });
    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.put(route('patients.dentists.update', patient.id));
    };

    const toggleDentist = (dentistId: string) => {
        form.setData('dentists', form.data.dentists.includes(dentistId)
            ? form.data.dentists.filter((assignedId) => assignedId !== dentistId)
            : [...form.data.dentists, dentistId]);
    };

    return (
        <AuthenticatedLayout header={<div><p className="text-sm font-medium text-blue-600">Asignación clínica</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{patient.first_name} {patient.last_name}</h1></div>}>
            <Head title={`Doctores de ${patient.first_name} ${patient.last_name}`} />
            <div className="min-h-[calc(100vh-5rem)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl space-y-6">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm leading-6 text-blue-950">
                        Selecciona los doctores que pueden consultar el expediente y agendar citas para este paciente. Puedes asignar varios.
                    </div>
                    <form onSubmit={submit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Doctores asignados</h2>
                            <p className="mt-1 text-sm text-slate-500">Sin asignación, los doctores no podrán acceder al expediente.</p>
                        </div>
                        {dentists.length === 0 ? (
                            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No hay usuarios con el rol de dentista.</p>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {dentists.map((dentist) => <label key={dentist.id} className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:border-blue-300 hover:bg-blue-50">
                                    <input type="checkbox" checked={form.data.dentists.includes(String(dentist.id))} onChange={() => toggleDentist(String(dentist.id))} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                    <span>{dentist.name}</span>
                                </label>)}
                            </div>
                        )}
                        <InputError message={form.errors.dentists} />
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <PrimaryButton disabled={form.processing}>Guardar asignación</PrimaryButton>
                            <Link href={route('patients.show', patient.id)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-800 transition hover:bg-blue-50">Volver al paciente</Link>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
