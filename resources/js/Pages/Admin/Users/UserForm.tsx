import InputError from "@/Components/InputError";
import ActionLink from "@/Components/ActionLink";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { RoleSummary } from "@/types";
import { Link, useForm } from "@inertiajs/react";
import { FormEvent } from "react";

type AdminUser = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    whatsapp_appointment_consent: boolean;
    whatsapp_appointment_consent_recorded_at?: string | null;
    roles: RoleSummary[];
};

export default function UserForm({
    user,
    roles,
    canManageWhatsAppConsent = false,
    whatsappConsentRecordedBy,
}: {
    user?: AdminUser;
    roles: RoleSummary[];
    canManageWhatsAppConsent?: boolean;
    whatsappConsentRecordedBy?: string | null;
}) {
    const form = useForm({
        name: user?.name ?? "",
        email: user?.email ?? "",
        phone: user?.phone ?? "",
        whatsapp_appointment_consent: user?.whatsapp_appointment_consent ?? false,
        password: "",
        password_confirmation: "",
        roles: user?.roles.map((role) => role.id) ?? [],
    });
    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (user) {
            form.patch(route("admin.users.update", user.id));
        } else {
            form.post(route("admin.users.store"));
        }
    };
    const toggleRole = (roleId: number) =>
        form.setData(
            "roles",
            form.data.roles.includes(roleId)
                ? form.data.roles.filter((id) => id !== roleId)
                : [...form.data.roles, roleId],
        );

    return (
        <form
            onSubmit={submit}
            className="space-y-6 rounded-2xl border theme-outline theme-card p-5 shadow-sm sm:p-7"
        >
            <div>
                <h2 className="text-lg font-semibold theme-content">
                    Datos de acceso
                </h2>
                <p className="mt-1 text-sm theme-content-muted">
                    Los roles determinan las capacidades administrativas y
                    clínicas del usuario.
                </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
                <div>
                    <InputLabel htmlFor="name" value="Nombre" />
                    <TextInput
                        id="name"
                        value={form.data.name}
                        onChange={(event) =>
                            form.setData("name", event.target.value)
                        }
                        className="mt-1 block w-full"
                        required
                    />
                    <InputError message={form.errors.name} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="email" value="Correo electronico" />
                    <TextInput
                        id="email"
                        type="email"
                        value={form.data.email}
                        onChange={(event) =>
                            form.setData("email", event.target.value)
                        }
                        className="mt-1 block w-full"
                        required
                    />
                    <InputError message={form.errors.email} className="mt-2" />
                </div>
            </div>
            <div>
                <InputLabel htmlFor="whatsapp_phone" value="Teléfono para WhatsApp" />
                <TextInput id="whatsapp_phone" type="tel" value={form.data.phone} onChange={(event) => form.setData("phone", event.target.value)} className="mt-1 block w-full" />
                <InputError message={form.errors.phone} className="mt-2" />
            </div>
            {canManageWhatsAppConsent && <fieldset className="theme-success rounded-xl border p-4">
                <label className="flex min-h-11 items-start gap-3 text-sm theme-content">
                    <input type="checkbox" checked={form.data.whatsapp_appointment_consent} onChange={(event) => form.setData("whatsapp_appointment_consent", event.target.checked)} className="mt-1 rounded border-emerald-400 theme-content focus:ring-emerald-500" />
                    <span>Este usuario cuenta con consentimiento físico para recibir avisos operativos de citas por WhatsApp.</span>
                </label>
                <InputError message={form.errors.whatsapp_appointment_consent as string | undefined} className="mt-2" />
                {user?.whatsapp_appointment_consent_recorded_at && <p className="mt-2 text-xs theme-content">Última autorización registrada el {new Date(user.whatsapp_appointment_consent_recorded_at).toLocaleString('es-MX')}{whatsappConsentRecordedBy ? ` por ${whatsappConsentRecordedBy}` : ''}.</p>}
            </fieldset>}
            <div className="grid gap-5 sm:grid-cols-2">
                <div>
                    <InputLabel
                        htmlFor="password"
                        value={
                            user ? "Nueva contrasena (opcional)" : "Contrasena"
                        }
                    />
                    <TextInput
                        id="password"
                        type="password"
                        value={form.data.password}
                        onChange={(event) =>
                            form.setData("password", event.target.value)
                        }
                        className="mt-1 block w-full"
                        required={!user}
                    />
                    <InputError
                        message={form.errors.password}
                        className="mt-2"
                    />
                </div>
                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirmar contrasena"
                    />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        value={form.data.password_confirmation}
                        onChange={(event) =>
                            form.setData(
                                "password_confirmation",
                                event.target.value,
                            )
                        }
                        className="mt-1 block w-full"
                        required={!user}
                    />
                </div>
            </div>
            <div>
                <InputLabel value="Roles" />
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    {roles.map((role) => (
                        <label
                            key={role.id}
                            className="flex min-h-12 items-center gap-3 rounded-xl border theme-outline px-4 py-3 text-sm theme-content-secondary transition hover:border-accent hover:bg-surface-sunken"
                        >
                            <input
                                type="checkbox"
                                checked={form.data.roles.includes(role.id)}
                                onChange={() => toggleRole(role.id)}
                                className="rounded border-outline-strong text-accent focus:ring-accent"
                            />
                            {role.name}
                        </label>
                    ))}
                </div>
                <InputError message={form.errors.roles} className="mt-2" />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
                <PrimaryButton disabled={form.processing}>
                    {user ? "Guardar cambios" : "Crear usuario"}
                </PrimaryButton>
                <ActionLink href={route("admin.users.index")} icon="close" variant="danger">Cancelar</ActionLink>
            </div>
        </form>
    );
}
