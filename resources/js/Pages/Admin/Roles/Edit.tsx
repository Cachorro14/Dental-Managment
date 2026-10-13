import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import RoleForm from './RoleForm';

type Permission = { id: number; name: string };
type Role = { id: number; name: string; permissions: Permission[] };
type PermissionGroup = { code: string; label: string; description: string; capabilities: { code: string; label: string; description: string; permissions: { id: number; name: string; label: string }[] }[] };
export default function Edit({ role, permissionGroups, systemRole }: { role: Role; permissionGroups: PermissionGroup[]; systemRole: boolean }) { return <AuthenticatedLayout header={<div><p className="theme-accent text-sm font-medium">Administración</p><h1 className="mt-1 text-2xl font-semibold tracking-tight theme-content">Editar rol</h1></div>}><Head title={`Editar ${role.name}`} /><div className="min-h-[calc(100vh-5rem)] theme-page px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-5xl"><RoleForm role={role} permissionGroups={permissionGroups} systemRole={systemRole} /></div></div></AuthenticatedLayout>; }
