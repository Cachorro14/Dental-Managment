import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Branding, PageProps } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { ChangeEvent, FormEvent } from 'react';

export default function Edit({ branding }: PageProps<{ branding: Branding }>) {
    const canUpdate = usePage<PageProps>().props.auth.permissions.includes('branding.update');
    const form = useForm<{ name: string; variant: Branding['variant']; theme: Branding['theme']; logo: File | null; icon: File | null }>({ name: branding.name, variant: branding.variant, theme: branding.theme, logo: null, icon: null });
    const setFile = (field: 'logo' | 'icon') => (event: ChangeEvent<HTMLInputElement>) => form.setData(field, event.target.files?.[0] ?? null);
    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (canUpdate) {
            form.patch(route('admin.branding.update'), { forceFormData: true, preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout header={<div><p className="theme-accent text-sm font-medium">Configuración del sistema</p><h1 className="mt-1 text-2xl font-semibold tracking-tight theme-content">Marca y apariencia</h1></div>}>
            <Head title="Marca y apariencia" />
            <div className="min-h-[calc(100vh-5rem)] theme-page px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    <form onSubmit={submit} className="space-y-6 rounded-2xl border theme-outline theme-card p-6 shadow-sm">
                        <div><h2 className="text-lg font-semibold theme-content">Identidad</h2><p className="mt-1 text-sm theme-content-muted">Esta información aparece en el espacio de trabajo y el acceso.</p></div>
                        <div>
                            <InputLabel htmlFor="name" value="Nombre de la clínica" />
                            <input id="name" disabled={!canUpdate} value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} className="mt-2 block w-full rounded-xl theme-outline-strong shadow-sm focus:border-accent focus:ring-accent disabled:bg-surface-sunken" />
                            <InputError message={form.errors.name} className="mt-2" />
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div><InputLabel htmlFor="variant" value="Estilo visual" /><select id="variant" disabled={!canUpdate} value={form.data.variant} onChange={(event) => form.setData('variant', event.target.value as Branding['variant'])} className="mt-2 block w-full rounded-xl theme-outline-strong shadow-sm disabled:bg-surface-sunken"><option value="clinical">Clínico</option><option value="modern">Moderno</option><option value="minimal">Minimalista</option></select></div>
                            <div><InputLabel htmlFor="theme" value="Tema" /><select id="theme" disabled={!canUpdate} value={form.data.theme} onChange={(event) => form.setData('theme', event.target.value as Branding['theme'])} className="mt-2 block w-full rounded-xl theme-outline-strong shadow-sm disabled:bg-surface-sunken"><option value="light">Claro</option><option value="dark">Oscuro</option><option value="system">Sistema</option></select></div>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div><InputLabel htmlFor="logo" value="Logotipo" /><input id="logo" type="file" accept=".jpg,.jpeg,.png,.webp,.svg" disabled={!canUpdate} onChange={setFile('logo')} className="mt-2 block w-full text-sm theme-content-secondary disabled:cursor-not-allowed" /><InputError message={form.errors.logo} className="mt-2" />{branding.logoUrl && <img src={branding.logoUrl} alt="Logotipo actual" className="mt-3 h-16 w-16 rounded-xl border theme-outline object-contain p-2" />}</div>
                            <div><InputLabel htmlFor="icon" value="Icono" /><input id="icon" type="file" accept=".ico,.png,.svg" disabled={!canUpdate} onChange={setFile('icon')} className="mt-2 block w-full text-sm theme-content-secondary disabled:cursor-not-allowed" /><InputError message={form.errors.icon} className="mt-2" />{branding.iconUrl && <img src={branding.iconUrl} alt="Icono actual" className="mt-3 h-16 w-16 rounded-xl border theme-outline object-contain p-2" />}</div>
                        </div>
                        {canUpdate && <PrimaryButton icon="save" disabled={form.processing}>Guardar apariencia</PrimaryButton>}
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
