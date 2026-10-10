import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ActionButton from '@/Components/ActionButton';
import ActionLink from '@/Components/ActionLink';
import Icon from '@/Components/Icon';
import ToothLoader from '@/Components/ToothLoader';
import { Appointment, PageProps, Paginated } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const statusLabels: Record<Appointment['status'], string> = { scheduled: 'Programada', confirmed: 'Confirmada', completed: 'Completada', cancelled: 'Cancelada' };
const statusStyles: Record<Appointment['status'], string> = { scheduled: 'theme-warning', confirmed: 'theme-info', completed: 'theme-success', cancelled: 'theme-muted-surface theme-content-muted' };

export default function Index({ appointments, filters }: PageProps<{ appointments?: Paginated<Appointment>; filters: { from: string; to: string } }>) {
    const permissions = usePage<PageProps>().props.auth.permissions;
    const canCreateAppointments = permissions.includes('appointments.create');
    const canUpdateAppointments = permissions.includes('appointments.update');
    const canDeleteAppointments = permissions.includes('appointments.delete');
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);
    useEffect(() => {
        if (from === filters.from && to === filters.to) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.get(route('appointments.index'), { from, to }, { preserveState: true, preserveScroll: true, replace: true });
        }, 350);

        return () => window.clearTimeout(timeout);
    }, [filters.from, filters.to, from, to]);
    const remove = (appointment: Appointment) => {
        if (window.confirm('¿Eliminar esta cita?')) {
            router.delete(route('appointments.destroy', appointment.id), { preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight theme-content">Citas</h2>}>
            <Head title="Citas" />
            <div className="min-h-[calc(100vh-5rem)] theme-page px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
                            <label className="text-sm theme-content-secondary">Desde<input type="date" value={from} max={to || undefined} onChange={(event) => setFrom(event.target.value)} className="theme-content mt-1 block min-h-11 w-full rounded-xl border-outline-strong bg-surface-raised shadow-sm focus:border-accent focus:ring-accent" /></label>
                            <label className="text-sm theme-content-secondary">Hasta<input type="date" value={to} min={from || undefined} onChange={(event) => setTo(event.target.value)} className="theme-content mt-1 block min-h-11 w-full rounded-xl border-outline-strong bg-surface-raised shadow-sm focus:border-accent focus:ring-accent" /></label>
                        </div>
                        {canCreateAppointments && <ActionLink href={route('appointments.create')} icon="file" variant="accent">Nueva cita</ActionLink>}
                    </div>

                    {appointments ? <section className="theme-card overflow-hidden rounded-2xl border theme-outline shadow-sm">
                        {appointments.data.length === 0 ? (
                            <div className="px-6 py-16 text-center">
                                <div className="theme-info mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border text-2xl">+</div>
                                <h3 className="mt-5 text-lg font-semibold theme-content">No hay citas para esta fecha</h3>
                                <p className="mt-2 text-sm theme-content-muted">Programa una cita nueva o selecciona otra fecha para consultar la agenda.</p>
                                {canCreateAppointments && <ActionLink href={route('appointments.create')} icon="file" variant="accent" className="mt-6">Programar cita</ActionLink>}
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                     <table className="min-w-full divide-y divide-outline">
                                          <thead className="theme-page"><tr><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider theme-content-muted">Fecha</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider theme-content-muted">Paciente</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider theme-content-muted">Dentista</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider theme-content-muted">Estado</th>{(canUpdateAppointments || canDeleteAppointments) && <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider theme-content-muted">Acciones</th>}</tr></thead>
                                          <tbody className="divide-y divide-outline">{appointments.data.map((appointment) => <tr key={appointment.id} className="cursor-pointer transition hover:bg-surface-sunken focus:bg-surface-sunken focus:outline-none" onClick={() => router.visit(route('appointments.show', appointment.id))} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); router.visit(route('appointments.show', appointment.id)); } }} role="link" tabIndex={0} aria-label={`Ver cita de ${appointment.patient?.first_name} ${appointment.patient?.last_name}`}> <td className="whitespace-nowrap px-6 py-4 text-sm theme-content-secondary">{new Date(appointment.scheduled_at).toLocaleString('es-ES')}</td><td className="whitespace-nowrap px-6 py-4 text-sm font-semibold theme-content">{appointment.patient?.first_name} {appointment.patient?.last_name}</td><td className="whitespace-nowrap px-6 py-4 text-sm theme-content-secondary">{appointment.dentist?.name ?? 'Sin asignar'}</td><td className="whitespace-nowrap px-6 py-4"><span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[appointment.status]}`}>{statusLabels[appointment.status]}</span></td>{(canUpdateAppointments || canDeleteAppointments) && <td className="whitespace-nowrap px-6 py-4 text-right text-sm"><div className="flex flex-wrap justify-end gap-2">{canUpdateAppointments && <Link href={route('appointments.edit', appointment.id)} onClick={(event) => event.stopPropagation()} className="table-action-button">Editar</Link>}{canDeleteAppointments && <ActionButton type="button" onClick={(event) => { event.stopPropagation(); remove(appointment); }} icon="archive" variant="danger">Eliminar</ActionButton>}</div></td>}</tr>)}</tbody>
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
