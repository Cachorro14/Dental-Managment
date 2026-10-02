import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageProps, RoleSummary } from "@/types";
import { Head } from "@inertiajs/react";
import UserForm from "./UserForm";

export default function Create({ roles }: PageProps<{ roles: RoleSummary[] }>) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <p className="text-sm font-medium text-blue-600">
                        Administracion
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                        Nuevo usuario
                    </h1>
                </div>
            }
        >
            <Head title="Nuevo usuario" />
            <div className="min-h-[calc(100vh-5rem)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    <UserForm roles={roles} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
