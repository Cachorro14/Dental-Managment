import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PatientForm from './Partials/PatientForm';
import { PageProps, Patient } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Edit({ patient, canManageWhatsAppConsent = false, whatsappConsentRecordedBy }: { patient: Patient; canManageWhatsAppConsent?: boolean; whatsappConsentRecordedBy?: string | null }) {
    const { auth } = usePage<PageProps>().props;
    const canViewPatients = auth.permissions.includes('patients.view');

    return <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight theme-content">Editar paciente</h2>}><Head title="Editar paciente" /><div className="py-12"><div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8"><div className="space-y-6 rounded-2xl theme-card p-6 shadow-sm sm:rounded-lg"><PatientForm patient={patient} canManageWhatsAppConsent={canManageWhatsAppConsent} whatsappConsentRecordedBy={whatsappConsentRecordedBy} />{canViewPatients && <Link href={route('patients.show', patient.id)} className="inline-flex min-h-11 items-center justify-center rounded-xl border theme-outline-strong theme-card px-4 py-2 text-sm font-semibold theme-content-secondary shadow-sm transition hover:border-accent hover:bg-surface-sunken focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2">Cancelar</Link>}</div></div></div></AuthenticatedLayout>;
}
