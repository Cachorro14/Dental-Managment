import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageProps, RoleSummary } from "@/types";
import { Head } from "@inertiajs/react";
import UserForm from "./UserForm";

export default function Create({ roles, canManageWhatsAppConsent = false }: PageProps<{ roles: RoleSummary[]; canManageWhatsAppConsent?: boolean }>) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <p className="theme-accent text-sm font-medium">
                        Administracion
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight theme-content">
                        Nuevo usuario
                    </h1>
                </div>
            }
        >
            <Head title="Nuevo usuario" />
            <div className="min-h-[calc(100vh-5rem)] theme-page px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    <UserForm roles={roles} canManageWhatsAppConsent={canManageWhatsAppConsent} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
