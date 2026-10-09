import { Head, router } from '@inertiajs/react';
import Icon from '@/Components/Icon';

export default function ConfirmWhatsApp({ token, patientName, scheduledAt, confirmed, branding }: { token: string; patientName: string; scheduledAt: string; confirmed: boolean; branding: { name: string; logoUrl: string | null; variant: 'clinical' | 'modern' | 'minimal'; theme: 'light' | 'dark' | 'system' } }) {
    return (
        <main data-theme={branding.theme} data-variant={branding.variant} className="theme-root flex min-h-screen items-center justify-center bg-surface-sunken p-4">
            <Head title="Confirmar cita" />
            <section className="theme-card w-full max-w-lg space-y-5 rounded-2xl border p-6 shadow-sm sm:p-8">
                <div><p className="theme-accent text-sm font-semibold">{branding.name}</p><h1 className="theme-content mt-2 text-2xl font-bold">Confirmación de cita</h1></div>
                <p className="theme-content-secondary">Hola {patientName}, tu cita es el {new Date(scheduledAt).toLocaleString('es-MX')}.</p>
                {confirmed ? <p className="theme-success rounded-xl border p-4 font-semibold">Tu asistencia ya está confirmada. Gracias.</p> : <button type="button" onClick={() => router.post(route('whatsapp.appointments.confirm', token))} className="theme-accent-button inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent"><Icon name="calendar" />Confirmar asistencia</button>}
            </section>
        </main>
    );
}
