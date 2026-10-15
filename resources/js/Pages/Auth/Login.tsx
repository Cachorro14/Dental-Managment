import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import PasswordInput from '@/Components/PasswordInput';
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
                    <div className="theme-success mb-4 rounded-lg border px-3 py-2 text-sm font-medium">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                <div className="space-y-2">
                    <label htmlFor="email" className="theme-content-secondary block text-sm font-medium">Correo electrónico</label>
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="block w-full"
                        aria-label="Correo electronico"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="theme-content-secondary block text-sm font-medium">Contraseña</label>
                    <PasswordInput
                        id="password"
                        name="password"
                        value={data.password}
                        className="block w-full"
                        aria-label="Contrasena"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

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
                        <span className="theme-content-secondary ms-2 text-sm">
                            Recordarme
                        </span>
                    </label>
                </div>

                <div className="flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:items-center sm:justify-end">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="theme-content-secondary rounded-full px-3 py-2 text-center text-sm font-medium transition hover:bg-info-surface hover:text-info-content focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface-raised"
                        >
                            Olvidaste tu contrasena?
                        </Link>
                    )}

                        <PrimaryButton icon="lock" className="justify-center sm:ms-0" disabled={processing}>
                        Ingresar
                    </PrimaryButton>
                </div>
                </form>
            </div>
        </GuestLayout>
    );
}
