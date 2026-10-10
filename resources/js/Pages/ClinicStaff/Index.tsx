import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icon';
import { PageProps, Paginated, RoleSummary } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type ClinicStaffUser = { id: number; name: string; email: string; phone: string | null; whatsapp_appointment_consent: boolean; roles: RoleSummary[] };

export default function Index({ users, filters }: PageProps<{ users: Paginated<ClinicStaffUser>; filters: { search: string } }>) {
    const { auth } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search);
    const canCreate = auth.permissions.includes('clinic_staff.create');
    const canUpdate = auth.permissions.includes('clinic_staff.update');

    useEffect(() => {
        if (search === filters.search) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.get(route('clinic-staff.index'), { search }, { preserveState: true, preserveScroll: true, replace: true });
        }, 350);

        return () => window.clearTimeout(timeout);
    }, [filters.search, search]);

    return (
        <AuthenticatedLayout header={<div><p className="text-sm font-medium theme-content">Equipo de la clínica</p><h1 className="mt-1 text-2xl font-semibold tracking-tight theme-content">Personal</h1></div>}>
            <Head title="Personal de la clínica" />
            <div className="min-h-[calc(100vh-5rem)] theme-page px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex w-full gap-3 sm:max-w-xl">
                            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o correo" className="min-w-0 flex-1 rounded-xl theme-outline-strong shadow-sm focus:border-accent focus:ring-accent" />
                        </div>
                        {canCreate && <Link href={route('clinic-staff.create')} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl theme-accent-button px-4 py-2 text-sm font-semibold theme-content-inverse transition hover:opacity-90"><Icon name="add" />Crear cuenta</Link>}
                    </div>

                    <section className="overflow-hidden rounded-2xl border theme-outline theme-card shadow-sm">
                        {users.data.length === 0 ? <p className="px-6 py-12 text-center text-sm theme-content-muted">No hay cuentas de personal para mostrar.</p> : <>
                            <div className="hidden overflow-x-auto md:block">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="theme-page"><tr><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider theme-content-muted">Nombre</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider theme-content-muted">Correo</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider theme-content-muted">Teléfono</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider theme-content-muted">Rol</th>{canUpdate && <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider theme-content-muted">Acciones</th>}</tr></thead>
                                      <tbody className="divide-y divide-outline">{users.data.map((user) => <tr key={user.id} className={canUpdate ? 'cursor-pointer transition hover:bg-surface-sunken focus:bg-surface-sunken focus:outline-none' : undefined} onClick={canUpdate ? () => router.visit(route('clinic-staff.edit', user.id)) : undefined} onKeyDown={canUpdate ? (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); router.visit(route('clinic-staff.edit', user.id)); } } : undefined} role={canUpdate ? 'link' : undefined} tabIndex={canUpdate ? 0 : undefined} aria-label={canUpdate ? `Editar cuenta de ${user.name}` : undefined}><td className="px-6 py-4 text-sm font-semibold theme-content">{user.name}</td><td className="px-6 py-4 text-sm theme-content-secondary">{user.email}</td><td className="px-6 py-4 text-sm theme-content-secondary">{user.phone || '—'}</td><td className="px-6 py-4"><RoleBadges roles={user.roles} /></td>{canUpdate && <td className="px-6 py-4 text-right"><Link href={route('clinic-staff.edit', user.id)} onClick={(event) => event.stopPropagation()} className="table-action-button">Editar</Link></td>}</tr>)}</tbody>
                                </table>
                            </div>
                             <ul className="divide-y divide-outline md:hidden">{users.data.map((user) => <li key={user.id} className="space-y-3 p-4 transition hover:bg-surface-sunken focus-within:bg-surface-sunken"><div><p className="font-semibold theme-content">{user.name}</p><p className="text-sm theme-content-muted">{user.email}</p><p className="text-sm theme-content-muted">{user.phone || 'Sin teléfono WhatsApp'}</p></div><RoleBadges roles={user.roles} />{canUpdate && <Link href={route('clinic-staff.edit', user.id)} className="table-action-button">Editar cuenta</Link>}</li>)}</ul>
                            <Pagination links={users.links} />
                        </>}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function RoleBadges({ roles }: { roles: RoleSummary[] }) {
    const labels: Record<string, string> = { DENTIST: 'Dentista', RECEPTIONIST: 'Recepción' };
    return <div className="flex flex-wrap gap-2">{roles.map((role) => <span key={role.id} className="theme-info rounded-full border px-2.5 py-1 text-xs font-semibold">{labels[role.name] ?? role.name}</span>)}</div>;
}

function Pagination({ links }: { links: Paginated<ClinicStaffUser>['links'] }) {
    if (links.length <= 3) {
        return null;
    }

    return <nav aria-label="Paginación del personal" className="flex flex-wrap gap-2 border-t theme-outline p-4">{links.map((link, index) => link.url ? <Link key={index} href={link.url} className={`rounded-lg px-3 py-2 text-sm font-medium transition ${link.active ? 'theme-accent-button' : 'theme-content-secondary hover:bg-info-surface hover:text-info-content'}`} dangerouslySetInnerHTML={{ __html: link.label }} /> : <span key={index} className="theme-content-muted rounded-lg px-3 py-2 text-sm" dangerouslySetInnerHTML={{ __html: link.label }} />)}</nav>;
}
