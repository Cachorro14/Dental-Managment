import ClinicMark from '@/Components/ClinicMark';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth, branding }: PageProps) {
    return (
        <>
            <Head title="Inicio" />
            <main data-theme={branding.theme} data-variant={branding.variant} className="theme-root min-h-screen overflow-hidden bg-surface-sunken text-content">
                <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-10">
                    <header className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3">
                            {branding.logoUrl ? <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-raised"><img src={branding.logoUrl} alt={branding.name} className="h-full w-full object-cover" /></span> : <ClinicMark className="h-10 w-10 text-accent" />}
                            <span className="font-semibold tracking-tight">{branding.name}</span>
                        </Link>
                        <Link href={auth.user ? route('dashboard') : route('login')} className="theme-content-secondary rounded-full border border-outline-strong px-5 py-2 text-sm font-medium transition hover:border-accent hover:text-accent">{auth.user ? 'Ir al panel' : 'Ingresar'}</Link>
                    </header>
                    <section className="relative flex flex-1 items-center py-20"><div className="relative z-10 max-w-3xl"><p className="text-accent text-sm font-semibold uppercase tracking-[0.24em]">Gestión clínica inteligente</p><h1 className="theme-content mt-6 text-5xl font-semibold tracking-tight sm:text-7xl">Una experiencia más clara para cuidar mejor.</h1><p className="theme-content-secondary mt-7 max-w-2xl text-lg leading-8">Organiza pacientes, citas y operaciones de tu clínica desde un espacio seguro, sencillo y preparado para crecer contigo.</p><div className="mt-10 flex flex-wrap gap-4"><Link href={auth.user ? route('dashboard') : route('login')} className="theme-accent-button rounded-full px-6 py-3 text-sm font-semibold transition hover:opacity-90">Comenzar</Link><span className="theme-content-secondary rounded-full border border-outline px-6 py-3 text-sm">Modular y personalizable</span></div></div><div className="absolute -right-48 top-1/2 h-[38rem] w-[38rem] -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" /></section>
                    <footer className="theme-content-muted flex flex-col gap-2 border-t border-outline pt-6 text-sm sm:flex-row sm:items-center sm:justify-between"><span>{branding.name}</span><span>Tu clínica, mejor organizada.</span></footer>
                </div>
            </main>
        </>
    );
}
