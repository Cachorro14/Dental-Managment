import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ActionLink from '@/Components/ActionLink';
import Icon from '@/Components/Icon';
import { PageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

type PermissionSummary = { id: number; name: string };
type Role = { id: number; name: string; users_count: number; permissions: PermissionSummary[] };
const systemRoles = ['SUPER_ADMIN', 'CLINIC_ADMIN', 'RECEPTIONIST', 'DENTIST'];

export default function Index({ roles }: { roles: Role[] }) {
    const permissions = usePage<PageProps>().props.auth.permissions;
    const canCreate = permissions.includes('roles.create');
    const canUpdate = permissions.includes('roles.update');
    const canDelete = permissions.includes('roles.delete');
    const canViewUsers = permissions.includes('users.view');

    const remove = (role: Role) => {
        if (canDelete && window.confirm(`¿Eliminar el rol ${role.name}?`)) {
            router.delete(route('admin.roles.destroy', role.id), { preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout header={<div><p className="theme-accent text-sm font-medium">Administración</p><h1 className="mt-1 text-2xl font-semibold tracking-tight theme-content">Roles del sistema</h1></div>}>
            <Head title="Roles del sistema" />
            <div className="min-h-[calc(100vh-5rem)] theme-page px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl space-y-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="max-w-2xl text-sm theme-content-muted">Administra los roles y los permisos que se asignan a los usuarios.</p>
                        <div className="flex gap-3">
                            {canViewUsers && <ActionLink href={route('admin.users.index')} icon="users" variant="accent" className="flex-1 sm:flex-none">Usuarios</ActionLink>}
                            {canCreate && <Link href={route('admin.roles.create')} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl theme-accent-button px-4 py-2 text-sm font-semibold theme-content-inverse shadow-sm transition hover:text-accent-button sm:flex-none">Nuevo rol</Link>}
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {roles.map((role) => <article key={role.id} className="rounded-2xl border theme-outline theme-card p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold theme-content">{role.name}</h2><p className="mt-1 text-sm theme-content-muted">{role.users_count} usuario(s)</p></div>{canUpdate && <Link href={route('admin.roles.edit', role.id)} className="theme-accent text-sm font-semibold hover:underline">Editar</Link>}</div>
                            <div className="mt-5 flex flex-wrap gap-2">{role.permissions.map((permission) => <span key={permission.id} className="rounded-full theme-muted-surface px-2.5 py-1 text-xs theme-content-secondary">{permission.name}</span>)}</div>
                            {canDelete && !systemRoles.includes(role.name) && <button type="button" onClick={() => remove(role)} className="theme-danger-foreground mt-5 inline-flex items-center gap-2 text-sm font-semibold hover:underline"><Icon name="trash" />Eliminar rol</button>}
                        </article>)}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
