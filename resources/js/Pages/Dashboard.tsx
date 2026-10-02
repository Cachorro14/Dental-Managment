import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ToothLoader from '@/Components/ToothLoader';
import { DashboardData, PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Dashboard() {
    const { auth, system, branding, dashboard } = usePage<PageProps<{ dashboard?: DashboardData }>>().props;
    const canViewPatientRecords = auth.permissions.includes('patients.view_all') || auth.roles.includes('DENTIST');
    const canCreatePatients = auth.permissions.includes('patients.create') && canViewPatientRecords && system.modules.some((module) => module.code === 'PATIENTS' && module.enabled);
    const canViewPatients = auth.permissions.includes('patients.view') && canViewPatientRecords && system.modules.some((module) => module.code === 'PATIENTS' && module.enabled);
    const canCreateAppointments = auth.permissions.includes('appointments.create') && canViewPatientRecords && system.modules.some((module) => module.code === 'APPOINTMENTS' && module.enabled);
    const canViewAppointments = auth.permissions.includes('appointments.view') && canViewPatientRecords && system.modules.some((module) => module.code === 'APPOINTMENTS' && module.enabled);

    return (
        <AuthenticatedLayout>
            <Head title="Panel principal" />
            <div className="min-h-[calc(100vh-5rem)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-8">
                    <section className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-8 text-white shadow-xl sm:px-10 sm:py-10">
                        <div className="relative z-10 max-w-2xl">
                            <p className="text-sm font-medium text-teal-300">Espacio de trabajo de {branding.name}</p>
                            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Hola, {auth.user?.name.split(' ')[0]}.</h1>
                            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Mantén tu clínica organizada con una vista clara de pacientes, citas y actividad operativa.</p>
                        </div>
                        <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl" />
                        <div className="absolute -bottom-32 right-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
                    </section>

                    {dashboard ? (
                        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Metric label="Citas de hoy" value={dashboard.appointmentsToday} hint="Programadas para hoy" accent="bg-teal-500" />
                            <Metric label="Pacientes registrados" value={dashboard.patients} hint="Registros activos" accent="bg-blue-500" />
                            <Metric label="Citas pendientes" value={dashboard.pendingAppointments} hint="Programadas o confirmadas" accent="bg-amber-500" />
                            <Metric label="Actividad clínica" value="Activa" hint="Sistema operativo" accent="bg-violet-500" />
                        </section>
                    ) : (
                        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><ToothLoader label="Cargando resumen" compact /></section>
                    )}

                    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div><p className="text-sm font-medium text-teal-600">Acciones rápidas</p><h2 className="mt-1 text-xl font-semibold text-slate-900">Empieza por lo importante</h2></div>
                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Listo</span>
                            </div>
                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                {canCreateAppointments && <Action href={route('appointments.create')} title="Programar una cita" description="Agrega una cita a la agenda" icon="+" />}
                                {canCreatePatients && <Action href={route('patients.create')} title="Registrar paciente" description="Abre un nuevo expediente" icon="+" />}
                                {canViewPatients && <Action href={route('patients.index')} title="Consultar pacientes" description="Busca un expediente" icon="⌕" />}
                                {canViewAppointments && <Action href={route('appointments.index')} title="Ver agenda" description="Consulta las citas programadas" icon="◷" />}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <p className="text-sm font-medium text-blue-600">Agenda próxima</p>
                            <h2 className="mt-1 text-xl font-semibold text-slate-900">Próximas citas</h2>
                            {!dashboard ? <ToothLoader label="Cargando agenda" compact /> : dashboard.upcoming.length === 0 ? (
                                <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No hay citas próximas para mostrar.</p>
                            ) : (
                                <ul className="mt-5 space-y-3">
                                    {dashboard.upcoming.map((appointment) => <li key={appointment.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"><div><p className="text-sm font-semibold text-slate-900">{appointment.patient.first_name} {appointment.patient.last_name}</p><p className="mt-1 text-xs text-slate-500">{new Date(appointment.scheduled_at).toLocaleString('es-MX')}</p></div><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{appointment.status === 'confirmed' ? 'Confirmada' : 'Programada'}</span></li>)}
                                </ul>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function Metric({ label, value, hint, accent }: { label: string; value: number | null | string; hint: string; accent: string }) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className={`h-2 w-10 rounded-full ${accent}`} /><p className="mt-5 text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold text-slate-900">{value ?? '—'}</p><p className="mt-1 text-xs text-slate-400">{hint}</p></div>;
}

function Action({ href, title, description, icon }: { href: string; title: string; description: string; icon: string }) {
    return <Link href={href} className="group flex items-center gap-4 rounded-xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-sm"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-lg font-semibold text-teal-700 transition group-hover:bg-teal-600 group-hover:text-white">{icon}</span><span><span className="block text-sm font-semibold text-slate-800">{title}</span><span className="mt-1 block text-xs text-slate-500">{description}</span></span></Link>;
}
