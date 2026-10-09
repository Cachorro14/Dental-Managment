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
    insurance_provider: string;
    insurance_member_number: string;
    marital_status: string;
    nationality: string;
    document_type: string;
    document_number: string;
    mobile_phone: string;
    occupation: string;
    insurance_holder: string;
    workplace: string;
    job_title: string;
    whatsapp_reminder_consent: boolean;
};

export default function PatientForm({ patient, canManageWhatsAppConsent = false, whatsappConsentRecordedBy }: { patient?: Patient; canManageWhatsAppConsent?: boolean; whatsappConsentRecordedBy?: string | null }) {
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
        insurance_provider: patient?.insurance_provider ?? '',
        insurance_member_number: patient?.insurance_member_number ?? '',
        marital_status: patient?.marital_status ?? '',
        nationality: patient?.nationality ?? '',
        document_type: patient?.document_type ?? '',
        document_number: patient?.document_number ?? '',
        mobile_phone: patient?.mobile_phone ?? '',
        occupation: patient?.occupation ?? '',
        insurance_holder: patient?.insurance_holder ?? '',
        workplace: patient?.workplace ?? '',
        job_title: patient?.job_title ?? '',
        whatsapp_reminder_consent: patient?.whatsapp_reminder_consent ?? false,
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        if (editing) {
            patch(route('patients.update', patient?.id));
            return;
        }

        post(route('patients.store'));
    };

    const field = (name: Exclude<keyof PatientFormData, 'whatsapp_reminder_consent'>) => ({
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
                    <select id="gender" className="mt-1 block w-full rounded-md border-outline-strong shadow-sm focus:border-accent focus:ring-accent" {...field('gender')}>
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
                <textarea id="address" className="mt-1 block w-full rounded-md border-outline-strong shadow-sm focus:border-accent focus:ring-accent" rows={3} {...field('address')} />
                <InputError message={errors.address} className="mt-2" />
            </div>

            <fieldset className="space-y-5 rounded-2xl border theme-outline p-5">
                <legend className="px-2 text-sm font-semibold theme-content-secondary">Datos complementarios de la historia clínica</legend>
                <div className="grid gap-5 sm:grid-cols-2">
                    {([
                        ['document_type', 'Tipo de documento'], ['document_number', 'Número de documento'],
                        ['mobile_phone', 'Teléfono celular'], ['marital_status', 'Estado civil'],
                        ['nationality', 'Nacionalidad'], ['occupation', 'Profesión o actividad'],
                        ['insurance_provider', 'Obra social o aseguradora'], ['insurance_member_number', 'Número de afiliación'],
                        ['insurance_holder', 'Titular de la cobertura'], ['workplace', 'Lugar de trabajo'], ['job_title', 'Jerarquía o puesto'],
                    ] as Array<[Exclude<keyof PatientFormData, 'whatsapp_reminder_consent'>, string]>).map(([name, label]) => (
                        <div key={name}><InputLabel htmlFor={name} value={label} /><TextInput id={name} className="mt-1 block w-full" {...field(name)} /><InputError message={errors[name]} className="mt-2" /></div>
                    ))}
                </div>
            </fieldset>

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

            {canManageWhatsAppConsent && <fieldset className="theme-success rounded-2xl border p-5">
                <legend className="px-2 text-sm font-semibold theme-content">Recordatorios por WhatsApp</legend>
                <label className="flex min-h-12 items-start gap-3 text-sm theme-content">
                    <input type="checkbox" checked={data.whatsapp_reminder_consent} onChange={(event) => setData('whatsapp_reminder_consent', event.target.checked)} className="mt-1 rounded border-emerald-400 theme-content focus:ring-emerald-500" />
                    <span>La persona paciente cuenta con consentimiento físico para recibir recordatorios de citas por WhatsApp.</span>
                </label>
                <InputError message={errors.whatsapp_reminder_consent as string | undefined} className="mt-2" />
                <p className="mt-2 text-xs theme-content">Solo se utilizará para comunicaciones operativas sobre citas. Desmarca la casilla si el consentimiento fue revocado.</p>
                {patient?.whatsapp_reminder_consent_recorded_at && <p className="mt-2 text-xs theme-content">Registrado el {new Date(patient.whatsapp_reminder_consent_recorded_at).toLocaleString('es-MX')}{whatsappConsentRecordedBy ? ` por ${whatsappConsentRecordedBy}` : ''}.</p>}
            </fieldset>}

            <PrimaryButton icon={editing ? 'save' : 'add'} disabled={processing}>{editing ? 'Guardar paciente' : 'Crear paciente'}</PrimaryButton>
        </form>
    );
}
