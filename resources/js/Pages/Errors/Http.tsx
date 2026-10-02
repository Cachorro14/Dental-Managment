import ClinicMark from '@/Components/ClinicMark';
import { Branding, PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

const errorCopy: Record<number, { title: string; message: string }> = {
    403: {
        title: 'No tienes acceso a esta sección',
        message: 'Tu cuenta no cuenta con los permisos necesarios. Si crees que necesitas acceso, comunícate con el administrador de la clínica.',
    },
    404: {
        title: 'No encontramos esta página',
        message: 'Es posible que el enlace haya cambiado o que el contenido ya no esté disponible.',
    },
    500: {
        title: 'Ocurrió un problema',
        message: 'No pudimos completar tu solicitud. Intenta nuevamente en unos momentos.',
    },
    503: {
        title: 'El servicio no está disponible',
        message: 'Estamos realizando tareas de mantenimiento. Intenta nuevamente más tarde.',
    },
};

export default function HttpError({ status }: { status: number }) {
    const { auth, branding } = usePage<PageProps>().props;
    const content = errorCopy[status] ?? errorCopy[500];

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 sm:px-6">
            <Head title={`${status} · ${content.title}`} />
            <main className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-lg sm:p-10">
                {branding.logoUrl ? (
                    <img src={branding.logoUrl} alt={branding.name} className="mx-auto h-16 w-16 rounded-2xl object-contain" />
                ) : (
                    <ClinicMark className="mx-auto h-16 w-16 text-blue-700" />
                )}
                <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">Error {status}</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{content.title}</h1>
                <p className="mt-3 text-sm leading-6 text-slate-600">{content.message}</p>
                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link href={route(auth.user ? 'dashboard' : 'login')} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
                        {auth.user ? 'Volver al panel principal' : 'Ir al inicio de sesión'}
                    </Link>
                    <button type="button" onClick={() => window.history.back()} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
                        Volver a la página anterior
                    </button>
                </div>
            </main>
        </div>
    );
}
