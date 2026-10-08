import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ActionButton from '@/Components/ActionButton';
import ActionLink from '@/Components/ActionLink';
import { PageProps, Patient } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Show({ patient, patientActions, canManageWhatsAppConsent = false, whatsappConsentRecordedBy }: { patient: Patient; patientActions: { update: boolean; assignDentists: boolean; questionnaire: boolean; clinicalHistory: boolean; odontogram: boolean }; canManageWhatsAppConsent?: boolean; whatsappConsentRecordedBy?: string | null }) {
    const { auth, system } = usePage<PageProps>().props;
    const { delete: destroy, processing } = useForm();
    const canUpdate = patientActions.update;
    const canDelete = auth.permissions.includes('patients.delete');
    const canAssignDentists = patientActions.assignDentists;
    const clinicalHistoryEnabled = system.modules.some((module) => module.code === 'CLINICAL_HISTORY' && module.enabled);
    const canViewQuestionnaire = patientActions.questionnaire && clinicalHistoryEnabled;
    const canViewClinicalHistory = patientActions.clinicalHistory && clinicalHistoryEnabled;
    const canViewOdontogram = patientActions.odontogram && system.modules.some((module) => module.code === 'ODONTOGRAM' && module.enabled);
    const canViewTreatments = auth.permissions.includes('treatments.view') && system.modules.some((module) => module.code === 'TREATMENTS' && module.enabled);
    const canViewBilling = auth.permissions.includes('billing.view') && system.modules.some((module) => module.code === 'BILLING' && module.enabled);
    const remove = () => {
        if (window.confirm('Archivar este paciente?')) {
            destroy(route('patients.destroy', patient.id));
        }
    };

    const patientName = `${patient.first_name} ${patient.last_name}`;
    const details: Array<{ label: string; value: string | null }> = [
        { label: 'Fecha de nacimiento', value: patient.date_of_birth },
        { label: 'Sexo', value: patient.gender },
        { label: 'Teléfono', value: patient.phone },
        { label: 'Correo electrónico', value: patient.email },
        { label: 'Dirección', value: patient.address },
        { label: 'Contacto de emergencia', value: patient.emergency_contact_name },
        { label: 'Teléfono de emergencia', value: patient.emergency_contact_phone },
        { label: 'Documento', value: [patient.document_type, patient.document_number].filter(Boolean).join(' ') },
        { label: 'Celular', value: patient.mobile_phone },
        { label: 'Obra social', value: patient.insurance_provider },
        { label: 'Número de afiliación', value: patient.insurance_member_number },
        { label: 'Estado civil', value: patient.marital_status },
        { label: 'Nacionalidad', value: patient.nationality },
        { label: 'Profesión', value: patient.occupation },
        { label: 'Titular de cobertura', value: patient.insurance_holder },
        { label: 'Lugar de trabajo', value: patient.workplace },
        { label: 'Jerarquía o puesto', value: patient.job_title },
    ];

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight theme-content-secondary">Datos del paciente</h2>}>
            <Head title={patientName} />
            <div className="py-12">
                <div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8">
                    <section className="flex flex-col justify-between gap-5 rounded-2xl theme-card p-6 shadow-sm sm:flex-row sm:items-start">
                        <div>
                            <h1 className="text-2xl font-semibold theme-content">{patientName}</h1>
                            <p className="mt-1 text-sm theme-content-muted">Paciente #{patient.id}</p>
                        </div>
                         <div className="flex flex-wrap gap-3">
                             {canUpdate && <ActionLink href={route('patients.edit', patient.id)} icon="edit" variant="accent">Editar</ActionLink>}
                            {canAssignDentists && <ActionLink href={route('patients.dentists.edit', patient.id)} icon="users" variant="accent">Asignar doctores</ActionLink>}
                            {canViewQuestionnaire && <ActionLink href={route('clinical-history.questionnaire', patient.id)} icon="file" variant="info">Cuestionario paciente</ActionLink>}
                            {canViewClinicalHistory && <ActionLink href={route('clinical-history.edit', patient.id)} icon="file" variant="accent">Historia clínica</ActionLink>}
                            {patientActions.odontogram && canViewOdontogram && <ActionLink href={route('odontogram.edit', patient.id)} icon="tooth" variant="accent">Odontograma</ActionLink>}
                            {canViewTreatments && <ActionLink href={route('treatments.index', patient.id)} icon="file" variant="accent">Tratamientos</ActionLink>}
                            {canViewBilling && <ActionLink href={route('billing.show', patient.id)} icon="file" variant="danger">Estado de cuenta</ActionLink>}
                            {canDelete && <ActionButton type="button" onClick={remove} disabled={processing} icon="archive" variant="danger">Archivar</ActionButton>}
                         </div>
                    </section>

                    <dl className="grid gap-6 rounded-2xl theme-card p-6 shadow-sm sm:grid-cols-2">
                        {details.map((detail) => <div key={detail.label}><dt className="text-sm theme-content-muted">{detail.label}</dt><dd className="mt-1 whitespace-pre-wrap theme-content">{detail.value || '-'}</dd></div>)}
                     </dl>
                     {canManageWhatsAppConsent && <section className="theme-success rounded-2xl border p-5"><h2 className="font-semibold">Recordatorios por WhatsApp</h2><p className="mt-1 text-sm">Teléfono: {patient.phone || 'No registrado'} · Consentimiento físico: {patient.whatsapp_reminder_consent ? 'Registrado' : 'No registrado'}</p>{patient.whatsapp_reminder_consent_recorded_at && <p className="mt-1 text-xs">Registrado el {new Date(patient.whatsapp_reminder_consent_recorded_at).toLocaleString('es-MX')}{whatsappConsentRecordedBy ? ` por ${whatsappConsentRecordedBy}` : ''}.</p>}</section>}
                     <div className="flex justify-end">
                         <ActionLink
                             href={route('patients.index')}
                             icon="arrow-left"
                             variant="accent"
                             className="!border-lime-400 !bg-lime-400 !text-slate-950 shadow-[0_0_18px_rgba(163,230,53,0.45)] hover:!border-lime-300 hover:!bg-lime-950 hover:!text-lime-300 hover:shadow-[0_0_24px_rgba(163,230,53,0.65)]"
                         >
                             Regresar
                         </ActionLink>
                     </div>
                 </div>
            </div>
        </AuthenticatedLayout>
    );
}
