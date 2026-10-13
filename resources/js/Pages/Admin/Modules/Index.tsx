import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Module, PageProps } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';

type Props = PageProps<{ modules: Module[] }>;

export default function Index({ modules }: Props) {
    const canUpdate = usePage<PageProps>().props.auth.permissions.includes('modules.update');

    return (
        <AuthenticatedLayout header={<div><p className="theme-accent text-sm font-medium">Configuración del sistema</p><h1 className="mt-1 text-2xl font-semibold tracking-tight theme-content">Módulos y acceso</h1></div>}>
            <Head title="Módulos y acceso" />
            <div className="min-h-[calc(100vh-5rem)] theme-page px-4 py-8 sm:px-6 lg:px-8">
                <section className="mx-auto max-w-5xl space-y-4">
                    <div><p className="text-sm theme-content-muted">Capacidades de la instalación</p><h2 className="text-xl font-semibold theme-content">Módulos disponibles</h2><p className="mt-1 text-sm theme-content-muted">Activa los módulos que estarán disponibles en esta instalación.</p></div>
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
            </div>
        </AuthenticatedLayout>
    );
}
