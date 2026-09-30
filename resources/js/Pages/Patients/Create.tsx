import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PatientForm from './Partials/PatientForm';
import { Head, Link } from '@inertiajs/react';

export default function Create() {
    return <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Nuevo paciente</h2>}><Head title="Nuevo paciente" /><div className="py-12"><div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8"><div className="bg-white p-6 shadow-sm sm:rounded-lg"><PatientForm /><Link href={route('patients.index')} className="mt-4 inline-block text-sm text-gray-600 underline">Cancelar</Link></div></div></div></AuthenticatedLayout>;
}
