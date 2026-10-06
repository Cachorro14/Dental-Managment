import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import RoleForm from './RoleForm';

export default function Create({ permissions }: { permissions: { id: number; name: string }[] }) { return <AuthenticatedLayout header={<div><p className="theme-accent text-sm font-medium">Administración</p><h1 className="mt-1 text-2xl font-semibold tracking-tight theme-content">Nuevo rol</h1></div>}><Head title="Nuevo rol" /><div className="min-h-[calc(100vh-5rem)] theme-page px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-4xl"><RoleForm permissions={permissions} /></div></div></AuthenticatedLayout>; }
