import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ClinicalHistory, PageProps, Patient } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

type ClinicalHistoryForm = {
    allergies: string;
    medical_conditions: string;
    current_medications: string;
    surgical_history: string;
    family_history: string;
    habits: string;
    clinical_notes: string;
};

export default function Edit({
    patient,
    clinicalHistory,
}: {
    patient: Pick<Patient, 'id' | 'first_name' | 'last_name'>;
    clinicalHistory: ClinicalHistory;
}) {
    const canEdit = usePage<PageProps>().props.auth.permissions.includes('clinical_history.update');
    const { data, setData, patch, processing, errors } = useForm<ClinicalHistoryForm>({
        allergies: clinicalHistory.allergies ?? '',
        medical_conditions: clinicalHistory.medical_conditions ?? '',
        current_medications: clinicalHistory.current_medications ?? '',
        surgical_history: clinicalHistory.surgical_history ?? '',
        family_history: clinicalHistory.family_history ?? '',
        habits: clinicalHistory.habits ?? '',
        clinical_notes: clinicalHistory.clinical_notes ?? '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        patch(route('clinical-history.update', patient.id));
    };

    const fields: Array<{ name: keyof ClinicalHistoryForm; label: string; rows: number }> = [
        { name: 'allergies', label: 'Alergias', rows: 3 },
        { name: 'medical_conditions', label: 'Condiciones medicas', rows: 3 },
        { name: 'current_medications', label: 'Medicamentos actuales', rows: 3 },
        { name: 'surgical_history', label: 'Antecedentes quirurgicos', rows: 3 },
        { name: 'family_history', label: 'Antecedentes familiares', rows: 3 },
        { name: 'habits', label: 'Habitos', rows: 3 },
        { name: 'clinical_notes', label: 'Notas clinicas', rows: 5 },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <p className="text-sm font-medium text-blue-600">Historia clinica</p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                        {patient.first_name} {patient.last_name}
                    </h1>
                </div>
            }
        >
            <Head title={`Historia clinica: ${patient.first_name} ${patient.last_name}`} />

            <div className="min-h-[calc(100vh-5rem)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl space-y-6">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-950">
                        Registra la informacion clinica relevante del paciente. Evita incluir datos que no sean necesarios para su atencion.
                    </div>

                    <form onSubmit={submit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Datos clinicos</h2>
                            <p className="mt-1 text-sm text-slate-500">La informacion se mantiene asociada al expediente del paciente.</p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            {fields.map((field) => (
                                <div key={field.name} className={field.name === 'clinical_notes' ? 'sm:col-span-2' : ''}>
                                    <InputLabel htmlFor={field.name} value={field.label} />
                                    <textarea
                                        id={field.name}
                                        rows={field.rows}
                                        placeholder=" "
                                        disabled={!canEdit}
                                        value={data[field.name]}
                                        onChange={(event) => setData(field.name, event.target.value)}
                                        className="block w-full rounded-2xl border-slate-300 shadow-sm"
                                    />
                                    <InputError message={errors[field.name]} className="mt-2" />
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            {canEdit && <PrimaryButton disabled={processing}>Guardar historia clínica</PrimaryButton>}
                            <Link
                                href={route('patients.show', patient.id)}
                                className="inline-flex items-center justify-center rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
                            >
                                Volver al paciente
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
