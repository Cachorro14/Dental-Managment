import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ToothLoader from '@/Components/ToothLoader';
import { Appointment, PageProps, Paginated } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

const statusLabels: Record<Appointment['status'], string> = { scheduled: 'Programada', confirmed: 'Confirmada', completed: 'Completada', cancelled: 'Cancelada' };
const statusStyles: Record<Appointment['status'], string> = { scheduled: 'theme-warning', confirmed: 'theme-info', completed: 'theme-success', cancelled: 'theme-muted-surface theme-content-muted' };

export default function Index({ appointments, filters }: PageProps<{ appointments?: Paginated<Appointment>; filters: { date: string } }>) {
    const canCreateAppointments = usePage<PageProps>().props.auth.permissions.includes('appointments.create');
    const [date, setDate] = useState(filters.date);
    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get(route('appointments.index'), { date }, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight theme-content">Citas</h2>}>
            <Head title="Citas" />
            <div className="min-h-[calc(100vh-5rem)] theme-page px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <form onSubmit={submit} className="flex w-full gap-3 sm:w-auto">
                            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="theme-content min-w-0 rounded-xl border-outline-strong bg-surface-raised shadow-sm focus:border-accent focus:ring-accent" />
                            <button className="theme-accent-button rounded-xl px-4 py-2 text-sm font-semibold transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface-raised">Filtrar</button>
                        </form>
                        {canCreateAppointments && <Link href={route('appointments.create')} className="theme-accent-button inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition hover:opacity-90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface-raised">Nueva cita</Link>}
                    </div>

                    {appointments ? <section className="theme-card overflow-hidden rounded-2xl border theme-outline shadow-sm">
                        {appointments.data.length === 0 ? (
                            <div className="px-6 py-16 text-center">
                                <div className="theme-info mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border text-2xl">+</div>
                                <h3 className="mt-5 text-lg font-semibold theme-content">No hay citas para esta fecha</h3>
                                <p className="mt-2 text-sm theme-content-muted">Programa una cita nueva o selecciona otra fecha para consultar la agenda.</p>
                                {canCreateAppointments && <Link href={route('appointments.create')} className="theme-accent-button mt-6 inline-flex min-h-11 items-center rounded-xl px-4 py-2 text-sm font-semibold transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent">Programar cita</Link>}
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                     <table className="min-w-full divide-y divide-outline">
                                        <thead className="bg-surface-sunken"><tr><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider theme-content-muted">Fecha</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider theme-content-muted">Paciente</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider theme-content-muted">Dentista</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider theme-content-muted">Estado</th><th className="px-6 py-4" /></tr></thead>
                                        <tbody className="divide-y divide-outline">{appointments.data.map((appointment) => <tr key={appointment.id} className="transition hover:bg-surface-sunken"><td className="whitespace-nowrap px-6 py-4 text-sm theme-content-secondary">{new Date(appointment.scheduled_at).toLocaleString('es-ES')}</td><td className="whitespace-nowrap px-6 py-4 text-sm font-semibold theme-content">{appointment.patient?.first_name} {appointment.patient?.last_name}</td><td className="whitespace-nowrap px-6 py-4 text-sm theme-content-secondary">{appointment.dentist?.name ?? 'Sin asignar'}</td><td className="whitespace-nowrap px-6 py-4"><span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[appointment.status]}`}>{statusLabels[appointment.status]}</span></td><td className="whitespace-nowrap px-6 py-4 text-right text-sm"><Link href={route('appointments.show', appointment.id)} className="theme-accent font-semibold transition hover:underline">Ver</Link></td></tr>)}</tbody>
                                    </table>
                                </div>
                                <Pagination links={appointments.links} />
                            </>
                        )}
                    </section> : <section className="rounded-2xl border theme-outline theme-card shadow-sm"><ToothLoader label="Cargando citas" compact /></section>}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function Pagination({ links }: { links: Paginated<Appointment>['links'] }) {
    if (links.length <= 3) {
        return null;
    }

    return <nav aria-label="Paginación" className="flex flex-wrap gap-2 border-t theme-outline p-4">{links.map((link, index) => link.url ? <Link key={index} href={link.url} className={`rounded-lg px-3 py-2 text-sm font-medium transition ${link.active ? 'theme-accent-button' : 'theme-content-secondary hover:bg-info-surface hover:text-info-content'}`} dangerouslySetInnerHTML={{ __html: link.label }} /> : <span key={index} className="theme-content-muted rounded-lg px-3 py-2 text-sm" dangerouslySetInnerHTML={{ __html: link.label }} />)}</nav>;
}
