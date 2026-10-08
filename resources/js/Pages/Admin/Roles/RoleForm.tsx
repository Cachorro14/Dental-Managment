import InputError from '@/Components/InputError';
import ActionLink from '@/Components/ActionLink';
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

    return <form onSubmit={submit} className="theme-card space-y-6 rounded-2xl border theme-outline p-5 shadow-sm sm:p-7"><div><h2 className="text-lg font-semibold theme-content">Configuración del rol</h2><p className="theme-content-muted mt-1 text-sm">Los permisos definen las acciones que puede realizar cada usuario con este rol.</p></div><div><InputLabel htmlFor="name" value="Nombre del rol" /><TextInput id="name" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} className="mt-1 block w-full" disabled={systemRole} required /><InputError message={form.errors.name} className="mt-2" />{systemRole && <p className="theme-content-muted mt-2 text-xs">Los roles del sistema no pueden renombrarse.</p>}</div><div><InputLabel value="Permisos" /><div className="mt-2 grid gap-3 sm:grid-cols-2">{permissions.map((permission) => <label key={permission.id} className="theme-content-secondary flex min-h-12 items-center gap-3 rounded-xl border theme-outline px-4 py-3 text-sm transition hover:border-accent hover:bg-surface-sunken"><input type="checkbox" checked={form.data.permissions.includes(permission.id)} onChange={() => togglePermission(permission.id)} className="rounded border-outline-strong text-accent focus:ring-accent" />{permission.name}</label>)}</div></div><div className="flex flex-col gap-3 sm:flex-row"><PrimaryButton disabled={form.processing}>{role ? 'Guardar cambios' : 'Crear rol'}</PrimaryButton><ActionLink href={route('admin.roles.index')} icon="close" variant="danger">Cancelar</ActionLink></div></form>;
}
