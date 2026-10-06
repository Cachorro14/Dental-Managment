import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TreatmentForm, { TreatmentData } from '@/Pages/Treatments/TreatmentForm';
import { Head, Link } from '@inertiajs/react';

type PatientSummary = { id: number; first_name: string; last_name: string };
type TreatmentRecord = Omit<TreatmentData, 'tooth_number' | 'completed_at' | 'scheduled_for' | 'description' | 'notes'> & {
    id: number;
    completed_at: string | null;
    tooth_number: number | null;
    scheduled_for: string | null;
    description: string | null;
    notes: string | null;
};

export default function Edit({ patient, treatment }: { patient: PatientSummary; treatment: TreatmentRecord }) {
    const patientName = `${patient.first_name} ${patient.last_name}`;
    const initialData: TreatmentData = {
        name: treatment.name,
        tooth_number: treatment.tooth_number?.toString() ?? '',
        description: treatment.description ?? '',
        cost: treatment.cost,
        status: treatment.status,
        scheduled_for: treatment.scheduled_for ?? '',
        completed_at: treatment.completed_at ?? '',
        notes: treatment.notes ?? '',
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold theme-content-secondary">Editar tratamiento</h2>}>
            <Head title="Editar tratamiento" />
            <div className="px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl space-y-5">
                    <div><p className="text-sm theme-content-muted">Paciente: {patientName}</p><Link href={route('treatments.index', patient.id)} className="text-sm font-semibold theme-content">Volver a tratamientos</Link></div>
                    <TreatmentForm initialData={initialData} submitLabel="Guardar cambios" action={route('treatments.update', [patient.id, treatment.id])} method="patch" />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
