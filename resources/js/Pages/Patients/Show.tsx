import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, Patient } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Show({ patient, patientActions }: { patient: Patient; patientActions: { update: boolean; assignDentists: boolean; questionnaire: boolean; clinicalHistory: boolean; odontogram: boolean } }) {
    const { auth, system } = usePage<PageProps>().props;
    const { delete: destroy, processing } = useForm();
    const canUpdate = patientActions.update;
    const canDelete = auth.permissions.includes('patients.delete');
    const canAssignDentists = patientActions.assignDentists;
    const clinicalHistoryEnabled = system.modules.some((module) => module.code === 'CLINICAL_HISTORY' && module.enabled);
    const canViewQuestionnaire = patientActions.questionnaire && clinicalHistoryEnabled;
    const canViewClinicalHistory = patientActions.clinicalHistory && clinicalHistoryEnabled;
    const canViewOdontogram = patientActions.odontogram && system.modules.some((module) => module.code === 'ODONTOGRAM' && module.enabled);
    const canViewTreatments = auth.permissions.includes('treatments.view') && system.modules.some((module) => module.code === 'TREATMENTS' && module.enabled);
    const canViewBilling = auth.permissions.includes('billing.view') && system.modules.some((module) => module.code === 'BILLING' && module.enabled);
    const remove = () => {
        if (window.confirm('Archivar este paciente?')) {
            destroy(route('patients.destroy', patient.id));
        }
    };

    const patientName = `${patient.first_name} ${patient.last_name}`;
    const details: Array<{ label: string; value: string | null }> = [
        { label: 'Fecha de nacimiento', value: patient.date_of_birth },
        { label: 'Sexo', value: patient.gender },
        { label: 'Teléfono', value: patient.phone },
        { label: 'Correo electrónico', value: patient.email },
        { label: 'Dirección', value: patient.address },
        { label: 'Contacto de emergencia', value: patient.emergency_contact_name },
        { label: 'Teléfono de emergencia', value: patient.emergency_contact_phone },
        { label: 'Documento', value: [patient.document_type, patient.document_number].filter(Boolean).join(' ') },
        { label: 'Celular', value: patient.mobile_phone },
        { label: 'Obra social', value: patient.insurance_provider },
        { label: 'Número de afiliación', value: patient.insurance_member_number },
        { label: 'Estado civil', value: patient.marital_status },
        { label: 'Nacionalidad', value: patient.nationality },
        { label: 'Profesión', value: patient.occupation },
        { label: 'Titular de cobertura', value: patient.insurance_holder },
        { label: 'Lugar de trabajo', value: patient.workplace },
        { label: 'Jerarquía o puesto', value: patient.job_title },
    ];

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-slate-800">Datos del paciente</h2>}>
            <Head title={patientName} />
            <div className="py-12">
                <div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8">
                    <section className="flex flex-col justify-between gap-5 rounded-2xl bg-white p-6 shadow-sm sm:flex-row sm:items-start">
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900">{patientName}</h1>
                            <p className="mt-1 text-sm text-slate-500">Paciente #{patient.id}</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {canUpdate && <Link href={route('patients.edit', patient.id)} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Editar</Link>}
                            {canAssignDentists && <Link href={route('patients.dentists.edit', patient.id)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-800">Asignar doctores</Link>}
                            {canViewQuestionnaire && <Link href={route('clinical-history.questionnaire', patient.id)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-800">Cuestionario paciente</Link>}
                            {canViewClinicalHistory && <Link href={route('clinical-history.edit', patient.id)} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Historia clínica</Link>}
                            {patientActions.odontogram && canViewOdontogram && <Link href={route('odontogram.edit', patient.id)} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white">Odontograma</Link>}
                            {canViewTreatments && <Link href={route('treatments.index', patient.id)} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white">Tratamientos</Link>}
                            {canViewBilling && <Link href={route('billing.show', patient.id)} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-white">Estado de cuenta</Link>}
                            {canDelete && <button type="button" onClick={remove} disabled={processing} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Archivar</button>}
                        </div>
                    </section>

                    <dl className="grid gap-6 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-2">
                        {details.map((detail) => <div key={detail.label}><dt className="text-sm text-slate-500">{detail.label}</dt><dd className="mt-1 whitespace-pre-wrap text-slate-900">{detail.value || '-'}</dd></div>)}
                    </dl>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
