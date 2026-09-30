import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Form from './Form';
import { PageProps, Patient } from '@/types';
import { Head } from '@inertiajs/react';

export default function Create({ patients, dentists }: PageProps<{ patients: Pick<Patient, 'id' | 'first_name' | 'last_name'>[]; dentists: { id: number; name: string }[] }>) {
    return <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Nueva cita</h2>}><Head title="Nueva cita" /><div className="py-12"><div className="mx-auto max-w-4xl sm:px-6 lg:px-8"><Form patients={patients} dentists={dentists} /></div></div></AuthenticatedLayout>;
}
