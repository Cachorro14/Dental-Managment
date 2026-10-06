import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Module, PageProps, RoleSummary } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

type Props = PageProps<{ modules: Module[]; roles: RoleSummary[]; assignments: Record<string, string[]> }>;

export default function Index({ modules, roles, assignments }: Props) {
    const canUpdate = usePage<PageProps>().props.auth.permissions.includes('modules.update');
    const [selectedRole, setSelectedRole] = useState(roles[0]?.id.toString() ?? '');
    const form = useForm({ role_id: selectedRole, modules: assignments[selectedRole] ?? [] });
    const selectRole = (roleId: string) => {
        setSelectedRole(roleId);
        form.setData({ role_id: roleId, modules: assignments[roleId] ?? [] });
    };
    const toggleRoleModule = (code: string) => form.setData('modules', form.data.modules.includes(code) ? form.data.modules.filter((module) => module !== code) : [...form.data.modules, code]);
    const saveRoleModules = () => form.put(route('admin.modules.roles.update'), { preserveScroll: true });

    return (
        <AuthenticatedLayout header={<div><p className="theme-accent text-sm font-medium">Configuración del sistema</p><h1 className="mt-1 text-2xl font-semibold tracking-tight theme-content">Módulos y acceso</h1></div>}>
            <Head title="Módulos y acceso" />
            <div className="min-h-[calc(100vh-5rem)] theme-page px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <section className="space-y-4">
                        <div><p className="text-sm theme-content-muted">Capacidades de la instalación</p><h2 className="text-xl font-semibold theme-content">Módulos disponibles</h2></div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {modules.map((module) => <article key={module.code} className="rounded-2xl border theme-outline theme-card p-5 shadow-sm">
                                <div className="flex items-start justify-between gap-4">
                                    <div><span className="theme-info inline-flex rounded-lg border px-2 py-1 text-xs font-semibold tracking-wide">{module.code}</span><h3 className="mt-3 font-semibold theme-content">{module.label}</h3><p className="mt-1 text-sm theme-content-muted">{module.dependencies.length ? `Requiere ${module.dependencies.join(', ')}` : 'Sin dependencias'}</p></div>
                                    {canUpdate && <button type="button" onClick={() => router.patch(route('admin.modules.update', module.code), { enabled: !module.enabled }, { preserveScroll: true })} className={`relative h-7 w-12 shrink-0 rounded-full transition ${module.enabled ? 'bg-accent' : 'theme-muted-surface'}`} aria-label={`Cambiar ${module.label}`} aria-pressed={module.enabled}><span className={`absolute top-1 h-5 w-5 rounded-full theme-card shadow transition ${module.enabled ? 'left-6' : 'left-1'}`} /></button>}
                                </div>
                                <p className={`mt-5 text-xs font-semibold uppercase tracking-wider ${module.enabled ? 'theme-success-foreground' : 'theme-content-muted'}`}>{module.enabled ? 'Habilitado' : 'Deshabilitado'}</p>
                            </article>)}
                        </div>
                    </section>

                    <section className="rounded-2xl border theme-outline theme-card p-6 shadow-sm">
                        <p className="text-sm theme-content-muted">Acceso por rol</p>
                        <h2 className="mt-1 text-xl font-semibold theme-content">Módulos asignados</h2>
                        <label htmlFor="role_id" className="mt-5 block text-sm font-medium theme-content-secondary">Rol</label>
                        <select id="role_id" value={selectedRole} disabled={!canUpdate} onChange={(event) => selectRole(event.target.value)} className="mt-1 block w-full rounded-xl theme-outline-strong disabled:bg-surface-sunken">
                            {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                        </select>
                        <div className="mt-5 space-y-3">
                            {modules.map((module) => <label key={module.code} className="flex min-h-12 items-center gap-3 rounded-xl border theme-outline px-4 py-3 text-sm theme-content-secondary">
                                <input type="checkbox" checked={form.data.modules.includes(module.code)} disabled={!canUpdate} onChange={() => toggleRoleModule(module.code)} className="rounded border-outline-strong text-accent focus:ring-accent disabled:opacity-60" />
                                <span>{module.label}</span>
                            </label>)}
                        </div>
                        {canUpdate && <button type="button" onClick={saveRoleModules} disabled={form.processing || !selectedRole} className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl theme-accent-button px-4 py-2 text-sm font-semibold theme-content-inverse transition hover:opacity-90 disabled:opacity-50">Guardar acceso del rol</button>}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
