import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ToothLoader from '@/Components/ToothLoader';
import { Appointment, PageProps, Paginated } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

const statusLabels: Record<Appointment['status'], string> = { scheduled: 'Programada', confirmed: 'Confirmada', completed: 'Completada', cancelled: 'Cancelada' };
const statusStyles: Record<Appointment['status'], string> = { scheduled: 'bg-amber-50 text-amber-700', confirmed: 'bg-blue-50 text-blue-700', completed: 'bg-emerald-50 text-emerald-700', cancelled: 'bg-slate-100 text-slate-500' };

export default function Index({ appointments, filters }: PageProps<{ appointments?: Paginated<Appointment>; filters: { date: string } }>) {
    const canCreateAppointments = usePage<PageProps>().props.auth.permissions.includes('appointments.create');
    const [date, setDate] = useState(filters.date);
    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get(route('appointments.index'), { date }, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-slate-900">Citas</h2>}>
            <Head title="Citas" />
            <div className="min-h-[calc(100vh-5rem)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <form onSubmit={submit} className="flex w-full gap-3 sm:w-auto">
                            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="min-w-0 rounded-xl border-slate-300 shadow-sm focus:border-blue-600 focus:ring-blue-500" />
                            <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2">Filtrar</button>
                        </form>
                        {canCreateAppointments && <Link href={route('appointments.create')} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2">Nueva cita</Link>}
                    </div>

                    {appointments ? <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        {appointments.data.length === 0 ? (
                            <div className="px-6 py-16 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-700">+</div>
                                <h3 className="mt-5 text-lg font-semibold text-slate-900">No hay citas para esta fecha</h3>
                                <p className="mt-2 text-sm text-slate-500">Programa una cita nueva o selecciona otra fecha para consultar la agenda.</p>
                                {canCreateAppointments && <Link href={route('appointments.create')} className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2">Programar cita</Link>}
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50"><tr><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Fecha</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Paciente</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Dentista</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</th><th className="px-6 py-4" /></tr></thead>
                                        <tbody className="divide-y divide-slate-100">{appointments.data.map((appointment) => <tr key={appointment.id} className="transition hover:bg-blue-50/40"><td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{new Date(appointment.scheduled_at).toLocaleString('es-ES')}</td><td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900">{appointment.patient?.first_name} {appointment.patient?.last_name}</td><td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{appointment.dentist?.name ?? 'Sin asignar'}</td><td className="whitespace-nowrap px-6 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[appointment.status]}`}>{statusLabels[appointment.status]}</span></td><td className="whitespace-nowrap px-6 py-4 text-right text-sm"><Link href={route('appointments.show', appointment.id)} className="font-semibold text-blue-700 transition hover:text-blue-900">Ver</Link></td></tr>)}</tbody>
                                    </table>
                                </div>
                                <Pagination links={appointments.links} />
                            </>
                        )}
                    </section> : <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><ToothLoader label="Cargando citas" compact /></section>}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function Pagination({ links }: { links: Paginated<Appointment>['links'] }) {
    if (links.length <= 3) {
        return null;
    }

    return <nav aria-label="Paginacion" className="flex flex-wrap gap-2 border-t border-slate-200 p-4">{links.map((link, index) => link.url ? <Link key={index} href={link.url} className={`rounded-lg px-3 py-2 text-sm font-medium transition ${link.active ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`} dangerouslySetInnerHTML={{ __html: link.label }} /> : <span key={index} className="rounded-lg px-3 py-2 text-sm text-slate-400" dangerouslySetInnerHTML={{ __html: link.label }} />)}</nav>;
}
