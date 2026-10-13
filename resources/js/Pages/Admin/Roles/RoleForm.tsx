import InputError from '@/Components/InputError';
import ActionLink from '@/Components/ActionLink';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type AssignedPermission = { id: number; name: string };
type Role = { id: number; name: string; permissions: AssignedPermission[] };
type Permission = { id: number; name: string; label: string };
type Capability = { code: string; label: string; description: string; permissions: Permission[] };
type PermissionArea = { code: string; label: string; description: string; capabilities: Capability[] };

export default function RoleForm({ role, permissionGroups, systemRole = false }: { role?: Role; permissionGroups: PermissionArea[]; systemRole?: boolean }) {
    const form = useForm({ name: role?.name ?? '', permissions: role?.permissions.map((permission) => permission.id) ?? [] });
    const submit = (event: FormEvent) => { event.preventDefault(); role ? form.patch(route('admin.roles.update', role.id)) : form.post(route('admin.roles.store')); };
    const togglePermission = (permissionId: number) => form.setData('permissions', form.data.permissions.includes(permissionId) ? form.data.permissions.filter((id) => id !== permissionId) : [...form.data.permissions, permissionId]);

    return <form onSubmit={submit} className="theme-card space-y-6 rounded-2xl border theme-outline p-5 shadow-sm sm:p-7"><div><h2 className="text-lg font-semibold theme-content">Configuración del rol</h2><p className="theme-content-muted mt-1 text-sm">Asigna únicamente las capacidades clínicas y operativas que necesita este rol.</p></div><div><InputLabel htmlFor="name" value="Nombre del rol" /><TextInput id="name" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} className="mt-1 block w-full" disabled={systemRole} required /><InputError message={form.errors.name} className="mt-2" />{systemRole && <p className="theme-content-muted mt-2 text-xs">Los roles del sistema no pueden renombrarse.</p>}</div><div className="space-y-7">{permissionGroups.map((area) => <section key={area.code}><div className="border-b theme-outline pb-3"><h3 className="text-lg font-semibold theme-content">{area.label}</h3><p className="mt-1 text-sm theme-content-muted">{area.description}</p></div><div className="mt-4 grid gap-4 lg:grid-cols-2">{area.capabilities.map((capability) => <article key={capability.code} className="rounded-xl border theme-outline p-4"><h4 className="font-semibold theme-content">{capability.label}</h4><p className="mt-1 text-sm theme-content-muted">{capability.description}</p><div className="mt-4 space-y-2">{capability.permissions.map((permission) => <label key={permission.id} className="theme-content-secondary flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-surface-sunken"><input type="checkbox" checked={form.data.permissions.includes(permission.id)} onChange={() => togglePermission(permission.id)} className="rounded border-outline-strong text-accent focus:ring-accent" /><span>{permission.label}<span className="mt-0.5 block text-xs theme-content-muted">{permission.name}</span></span></label>)}</div></article>)}</div></section>)}</div><div className="flex flex-col gap-3 sm:flex-row"><PrimaryButton icon={role ? 'save' : 'add'} disabled={form.processing}>{role ? 'Guardar cambios' : 'Crear rol'}</PrimaryButton><ActionLink href={route('admin.roles.index')} icon="close" variant="danger">Cancelar</ActionLink></div></form>;
}
