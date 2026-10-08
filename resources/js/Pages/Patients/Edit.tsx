import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ActionLink from '@/Components/ActionLink';
import PatientForm from './Partials/PatientForm';
import { PageProps, Patient } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Edit({ patient, canManageWhatsAppConsent = false, whatsappConsentRecordedBy }: { patient: Patient; canManageWhatsAppConsent?: boolean; whatsappConsentRecordedBy?: string | null }) {
    const { auth } = usePage<PageProps>().props;
    const canViewPatients = auth.permissions.includes('patients.view');

    return <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight theme-content">Editar paciente</h2>}><Head title="Editar paciente" /><div className="py-12"><div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8"><div className="space-y-6 rounded-2xl theme-card p-6 shadow-sm sm:rounded-lg"><PatientForm patient={patient} canManageWhatsAppConsent={canManageWhatsAppConsent} whatsappConsentRecordedBy={whatsappConsentRecordedBy} />{canViewPatients && <ActionLink href={route('patients.show', patient.id)} icon="close" variant="danger">Cancelar</ActionLink>}</div></div></div></AuthenticatedLayout>;
}
