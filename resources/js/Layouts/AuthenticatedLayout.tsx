import ClinicMark from '@/Components/ClinicMark';
import Breadcrumbs from '@/Components/Breadcrumbs';
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
    const canViewBilling = auth.permissions.includes('billing.view') && system.modules.some((module) => module.code === 'BILLING' && module.enabled);
    const canViewInventory = auth.permissions.includes('inventory.view') && system.modules.some((module) => module.code === 'INVENTORY' && module.enabled);
    const canViewReports = auth.permissions.includes('reports.view') && system.modules.some((module) => module.code === 'REPORTS' && module.enabled);
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
        ...(canViewBilling ? [{ label: 'Finanzas', href: route('billing.index'), active: route().current('billing.*'), icon: 'audit' as const }] : []),
        ...(canViewInventory ? [{ label: 'Inventario', href: route('inventory.index'), active: route().current('inventory.*'), icon: 'modules' as const }] : []),
        ...(canViewReports ? [{ label: 'Reportes', href: route('reports.index'), active: route().current('reports.*'), icon: 'audit' as const }] : []),
        ...(canViewAuditLog ? [{ label: 'Auditoria', href: route('audit.index'), active: route().current('audit.*'), icon: 'audit' as const }] : []),
        ...(canManageModules ? [{ label: 'Modulos', href: route('admin.modules.index'), active: route().current('admin.modules.*'), icon: 'modules' as const }] : []),
        ...(canManageBranding ? [{ label: 'Apariencia', href: route('admin.branding.edit'), active: route().current('admin.branding.*'), icon: 'branding' as const }] : []),
        ...(canManageUsers ? [{ label: canViewUsers ? 'Usuarios y roles' : 'Roles', href: route(canViewUsers ? 'admin.users.index' : 'admin.roles.index'), active: route().current('admin.users.*') || route().current('admin.roles.*'), icon: 'users' as const }] : []),
        ...(canManageClinicStaff ? [{ label: 'Personal de la clínica', href: route('clinic-staff.index'), active: route().current('clinic-staff.*'), icon: 'staff' as const }] : []),
    ];

    return <div data-variant={branding.variant} data-theme={branding.theme} className="theme-root min-h-screen"><Head><link rel="icon" href={branding.iconUrl ?? '/favicon.ico'} /></Head><NavigationLoader /><Sidebar items={navigation} open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><div className="min-h-screen lg:pl-72"><header className="portal-header sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 shadow-sm backdrop-blur sm:px-6 lg:px-8"><div className="flex items-center gap-3"><button type="button" onClick={() => setSidebarOpen(true)} className="theme-content-secondary rounded-lg p-2 transition hover:bg-surface-sunken hover:text-content focus:outline-none focus:ring-2 focus:ring-accent lg:hidden" aria-label="Abrir menú" aria-expanded={sidebarOpen}><MenuIcon /></button><Link href={route('dashboard')} className="flex items-center gap-2 lg:hidden">{branding.logoUrl ? <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-raised"><img src={branding.logoUrl} alt={branding.name} className="h-full w-full object-cover" /></span> : <ClinicMark className="theme-accent h-8 w-8" />}<span className="theme-content max-w-40 truncate text-sm font-semibold">{branding.name}</span></Link></div><div className="theme-content-muted hidden text-sm sm:block">{user.name}</div></header><Breadcrumbs />{header && <div className="portal-header border-b"><div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">{header}</div></div>}<main>{children}</main></div></div>;
}

function MenuIcon() {
    return <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>;
}
