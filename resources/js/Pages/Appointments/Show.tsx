import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Appointment, PageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

const statusLabels: Record<Appointment['status'], string> = {
    scheduled: 'Programada',
    confirmed: 'Confirmada',
    completed: 'Completada',
    cancelled: 'Cancelada',
};

export default function Show({ appointment }: PageProps<{ appointment: Appointment }>) {
    const permissions = usePage<PageProps>().props.auth.permissions;
    const canUpdate = permissions.includes('appointments.update');
    const canDelete = permissions.includes('appointments.delete');
    const remove = () => {
        if (window.confirm('¿Eliminar esta cita?')) {
            router.delete(route('appointments.destroy', appointment.id));
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-slate-800">Detalle de la cita</h2>}>
            <Head title="Detalle de la cita" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8">
                    {(canUpdate || canDelete) && <div className="flex flex-wrap justify-end gap-3">
                        {canUpdate && <Link href={route('appointments.edit', appointment.id)} className="inline-flex min-h-11 items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Editar</Link>}
                        {canDelete && <button type="button" onClick={remove} className="inline-flex min-h-11 items-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white">Eliminar</button>}
                    </div>}
                    <dl className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
                        <div><dt className="text-sm text-slate-500">Paciente</dt><dd className="mt-1 text-lg font-semibold text-slate-900">{appointment.patient?.first_name} {appointment.patient?.last_name}</dd></div>
                        <div><dt className="text-sm text-slate-500">Fecha</dt><dd className="mt-1 text-slate-900">{new Date(appointment.scheduled_at).toLocaleString('es-MX')}</dd></div>
                        <div><dt className="text-sm text-slate-500">Duración</dt><dd className="mt-1 text-slate-900">{appointment.duration_minutes} minutos</dd></div>
                        <div><dt className="text-sm text-slate-500">Dentista</dt><dd className="mt-1 text-slate-900">{appointment.dentist?.name ?? 'Sin asignar'}</dd></div>
                        <div><dt className="text-sm text-slate-500">Estado</dt><dd className="mt-1 text-slate-900">{statusLabels[appointment.status]}</dd></div>
                        <div><dt className="text-sm text-slate-500">Motivo</dt><dd className="mt-1 text-slate-900">{appointment.reason ?? '-'}</dd></div>
                        <div><dt className="text-sm text-slate-500">Notas</dt><dd className="mt-1 whitespace-pre-wrap text-slate-900">{appointment.notes ?? '-'}</dd></div>
                    </dl>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
