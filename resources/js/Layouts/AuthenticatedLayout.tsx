import ClinicMark from '@/Components/ClinicMark';
import NavigationLoader from '@/Components/NavigationLoader';
import Sidebar from '@/Components/Sidebar';
import { PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

export default function Authenticated({ header, children }: PropsWithChildren<{ header?: ReactNode }>) {
    const { auth, system, branding } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const user = auth.user;

    if (!user) {
        return null;
    }

    const canViewPatientRecords = auth.permissions.includes('patients.view_all') || auth.roles.includes('DENTIST');
    const canViewPatients = auth.permissions.includes('patients.view') && canViewPatientRecords && system.modules.some((module) => module.code === 'PATIENTS' && module.enabled);
    const canViewAuditLog = auth.permissions.includes('audit.view');
    const canViewAppointments = auth.permissions.includes('appointments.view') && canViewPatientRecords && system.modules.some((module) => module.code === 'APPOINTMENTS' && module.enabled);
    const canManageModules = auth.permissions.includes('modules.view');
    const canManageBranding = auth.permissions.includes('branding.view');
    const canManageClinicStaff = auth.roles.includes('CLINIC_ADMIN')
        && auth.permissions.includes('clinic_staff.view')
        && system.modules.some((module) => module.code === 'CLINIC_STAFF' && module.enabled);
    const canViewUsers = auth.permissions.includes('users.view');
    const canViewRoles = auth.permissions.includes('roles.view');
    const canManageUsers = auth.roles.includes('SUPER_ADMIN') && (canViewUsers || canViewRoles) && system.modules.some((module) => module.code === 'USER_MANAGEMENT' && module.enabled);
    const navigation = [
        { label: 'Panel principal', href: route('dashboard'), active: route().current('dashboard'), icon: 'dashboard' as const },
        ...(canViewPatients ? [{ label: 'Pacientes', href: route('patients.index'), active: route().current('patients.*'), icon: 'patients' as const }] : []),
        ...(canViewAppointments ? [{ label: 'Citas', href: route('appointments.index'), active: route().current('appointments.*'), icon: 'appointments' as const }] : []),
        ...(canViewAuditLog ? [{ label: 'Auditoria', href: route('audit.index'), active: route().current('audit.*'), icon: 'audit' as const }] : []),
        ...(canManageModules ? [{ label: 'Modulos', href: route('admin.modules.index'), active: route().current('admin.modules.*'), icon: 'modules' as const }] : []),
        ...(canManageBranding ? [{ label: 'Apariencia', href: route('admin.branding.edit'), active: route().current('admin.branding.*'), icon: 'branding' as const }] : []),
        ...(canManageUsers ? [{ label: canViewUsers ? 'Usuarios y roles' : 'Roles', href: route(canViewUsers ? 'admin.users.index' : 'admin.roles.index'), active: route().current('admin.users.*') || route().current('admin.roles.*'), icon: 'users' as const }] : []),
        ...(canManageClinicStaff ? [{ label: 'Personal de la clínica', href: route('clinic-staff.index'), active: route().current('clinic-staff.*'), icon: 'staff' as const }] : []),
    ];

    return <div data-variant={branding.variant} data-theme={branding.theme} className="min-h-screen bg-slate-50 text-slate-900"><Head><link rel="icon" href={branding.iconUrl ?? '/favicon.ico'} /></Head><NavigationLoader /><Sidebar items={navigation} open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><div className="min-h-screen lg:pl-72"><header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur sm:px-6 lg:px-8"><div className="flex items-center gap-3"><button type="button" onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 lg:hidden" aria-label="Abrir menu" aria-expanded={sidebarOpen}><MenuIcon /></button><Link href={route('dashboard')} className="flex items-center gap-2 lg:hidden">{branding.logoUrl ? <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white"><img src={branding.logoUrl} alt={branding.name} className="h-full w-full object-cover" /></span> : <ClinicMark className="h-8 w-8 text-blue-700" />}<span className="max-w-40 truncate text-sm font-semibold text-slate-800">{branding.name}</span></Link></div><div className="hidden text-sm text-slate-500 sm:block">{user.name}</div></header>{header && <div className="border-b border-slate-200 bg-white"><div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">{header}</div></div>}<main>{children}</main></div></div>;
}

function MenuIcon() {
    return <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>;
}
