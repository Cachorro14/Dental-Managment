import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ToothLoader from '@/Components/ToothLoader';
import { Paginated, PageProps, RoleSummary } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type AdminUser = { id: number; name: string; email: string; roles: RoleSummary[] };
type UsersPageProps = PageProps<{ users?: Paginated<AdminUser>; filters: { search: string } }>;

export default function Index({ users, filters }: UsersPageProps) {
    const { auth } = usePage<PageProps>().props;

    if (!users) {
        return <AuthenticatedLayout header={<PageHeader />}><Head title="Usuarios y roles" /><div className="min-h-[calc(100vh-5rem)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white shadow-sm"><ToothLoader label="Cargando usuarios" compact /></div></div></AuthenticatedLayout>;
    }

    return <UsersList users={users} searchFilter={filters.search} permissions={auth.permissions} />;
}

function UsersList({ users, searchFilter, permissions }: { users: Paginated<AdminUser>; searchFilter: string; permissions: string[] }) {
    const [search, setSearch] = useState(searchFilter);
    const canCreate = permissions.includes('users.create');
    const canUpdate = permissions.includes('users.update');
    const canDelete = permissions.includes('users.delete');
    const canViewRoles = permissions.includes('roles.view');

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get(route('admin.users.index'), { search }, { preserveState: true, replace: true });
    };

    const remove = (user: AdminUser) => {
        if (canDelete && window.confirm(`¿Eliminar a ${user.name}?`)) {
            router.delete(route('admin.users.destroy', user.id), { preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout header={<PageHeader />}>
            <Head title="Usuarios y roles" />
            <div className="min-h-[calc(100vh-5rem)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <form onSubmit={submit} className="flex w-full gap-3 sm:max-w-xl">
                            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o correo" className="min-w-0 flex-1 rounded-xl border-slate-300 shadow-sm focus:border-blue-600 focus:ring-blue-500" />
                            <button className="min-h-11 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">Buscar</button>
                        </form>
                        <div className="flex flex-wrap gap-3">
                            {canViewRoles && <Link href={route('admin.roles.index')} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-800 transition hover:bg-blue-50 sm:flex-none">Gestionar roles</Link>}
                            {canCreate && <Link href={route('admin.users.create')} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:flex-none">Nuevo usuario</Link>}
                        </div>
                    </div>

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        {users.data.length === 0 ? <p className="px-6 py-12 text-center text-sm text-slate-500">No hay usuarios para mostrar.</p> : <>
                            <div className="hidden overflow-x-auto md:block">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50"><tr><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Usuario</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Correo</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Roles</th>{(canUpdate || canDelete) && <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Acciones</th>}</tr></thead>
                                    <tbody className="divide-y divide-slate-100">{users.data.map((user) => <tr key={user.id}><td className="px-6 py-4 text-sm font-semibold text-slate-900">{user.name}</td><td className="px-6 py-4 text-sm text-slate-600">{user.email}</td><td className="px-6 py-4"><RoleBadges roles={user.roles} /></td>{(canUpdate || canDelete) && <td className="px-6 py-4 text-right"><UserActions user={user} canUpdate={canUpdate} canDelete={canDelete} remove={remove} /></td>}</tr>)}</tbody>
                                </table>
                            </div>
                            <ul className="divide-y divide-slate-100 md:hidden">{users.data.map((user) => <li key={user.id} className="space-y-3 p-4"><div><p className="font-semibold text-slate-900">{user.name}</p><p className="text-sm text-slate-500">{user.email}</p></div><RoleBadges roles={user.roles} />{(canUpdate || canDelete) && <UserActions user={user} canUpdate={canUpdate} canDelete={canDelete} remove={remove} />}</li>)}</ul>
                            <Pagination links={users.links} />
                        </>}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function PageHeader() {
    return <div><p className="text-sm font-medium text-blue-600">Administración</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Usuarios y roles</h1></div>;
}

function RoleBadges({ roles }: { roles: RoleSummary[] }) {
    return <div className="flex flex-wrap gap-2">{roles.map((role) => <span key={role.id} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">{role.name}</span>)}</div>;
}

function UserActions({ user, canUpdate, canDelete, remove }: { user: AdminUser; canUpdate: boolean; canDelete: boolean; remove: (user: AdminUser) => void }) {
    return <div className="flex gap-3 text-sm">{canUpdate && <Link href={route('admin.users.edit', user.id)} className="font-semibold text-blue-700 hover:text-blue-900">Editar</Link>}{canDelete && <button type="button" onClick={() => remove(user)} className="font-semibold text-red-600 hover:text-red-800">Eliminar</button>}</div>;
}

function Pagination({ links }: { links: Paginated<AdminUser>['links'] }) {
    if (links.length <= 3) {
        return null;
    }

    return <nav aria-label="Paginación" className="flex flex-wrap gap-2 border-t border-slate-200 p-4">{links.map((link, index) => link.url ? <Link key={index} href={link.url} className={`rounded-lg px-3 py-2 text-sm font-medium transition ${link.active ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`} dangerouslySetInnerHTML={{ __html: link.label }} /> : <span key={index} className="rounded-lg px-3 py-2 text-sm text-slate-400" dangerouslySetInnerHTML={{ __html: link.label }} />)}</nav>;
}
