import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PatientForm from './Partials/PatientForm';
import { Patient } from '@/types';
import { Head, Link } from '@inertiajs/react';

export default function Edit({ patient }: { patient: Patient }) {
    return <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Editar paciente</h2>}><Head title="Editar paciente" /><div className="py-12"><div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8"><div className="bg-white p-6 shadow-sm sm:rounded-lg"><PatientForm patient={patient} /><Link href={route('patients.show', patient.id)} className="mt-4 inline-block text-sm text-gray-600 underline">Cancelar</Link></div></div></div></AuthenticatedLayout>;
}
