import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Ingresar" />

            <div className="guest-form-surface rounded-xl p-5 sm:p-6">
                {status && (
                    <div className="mb-4 text-sm font-medium text-green-600">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                <div className="relative">
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="peer block w-full placeholder:text-transparent"
                        placeholder=" "
                        aria-label="Correo electronico"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <label htmlFor="email" className="pointer-events-none absolute mt-[-2.55rem] ms-5 text-sm text-slate-400 transition-opacity peer-focus:opacity-0 peer-[:not(:placeholder-shown)]:opacity-0">Correo electronico</label>

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="relative">
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="peer block w-full placeholder:text-transparent"
                        placeholder=" "
                        aria-label="Contrasena"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <label htmlFor="password" className="pointer-events-none absolute mt-[-2.55rem] ms-5 text-sm text-slate-400 transition-opacity peer-focus:opacity-0 peer-[:not(:placeholder-shown)]:opacity-0">Contrasena</label>

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData(
                                    'remember',
                                    (e.target.checked || false) as false,
                                )
                            }
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Recordarme
                        </span>
                    </label>
                </div>

                <div className="flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:items-center sm:justify-end">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded-full px-3 py-2 text-center text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
                        >
                            Olvidaste tu contrasena?
                        </Link>
                    )}

                        <PrimaryButton className="justify-center sm:ms-0" disabled={processing}>
                        Ingresar
                    </PrimaryButton>
                </div>
                </form>
            </div>
        </GuestLayout>
    );
}
