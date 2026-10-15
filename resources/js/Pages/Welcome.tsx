import Checkbox from '@/Components/Checkbox';
import ClinicMark from '@/Components/ClinicMark';
import InputError from '@/Components/InputError';
import PasswordInput from '@/Components/PasswordInput';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

type WelcomeProps = PageProps<{
    canResetPassword?: boolean;
    status?: string;
}>;

export default function Welcome({ auth, branding, canResetPassword = false, status }: WelcomeProps) {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Inicio" />
            <main data-theme={branding.theme} data-variant={branding.variant} className="theme-root min-h-screen overflow-hidden bg-surface-sunken text-content">
                <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
                    <header className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3" aria-label={`${branding.name}, inicio`}>
                            {branding.logoUrl ? <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-raised"><img src={branding.logoUrl} alt={branding.name} className="h-full w-full object-cover" /></span> : <ClinicMark className="h-10 w-10 text-accent" />}
                            <span className="font-semibold tracking-tight">{branding.name}</span>
                        </Link>
                        {auth.user && <Link href={route('dashboard')} className="theme-accent-button inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold transition hover:opacity-90">Ir al panel</Link>}
                    </header>

                    <section className="relative grid flex-1 items-center gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,25rem)] lg:gap-16 lg:py-16">
                        <div className="relative z-10 max-w-3xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Gestión clínica inteligente</p>
                            <h1 className="theme-content mt-5 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">Una experiencia más clara para cuidar mejor.</h1>
                            <p className="theme-content-secondary mt-5 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8">Organiza pacientes, citas y operaciones de tu clínica desde un espacio seguro, sencillo y preparado para crecer contigo.</p>
                            <div className="mt-10 flex flex-wrap items-center gap-4">
                                {!auth.user && (
                                    <button
                                        type="button"
                                        onClick={() => setIsLoginOpen(true)}
                                        aria-controls="login-form-panel"
                                        aria-expanded={isLoginOpen}
                                        className="theme-accent-button inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                                    >
                                        Iniciar sesión
                                    </button>
                                )}
                                <span className="theme-content-secondary rounded-full border border-outline px-6 py-3 text-sm">Modular y personalizable</span>
                            </div>
                        </div>

                        {!auth.user && isLoginOpen && (
                            <section id="login-form-panel" className="relative z-10 w-full px-0 py-4 sm:px-2 lg:py-0" aria-labelledby="login-heading">
                                <div className="mb-6 text-center">
                                    <h2 id="login-heading" className="theme-content text-xl font-semibold">Ingresar a {branding.name}</h2>
                                    <p className="theme-content-secondary mt-2 text-sm">Continúa al espacio de tu clínica.</p>
                                </div>

                                {status && <div className="theme-success mb-4 rounded-lg border px-3 py-2 text-sm font-medium">{status}</div>}

                                <form onSubmit={submit} className="space-y-5">
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="theme-content-secondary block text-sm font-medium">Correo electrónico</label>
                                            <TextInput
                                                id="email"
                                                type="email"
                                                name="email"
                                                value={data.email}
                                                className="block w-full"
                                                aria-label="Correo electrónico"
                                                autoComplete="username"
                                                isFocused
                                                onChange={(event) => setData('email', event.target.value)}
                                            />
                                            <InputError message={errors.email} className="mt-2" />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="password" className="theme-content-secondary block text-sm font-medium">Contraseña</label>
                                            <PasswordInput
                                                id="password"
                                                name="password"
                                                value={data.password}
                                                className="block w-full"
                                                aria-label="Contraseña"
                                                autoComplete="current-password"
                                                onChange={(event) => setData('password', event.target.value)}
                                            />
                                            <InputError message={errors.password} className="mt-2" />
                                        </div>

                                        <div className="block">
                                            <label className="flex items-center">
                                                <Checkbox
                                                    name="remember"
                                                    checked={data.remember}
                                                    onChange={(event) => setData('remember', event.target.checked)}
                                                />
                                                <span className="theme-content-secondary ms-2 text-sm">Recordarme</span>
                                            </label>
                                        </div>

                                        <div className="flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:items-center sm:justify-end">
                                            {canResetPassword && (
                                                <Link href={route('password.request')} className="theme-content-secondary rounded-full px-3 py-2 text-center text-sm font-medium transition hover:bg-info-surface hover:text-info-content focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface-raised">
                                                    ¿Olvidaste tu contraseña?
                                                </Link>
                                            )}
                                            <PrimaryButton icon="lock" className="justify-center sm:ms-0" disabled={processing}>
                                                Ingresar
                                            </PrimaryButton>
                                        </div>
                                </form>
                            </section>
                        )}

                        <div className="pointer-events-none absolute -right-48 top-1/2 hidden h-[38rem] w-[38rem] -translate-y-1/2 rounded-full bg-accent/10 blur-3xl lg:block" />
                    </section>

                    <footer className="theme-content-muted flex flex-col gap-2 border-t border-outline pt-5 text-sm sm:flex-row sm:items-center sm:justify-between">
                        <span>{branding.name}</span>
                        <span>Tu clínica, mejor organizada.</span>
                    </footer>
                </div>
            </main>
        </>
    );
}
