import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ActionLink from '@/Components/ActionLink';
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
        <AuthenticatedLayout header={<div><p className="theme-accent text-sm font-medium">Asignación clínica</p><h1 className="mt-1 text-2xl font-semibold tracking-tight theme-content">{patient.first_name} {patient.last_name}</h1></div>}>
            <Head title={`Doctores de ${patient.first_name} ${patient.last_name}`} />
            <div className="min-h-[calc(100vh-5rem)] theme-page px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl space-y-6">
                    <div className="theme-info rounded-2xl border p-5 text-sm leading-6">
                        Selecciona los doctores que pueden consultar el expediente y agendar citas para este paciente. Puedes asignar varios.
                    </div>
                    <form onSubmit={submit} className="space-y-5 rounded-2xl border theme-outline theme-card p-5 shadow-sm sm:p-7">
                        <div>
                            <h2 className="text-lg font-semibold theme-content">Doctores asignados</h2>
                            <p className="mt-1 text-sm theme-content-muted">Sin asignación, los doctores no podrán acceder al expediente.</p>
                        </div>
                        {dentists.length === 0 ? (
                            <p className="rounded-xl theme-page p-4 text-sm theme-content-secondary">No hay usuarios con el rol de dentista.</p>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {dentists.map((dentist) => <label key={dentist.id} className="flex min-h-12 items-center gap-3 rounded-xl border theme-outline px-4 py-3 text-sm theme-content-secondary transition hover:border-accent hover:bg-surface-sunken">
                                    <input type="checkbox" checked={form.data.dentists.includes(String(dentist.id))} onChange={() => toggleDentist(String(dentist.id))} className="rounded border-outline-strong text-accent focus:ring-accent" />
                                    <span>{dentist.name}</span>
                                </label>)}
                            </div>
                        )}
                        <InputError message={form.errors.dentists} />
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <PrimaryButton disabled={form.processing}>Guardar asignación</PrimaryButton>
                            <ActionLink href={route('patients.show', patient.id)} icon="arrow-left" variant="info">Volver al paciente</ActionLink>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
