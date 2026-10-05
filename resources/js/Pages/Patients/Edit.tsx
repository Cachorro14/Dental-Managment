import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PatientForm from './Partials/PatientForm';
import { PageProps, Patient } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Edit({ patient }: { patient: Patient }) {
    const canViewPatients = usePage<PageProps>().props.auth.permissions.includes('patients.view');

    return <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Editar paciente</h2>}><Head title="Editar paciente" /><div className="py-12"><div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8"><div className="space-y-6 rounded-2xl bg-white p-6 shadow-sm sm:rounded-lg"><PatientForm patient={patient} />{canViewPatients && <Link href={route('patients.show', patient.id)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2">Cancelar</Link>}</div></div></div></AuthenticatedLayout>;
}
