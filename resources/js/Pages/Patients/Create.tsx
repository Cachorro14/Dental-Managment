import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ActionLink from '@/Components/ActionLink';
import PatientForm from './Partials/PatientForm';
import { PageProps } from '@/types';
import { Head, usePage } from '@inertiajs/react';

export default function Create() {
    const { auth } = usePage<PageProps>().props;
    const canViewPatients = auth.permissions.includes('patients.view');
    const canManageWhatsAppConsent = auth.permissions.includes('patients.whatsapp_consent');

    return <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight theme-content">Nuevo paciente</h2>}><Head title="Nuevo paciente" /><div className="py-12"><div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8"><div className="theme-card p-6 shadow-sm sm:rounded-lg"><PatientForm canManageWhatsAppConsent={canManageWhatsAppConsent} />{canViewPatients && <ActionLink href={route('patients.index')} icon="close" variant="danger" className="mt-4">Cancelar</ActionLink>}</div></div></div></AuthenticatedLayout>;
}
