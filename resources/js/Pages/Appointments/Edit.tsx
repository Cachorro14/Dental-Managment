import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Form from './Form';
import { Appointment, AppointmentFormOptions, PageProps } from '@/types';
import { Head } from '@inertiajs/react';

export default function Edit({ appointment, formOptions, isDentist }: PageProps<{ appointment: Appointment; formOptions?: AppointmentFormOptions; isDentist: boolean }>) {
    return <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight theme-content">Editar cita</h2>}><Head title="Editar cita" /><div className="py-12"><div className="mx-auto max-w-4xl sm:px-6 lg:px-8"><Form appointment={appointment} patients={formOptions?.patients} dentists={formOptions?.dentists} isDentist={isDentist} /></div></div></AuthenticatedLayout>;
}
