import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

type BreadcrumbItem = {
    label: string;
    href?: string;
};

export default function Breadcrumbs() {
    const items = getBreadcrumbItems();

    return (
        <nav aria-label="Migas de pan" className="portal-header border-b px-4 py-3 sm:px-6 lg:px-8">
            <ol className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                {items.map((item, index) => (
                    <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                        {index > 0 && <ChevronIcon />}
                        {item.href ? (
                            <Link href={item.href} className="theme-content-muted transition hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent">
                                {item.label}
                            </Link>
                        ) : (
                            <span aria-current="page" className="theme-content font-medium">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}

function getBreadcrumbItems(): BreadcrumbItem[] {
    if (route().current('dashboard')) {
        return [{ label: 'Panel principal' }];
    }

    if (route().current('patients.*')) {
        return moduleBreadcrumb('Pacientes', 'patients.index', patientPageLabel());
    }

    if (route().current('appointments.*')) {
        return moduleBreadcrumb('Citas', 'appointments.index', appointmentPageLabel());
    }

    if (route().current('clinical-history.*')) {
        return nestedPatientBreadcrumb('Historia clínica', clinicalHistoryPageLabel(), 'clinical-history.edit');
    }

    if (route().current('odontogram.*')) {
        return nestedPatientBreadcrumb('Odontograma', 'Evaluación', 'odontogram.edit');
    }

    if (route().current('treatments.*')) {
        return nestedPatientBreadcrumb('Tratamientos', treatmentPageLabel(), 'treatments.index');
    }

    if (route().current('billing.*')) {
        return moduleBreadcrumb('Finanzas', 'billing.index', billingPageLabel());
    }

    if (route().current('inventory.*')) {
        return [{ label: 'Inventario' }];
    }

    if (route().current('reports.*')) {
        return [{ label: 'Reportes' }];
    }

    if (route().current('audit.*')) {
        return [{ label: 'Auditoría' }];
    }

    if (route().current('admin.modules.*')) {
        return [{ label: 'Administración', href: route('admin.modules.index') }, { label: 'Módulos y acceso' }];
    }

    if (route().current('admin.branding.*')) {
        return [{ label: 'Administración', href: route('admin.branding.edit') }, { label: 'Marca y apariencia' }];
    }

    if (route().current('admin.users.*')) {
        return adminBreadcrumb('Usuarios y roles', 'admin.users.index', adminPageLabel('usuario'));
    }

    if (route().current('admin.roles.*')) {
        return adminBreadcrumb('Roles', 'admin.roles.index', adminPageLabel('rol'));
    }

    if (route().current('clinic-staff.*')) {
        return moduleBreadcrumb('Personal de la clínica', 'clinic-staff.index', clinicStaffPageLabel());
    }

    if (route().current('profile.*')) {
        return [{ label: 'Perfil' }];
    }

    return [];
}

function moduleBreadcrumb(label: string, indexRoute: string, currentLabel?: string): BreadcrumbItem[] {
    const items: BreadcrumbItem[] = [{ label, href: route(indexRoute) }];

    if (currentLabel) {
        items.push({ label: currentLabel });
    }

    return items;
}

function adminBreadcrumb(label: string, indexRoute: string, currentLabel: string): BreadcrumbItem[] {
    const items: BreadcrumbItem[] = [{ label: 'Administración' }, { label, href: route(indexRoute) }];

    if (currentLabel !== label) {
        items.push({ label: currentLabel });
    }

    return items;
}

function nestedPatientBreadcrumb(label: string, currentLabel: string | undefined, indexRoute: string): BreadcrumbItem[] {
    const items: BreadcrumbItem[] = [
        { label: 'Pacientes', href: route('patients.index') },
        { label, href: route(indexRoute, route().params.patient) },
    ];

    if (currentLabel) {
        items.push({ label: currentLabel });
    }

    return items;
}

function patientPageLabel(): string | undefined {
    if (route().current('patients.index')) {
        return undefined;
    }

    if (route().current('patients.create')) {
        return 'Nuevo paciente';
    }

    if (route().current('patients.edit')) {
        return 'Editar paciente';
    }

    if (route().current('patients.dentists.edit')) {
        return 'Asignar profesionales';
    }

    return 'Datos del paciente';
}

function appointmentPageLabel(): string | undefined {
    if (route().current('appointments.index')) {
        return undefined;
    }

    if (route().current('appointments.create')) {
        return 'Nueva cita';
    }

    if (route().current('appointments.edit')) {
        return 'Editar cita';
    }

    return 'Detalle de la cita';
}

function clinicalHistoryPageLabel(): string {
    return route().current('clinical-history.questionnaire') ? 'Cuestionario' : 'Evaluación';
}

function treatmentPageLabel(): string | undefined {
    if (route().current('treatments.index')) {
        return undefined;
    }

    return route().current('treatments.create') ? 'Registrar tratamiento' : 'Editar tratamiento';
}

function billingPageLabel(): string | undefined {
    return route().current('billing.show') ? 'Estado de cuenta' : undefined;
}

function clinicStaffPageLabel(): string | undefined {
    if (route().current('clinic-staff.index')) {
        return undefined;
    }

    return route().current('clinic-staff.create') ? 'Crear cuenta' : 'Editar cuenta';
}

function adminPageLabel(entity: string): string {
    if (route().current(`admin.${entity === 'usuario' ? 'users' : 'roles'}.index`)) {
        return entity === 'usuario' ? 'Usuarios y roles' : 'Roles';
    }

    return route().current(`admin.${entity === 'usuario' ? 'users' : 'roles'}.create`) ? `Nuevo ${entity}` : `Editar ${entity}`;
}

function ChevronIcon(): ReactNode {
    return <svg className="theme-content-muted h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 0 1 0-1.414L10.586 10 7.293 6.707a1 1 0 0 1 1.414-1.414l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0Z" clipRule="evenodd" /></svg>;
}
