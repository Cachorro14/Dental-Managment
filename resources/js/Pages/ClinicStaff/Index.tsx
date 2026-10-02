import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, Paginated, RoleSummary } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type ClinicStaffUser = { id: number; name: string; email: string; roles: RoleSummary[] };

export default function Index({ users, filters }: PageProps<{ users: Paginated<ClinicStaffUser>; filters: { search: string } }>) {
    const { auth } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search);
    const canCreate = auth.permissions.includes('clinic_staff.create');
    const canUpdate = auth.permissions.includes('clinic_staff.update');

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get(route('clinic-staff.index'), { search }, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout header={<div><p className="text-sm font-medium text-teal-700">Equipo de la clínica</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Personal</h1></div>}>
            <Head title="Personal de la clínica" />
            <div className="min-h-[calc(100vh-5rem)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <form onSubmit={submit} className="flex w-full gap-3 sm:max-w-xl">
                            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o correo" className="min-w-0 flex-1 rounded-xl border-slate-300 shadow-sm focus:border-teal-600 focus:ring-teal-500" />
                            <button className="min-h-11 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800">Buscar</button>
                        </form>
                        {canCreate && <Link href={route('clinic-staff.create')} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800">Crear cuenta</Link>}
                    </div>

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        {users.data.length === 0 ? <p className="px-6 py-12 text-center text-sm text-slate-500">No hay cuentas de personal para mostrar.</p> : <>
                            <div className="hidden overflow-x-auto md:block">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50"><tr><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Nombre</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Correo</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Rol</th>{canUpdate && <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Acciones</th>}</tr></thead>
                                    <tbody className="divide-y divide-slate-100">{users.data.map((user) => <tr key={user.id}><td className="px-6 py-4 text-sm font-semibold text-slate-900">{user.name}</td><td className="px-6 py-4 text-sm text-slate-600">{user.email}</td><td className="px-6 py-4"><RoleBadges roles={user.roles} /></td>{canUpdate && <td className="px-6 py-4 text-right"><Link href={route('clinic-staff.edit', user.id)} className="text-sm font-semibold text-teal-700 hover:text-teal-900">Editar</Link></td>}</tr>)}</tbody>
                                </table>
                            </div>
                            <ul className="divide-y divide-slate-100 md:hidden">{users.data.map((user) => <li key={user.id} className="space-y-3 p-4"><div><p className="font-semibold text-slate-900">{user.name}</p><p className="text-sm text-slate-500">{user.email}</p></div><RoleBadges roles={user.roles} />{canUpdate && <Link href={route('clinic-staff.edit', user.id)} className="inline-flex min-h-10 items-center text-sm font-semibold text-teal-700">Editar cuenta</Link>}</li>)}</ul>
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
    return <div className="flex flex-wrap gap-2">{roles.map((role) => <span key={role.id} className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800">{labels[role.name] ?? role.name}</span>)}</div>;
}

function Pagination({ links }: { links: Paginated<ClinicStaffUser>['links'] }) {
    if (links.length <= 3) {
        return null;
    }

    return <nav aria-label="Paginación del personal" className="flex flex-wrap gap-2 border-t border-slate-200 p-4">{links.map((link, index) => link.url ? <Link key={index} href={link.url} className={`rounded-lg px-3 py-2 text-sm font-medium transition ${link.active ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-teal-50 hover:text-teal-800'}`} dangerouslySetInnerHTML={{ __html: link.label }} /> : <span key={index} className="rounded-lg px-3 py-2 text-sm text-slate-400" dangerouslySetInnerHTML={{ __html: link.label }} />)}</nav>;
}
