import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TreatmentForm, { TreatmentData } from '@/Pages/Treatments/TreatmentForm';
import { Head, Link } from '@inertiajs/react';

type PatientSummary = { id: number; first_name: string; last_name: string };

export default function Create({ patient }: { patient: PatientSummary }) {
    const patientName = `${patient.first_name} ${patient.last_name}`;
    const initialData: TreatmentData = { name: '', tooth_number: '', description: '', cost: '0.00', status: 'planned', scheduled_for: '', completed_at: '', notes: '' };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-slate-800">Registrar tratamiento</h2>}>
            <Head title="Nuevo tratamiento" />
            <div className="px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl space-y-5">
                    <div><p className="text-sm text-slate-500">Paciente: {patientName}</p><Link href={route('treatments.index', patient.id)} className="text-sm font-semibold text-indigo-700">Volver a tratamientos</Link></div>
                    <TreatmentForm initialData={initialData} submitLabel="Guardar tratamiento" action={route('treatments.store', patient.id)} method="post" />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
