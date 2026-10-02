import InputError from "@/Components/InputError";
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
    roles: RoleSummary[];
};

export default function UserForm({
    user,
    roles,
}: {
    user?: AdminUser;
    roles: RoleSummary[];
}) {
    const form = useForm({
        name: user?.name ?? "",
        email: user?.email ?? "",
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
            className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
            <div>
                <h2 className="text-lg font-semibold text-slate-900">
                    Datos de acceso
                </h2>
                <p className="mt-1 text-sm text-slate-500">
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
                            className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
                        >
                            <input
                                type="checkbox"
                                checked={form.data.roles.includes(role.id)}
                                onChange={() => toggleRole(role.id)}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 hover:text-black"
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
                <Link
                    href={route("admin.users.index")}
                    className="inline-flex items-center justify-center rounded-md border border-blue-200 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-blue-800 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                    Cancelar
                </Link>
            </div>
        </form>
    );
}
