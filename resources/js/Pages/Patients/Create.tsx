import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PatientForm from './Partials/PatientForm';
import { PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Create() {
    const { auth } = usePage<PageProps>().props;
    const canViewPatients = auth.permissions.includes('patients.view');
    const canManageWhatsAppConsent = auth.permissions.includes('patients.whatsapp_consent');

    return <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight theme-content">Nuevo paciente</h2>}><Head title="Nuevo paciente" /><div className="py-12"><div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8"><div className="theme-card p-6 shadow-sm sm:rounded-lg"><PatientForm canManageWhatsAppConsent={canManageWhatsAppConsent} />{canViewPatients && <Link href={route('patients.index')} className="mt-4 inline-block text-sm theme-content-secondary underline">Cancelar</Link>}</div></div></div></AuthenticatedLayout>;
}
