import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, Patient } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Show({ patient }: { patient: Patient }) {
    const { auth, system } = usePage<PageProps>().props;
    const { delete: destroy, processing } = useForm();
    const canUpdate = auth.permissions.includes('patients.update');
    const canDelete = auth.permissions.includes('patients.delete');
    const canAssignDentists = auth.permissions.includes('patients.assign_dentists');
    const canViewClinicalHistory = auth.permissions.includes('clinical_history.view') && system.modules.some((module) => module.code === 'CLINICAL_HISTORY' && module.enabled);
    const canViewOdontogram = auth.permissions.includes('odontogram.view') && system.modules.some((module) => module.code === 'ODONTOGRAM' && module.enabled);
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
        { label: 'Notas médicas', value: patient.medical_notes },
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
                            {canViewClinicalHistory && <Link href={route('clinical-history.edit', patient.id)} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Historia clínica</Link>}
                            {canViewOdontogram && <Link href={route('odontogram.edit', patient.id)} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white">Odontograma</Link>}
                            {canViewTreatments && <Link href={route('treatments.index', patient.id)} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white">Tratamientos</Link>}
                            {canViewBilling && <Link href={route('billing.show', patient.id)} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-white">Estado de cuenta</Link>}
                            {canDelete && <button type="button" onClick={remove} disabled={processing} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Archivar</button>}
                        </div>
                    </section>

                    <dl className="grid gap-6 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-2">
                        {details.map((detail) => <div key={detail.label} className={detail.label === 'Notas médicas' ? 'sm:col-span-2' : ''}><dt className="text-sm text-slate-500">{detail.label}</dt><dd className="mt-1 whitespace-pre-wrap text-slate-900">{detail.value || '-'}</dd></div>)}
                    </dl>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
