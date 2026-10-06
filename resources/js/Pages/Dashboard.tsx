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
    const canViewBilling = auth.permissions.includes('billing.view') && system.modules.some((module) => module.code === 'BILLING' && module.enabled);
    const currency = usePage<PageProps>().props.clinic['clinic.currency'];

    return (
        <AuthenticatedLayout>
            <Head title="Panel principal" />
            <div className="min-h-[calc(100vh-5rem)] theme-page px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-8">
                    <section className="relative overflow-hidden rounded-3xl theme-accent-button px-6 py-8 shadow-xl sm:px-10 sm:py-10">
                        <div className="relative z-10 max-w-2xl">
                            <p className="theme-content-inverse text-sm font-medium opacity-80">Espacio de trabajo de {branding.name}</p>
                            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Hola, {auth.user?.name.split(' ')[0]}.</h1>
                            <p className="theme-content-inverse mt-3 max-w-xl text-sm leading-6 opacity-90">Mantén tu clínica organizada con una vista clara de pacientes, citas y actividad operativa.</p>
                        </div>
                        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-surface-raised/10 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-32 right-20 h-64 w-64 rounded-full bg-surface-raised/5 blur-3xl" />
                    </section>

                    {dashboard ? (
                        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Metric label="Citas de hoy" value={dashboard.appointmentsToday} hint="Programadas para hoy" accent="bg-accent" />
                            <Metric label="Pacientes registrados" value={dashboard.patients} hint="Registros activos" accent="bg-accent" />
                            <Metric label="Citas pendientes" value={dashboard.pendingAppointments} hint="Programadas o confirmadas" accent="bg-warning-outline" />
                            <Metric label="Actividad clínica" value="Activa" hint="Sistema operativo" accent="bg-success-outline" />
                        </section>
                    ) : (
                        <section className="rounded-2xl border theme-outline theme-card shadow-sm"><ToothLoader label="Cargando resumen" compact /></section>
                    )}

                    {canViewBilling && dashboard?.debtors !== null && dashboard?.debtors !== undefined && (
                        <section className="theme-card rounded-2xl border theme-danger p-6 shadow-sm">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <p className="theme-danger-foreground text-sm font-semibold">Seguimiento financiero</p>
                                    <h2 className="mt-1 text-xl font-bold theme-content">Pacientes con adeudo</h2>
                                </div>
                                <Link href={route('billing.index')} className="theme-danger inline-flex min-h-11 items-center rounded-xl border px-4 py-2 text-sm font-semibold transition hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-accent">Ver estado de cuenta</Link>
                            </div>
                            {dashboard.debtors.length === 0 ? (
                                <p className="mt-5 rounded-xl theme-success rounded-xl border p-4 text-sm font-medium">No hay adeudos pendientes.</p>
                            ) : (
                                <ul className="mt-5 divide-y divide-outline">
                                    {dashboard.debtors.map((patient) => (
                                        <li key={patient.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                                            <Link href={route('billing.show', patient.id)} className="theme-danger-foreground rounded-md px-2 py-1 font-bold underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-accent">{patient.first_name} {patient.last_name}</Link>
                                            <span className="theme-danger-foreground rounded-md px-2 py-1 font-bold tabular-nums">{new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(Number(patient.balance))}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    )}

                    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="rounded-2xl border theme-outline theme-card p-6 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div><p className="theme-accent text-sm font-medium">Acciones rápidas</p><h2 className="mt-1 text-xl font-semibold theme-content">Empieza por lo importante</h2></div>
                                <span className="rounded-full theme-success px-3 py-1 text-xs font-semibold theme-content">Listo</span>
                            </div>
                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                {canCreateAppointments && <Action href={route('appointments.create')} title="Programar una cita" description="Agrega una cita a la agenda" icon="+" />}
                                {canCreatePatients && <Action href={route('patients.create')} title="Registrar paciente" description="Abre un nuevo expediente" icon="+" />}
                                {canViewPatients && <Action href={route('patients.index')} title="Consultar pacientes" description="Busca un expediente" icon="⌕" />}
                                {canViewAppointments && <Action href={route('appointments.index')} title="Ver agenda" description="Consulta las citas programadas" icon="◷" />}
                            </div>
                        </div>

                        <div className="rounded-2xl border theme-outline theme-card p-6 shadow-sm">
                            <p className="theme-accent text-sm font-medium">Agenda próxima</p>
                            <h2 className="mt-1 text-xl font-semibold theme-content">Próximas citas</h2>
                            {!dashboard ? <ToothLoader label="Cargando agenda" compact /> : dashboard.upcoming.length === 0 ? (
                                <p className="mt-5 rounded-xl theme-page p-4 text-sm theme-content-muted">No hay citas próximas para mostrar.</p>
                            ) : (
                                <ul className="mt-5 space-y-3">
                                    {dashboard.upcoming.map((appointment) => <li key={appointment.id} className="flex items-center justify-between gap-3 rounded-xl theme-page p-3"><div><p className="text-sm font-semibold theme-content">{appointment.patient.first_name} {appointment.patient.last_name}</p><p className="mt-1 text-xs theme-content-muted">{new Date(appointment.scheduled_at).toLocaleString('es-MX')}</p></div><span className="theme-info rounded-full border px-2.5 py-1 text-xs font-semibold">{appointment.status === 'confirmed' ? 'Confirmada' : 'Programada'}</span></li>)}
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
    return <div className="theme-card rounded-2xl border p-5 shadow-sm"><div className={`h-2 w-10 rounded-full ${accent}`} /><p className="theme-content-muted mt-5 text-sm">{label}</p><p className="theme-content mt-1 text-2xl font-semibold">{value ?? '—'}</p><p className="theme-content-muted mt-1 text-xs">{hint}</p></div>;
}

function Action({ href, title, description, icon }: { href: string; title: string; description: string; icon: string }) {
    return <Link href={href} className="theme-card group flex items-center gap-4 rounded-xl border p-4 transition hover:-translate-y-0.5 hover:border-accent hover:shadow-sm"><span className="theme-info flex h-10 w-10 items-center justify-center rounded-xl border text-lg font-semibold transition group-hover:opacity-80">{icon}</span><span><span className="block text-sm font-semibold theme-content-secondary">{title}</span><span className="theme-content-muted mt-1 block text-xs">{description}</span></span></Link>;
}
