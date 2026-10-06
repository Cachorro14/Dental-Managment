import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, RoleSummary } from '@/types';
import { Head } from '@inertiajs/react';
import UserForm from './UserForm';

type AdminUser = { id: number; name: string; email: string; phone: string | null; whatsapp_appointment_consent: boolean; whatsapp_appointment_consent_recorded_at?: string | null; roles: RoleSummary[] };
export default function Edit({ user, roles, canManageWhatsAppConsent = false, whatsappConsentRecordedBy }: PageProps<{ user: AdminUser; roles: RoleSummary[]; canManageWhatsAppConsent?: boolean; whatsappConsentRecordedBy?: string | null }>) { return <AuthenticatedLayout header={<div><p className="theme-accent text-sm font-medium">Administración</p><h1 className="mt-1 text-2xl font-semibold tracking-tight theme-content">Editar usuario</h1></div>}><Head title="Editar usuario" /><div className="min-h-[calc(100vh-5rem)] theme-page px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-4xl"><UserForm user={user} roles={roles} canManageWhatsAppConsent={canManageWhatsAppConsent} whatsappConsentRecordedBy={whatsappConsentRecordedBy} /></div></div></AuthenticatedLayout>; }
