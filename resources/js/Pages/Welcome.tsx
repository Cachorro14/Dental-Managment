import ClinicMark from '@/Components/ClinicMark';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth, branding }: PageProps) {
    return (
        <>
            <Head title="Inicio" />
            <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
                <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-10">
                    <header className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3">
                            {branding.logoUrl ? <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white"><img src={branding.logoUrl} alt={branding.name} className="h-full w-full object-cover" /></span> : <ClinicMark className="h-10 w-10 text-blue-300" />}
                            <span className="font-semibold tracking-tight">{branding.name}</span>
                        </Link>
                        <Link href={auth.user ? route('dashboard') : route('login')} className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-slate-200 transition hover:border-teal-300 hover:text-teal-200">{auth.user ? 'Ir al panel' : 'Ingresar'}</Link>
                    </header>
                    <section className="relative flex flex-1 items-center py-20"><div className="relative z-10 max-w-3xl"><p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">Gestion clinica inteligente</p><h1 className="mt-6 text-5xl font-semibold tracking-tight sm:text-7xl">Una experiencia mas clara para cuidar mejor.</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">Organiza pacientes, citas y operaciones de tu clinica desde un espacio seguro, sencillo y preparado para crecer contigo.</p><div className="mt-10 flex flex-wrap gap-4"><Link href={auth.user ? route('dashboard') : route('login')} className="rounded-full bg-teal-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-300">Comenzar</Link><span className="rounded-full border border-white/15 px-6 py-3 text-sm text-slate-300">Modular y personalizable</span></div></div><div className="absolute -right-48 top-1/2 h-[38rem] w-[38rem] -translate-y-1/2 rounded-full bg-teal-500/20 blur-3xl" /></section>
                    <footer className="flex flex-col gap-2 border-t border-white/10 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between"><span>{branding.name}</span><span>Tu clinica, mejor organizada.</span></footer>
                </div>
            </main>
        </>
    );
}
