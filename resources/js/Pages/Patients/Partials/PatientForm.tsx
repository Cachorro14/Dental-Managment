import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Patient } from '@/types';
import { FormEventHandler } from 'react';
import { useForm } from '@inertiajs/react';

type PatientFormData = {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
    phone: string;
    email: string;
    address: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    medical_notes: string;
};

export default function PatientForm({ patient }: { patient?: Patient }) {
    const editing = Boolean(patient);
    const { data, setData, post, patch, processing, errors } = useForm<PatientFormData>({
        first_name: patient?.first_name ?? '',
        last_name: patient?.last_name ?? '',
        date_of_birth: patient?.date_of_birth ?? '',
        gender: patient?.gender ?? '',
        phone: patient?.phone ?? '',
        email: patient?.email ?? '',
        address: patient?.address ?? '',
        emergency_contact_name: patient?.emergency_contact_name ?? '',
        emergency_contact_phone: patient?.emergency_contact_phone ?? '',
        medical_notes: patient?.medical_notes ?? '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        if (editing) {
            patch(route('patients.update', patient?.id));
            return;
        }

        post(route('patients.store'));
    };

    const field = (name: keyof PatientFormData) => ({
        value: data[name],
        onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
            setData(name, event.target.value),
    });

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
                <div>
                    <InputLabel htmlFor="first_name" value="Nombre" />
                    <TextInput id="first_name" className="mt-1 block w-full" required {...field('first_name')} />
                    <InputError message={errors.first_name} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="last_name" value="Apellidos" />
                    <TextInput id="last_name" className="mt-1 block w-full" required {...field('last_name')} />
                    <InputError message={errors.last_name} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="date_of_birth" value="Fecha de nacimiento" />
                    <TextInput id="date_of_birth" type="date" className="mt-1 block w-full" {...field('date_of_birth')} />
                    <InputError message={errors.date_of_birth} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="gender" value="Sexo" />
                    <select id="gender" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-500" {...field('gender')}>
                        <option value="">No especificado</option>
                        <option value="female">Femenino</option>
                        <option value="male">Masculino</option>
                        <option value="other">Otro</option>
                    </select>
                    <InputError message={errors.gender} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="phone" value="Telefono" />
                    <TextInput id="phone" className="mt-1 block w-full" {...field('phone')} />
                    <InputError message={errors.phone} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput id="email" type="email" className="mt-1 block w-full" {...field('email')} />
                    <InputError message={errors.email} className="mt-2" />
                </div>
            </div>

            <div>
                    <InputLabel htmlFor="address" value="Direccion" />
                <textarea id="address" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-500" rows={3} {...field('address')} />
                <InputError message={errors.address} className="mt-2" />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <div>
                    <InputLabel htmlFor="emergency_contact_name" value="Contacto de emergencia" />
                    <TextInput id="emergency_contact_name" className="mt-1 block w-full" {...field('emergency_contact_name')} />
                    <InputError message={errors.emergency_contact_name} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="emergency_contact_phone" value="Telefono de emergencia" />
                    <TextInput id="emergency_contact_phone" className="mt-1 block w-full" {...field('emergency_contact_phone')} />
                    <InputError message={errors.emergency_contact_phone} className="mt-2" />
                </div>
            </div>

            <div>
                    <InputLabel htmlFor="medical_notes" value="Notas medicas" />
                <textarea id="medical_notes" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-500" rows={4} {...field('medical_notes')} />
                <InputError message={errors.medical_notes} className="mt-2" />
            </div>

            <PrimaryButton disabled={processing}>{editing ? 'Guardar paciente' : 'Crear paciente'}</PrimaryButton>
        </form>
    );
}
