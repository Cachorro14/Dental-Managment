import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type Permission = { id: number; name: string };
type Role = { id: number; name: string; permissions: Permission[] };

export default function RoleForm({ role, permissions, systemRole = false }: { role?: Role; permissions: Permission[]; systemRole?: boolean }) {
    const form = useForm({ name: role?.name ?? '', permissions: role?.permissions.map((permission) => permission.id) ?? [] });
    const submit = (event: FormEvent) => { event.preventDefault(); role ? form.patch(route('admin.roles.update', role.id)) : form.post(route('admin.roles.store')); };
    const togglePermission = (permissionId: number) => form.setData('permissions', form.data.permissions.includes(permissionId) ? form.data.permissions.filter((id) => id !== permissionId) : [...form.data.permissions, permissionId]);

    return <form onSubmit={submit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div><h2 className="text-lg font-semibold text-slate-900">Configuracion del rol</h2><p className="mt-1 text-sm text-slate-500">Los permisos definen las acciones que puede realizar cada usuario con este rol.</p></div><div><InputLabel htmlFor="name" value="Nombre del rol" /><TextInput id="name" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} className="mt-1 block w-full" disabled={systemRole} required /><InputError message={form.errors.name} className="mt-2" />{systemRole && <p className="mt-2 text-xs text-slate-500">Los roles del sistema no pueden renombrarse.</p>}</div><div><InputLabel value="Permisos" /><div className="mt-2 grid gap-3 sm:grid-cols-2">{permissions.map((permission) => <label key={permission.id} className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"><input type="checkbox" checked={form.data.permissions.includes(permission.id)} onChange={() => togglePermission(permission.id)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />{permission.name}</label>)}</div></div><div className="flex flex-col gap-3 sm:flex-row"><PrimaryButton disabled={form.processing}>{role ? 'Guardar cambios' : 'Crear rol'}</PrimaryButton><Link href={route('admin.roles.index')} className="inline-flex items-center justify-center rounded-md border border-blue-200 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-blue-800 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300">Cancelar</Link></div></form>;
}
