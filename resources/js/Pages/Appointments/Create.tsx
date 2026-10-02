import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Form from './Form';
import { AppointmentFormOptions, PageProps } from '@/types';
import { Head } from '@inertiajs/react';

export default function Create({ formOptions, isDentist }: PageProps<{ formOptions?: AppointmentFormOptions; isDentist: boolean }>) {
    return <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Nueva cita</h2>}><Head title="Nueva cita" /><div className="py-12"><div className="mx-auto max-w-4xl sm:px-6 lg:px-8"><Form patients={formOptions?.patients} dentists={formOptions?.dentists} isDentist={isDentist} /></div></div></AuthenticatedLayout>;
}
