import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { ClinicStaffAssignableRole, RoleSummary } from '@/types';
import StaffForm from './StaffForm';

type ClinicStaffUser = { id: number; name: string; email: string; phone: string | null; whatsapp_appointment_consent: boolean; whatsapp_appointment_consent_recorded_at?: string | null; roles: RoleSummary[] };

export default function Edit({ user, assignableRoles, canManageWhatsAppConsent = false, whatsappConsentRecordedBy }: { user: ClinicStaffUser; assignableRoles: ClinicStaffAssignableRole[]; canManageWhatsAppConsent?: boolean; whatsappConsentRecordedBy?: string | null }) {
    return <AuthenticatedLayout header={<div><p className="text-sm font-medium theme-content">Personal de la clínica</p><h1 className="mt-1 text-2xl font-semibold tracking-tight theme-content">Editar cuenta</h1></div>}><Head title={`Editar ${user.name}`} /><div className="min-h-[calc(100vh-5rem)] theme-page px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-4xl"><StaffForm user={user} assignableRoles={assignableRoles} canManageWhatsAppConsent={canManageWhatsAppConsent} whatsappConsentRecordedBy={whatsappConsentRecordedBy} /></div></div></AuthenticatedLayout>;
}
