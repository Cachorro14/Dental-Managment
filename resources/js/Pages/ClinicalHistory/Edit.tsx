import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ClinicalHistory, PageProps, Patient } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';

type Props = {
    patient: Pick<Patient, 'id' | 'first_name' | 'last_name'>;
    clinicalHistory: ClinicalHistory;
    dentists: Array<{ id: number; name: string; license_number: string | null }>;
};

function TextAnswer({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) {
    return <div><InputLabel value={label} /><textarea rows={multiline ? 3 : 1} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 block min-h-12 w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-600 focus:ring-blue-500" /></div>;
}

const intakeLabels: Record<string, string> = {
    father_alive: 'Padre con vida', father_conditions: 'Enfermedades del padre', mother_alive: 'Madre con vida',
    mother_conditions: 'Enfermedades de la madre', has_siblings: 'Tiene hermanos', siblings_health: 'Salud de hermanos',
    diabetes: 'Diabetes', drug_allergy: 'Alergia a medicamentos', anesthesia_allergy: 'Alergia a anestesia',
    penicillin_allergy: 'Alergia a penicilina', medications: 'Medicamentos habituales', medications_last_five_years: 'Medicamentos últimos cinco años',
    previous_surgery: 'Cirugías anteriores', operation_when: 'Fecha de cirugía', pregnant: 'Embarazo', pregnancy_months: 'Meses de embarazo',
    reason: 'Motivo de consulta', had_pain: 'Dolor', pain_intensity: 'Intensidad del dolor', pain_duration: 'Duración del dolor',
    pain_origin: 'Origen del dolor', pain_trigger: 'Desencadenante', pain_location: 'Localización', pain_radiation: 'Irradiación',
};

export default function Edit({ patient, clinicalHistory, dentists }: Props) {
    const { auth } = usePage<PageProps>().props;
    const canEditAssessment = clinicalHistory.canEditAssessment ?? auth.permissions.includes('clinical_history.update_assessment');
    const assessmentForm = useForm({
        allergies: clinicalHistory.allergies ?? '',
        medical_conditions: clinicalHistory.medical_conditions ?? '',
        current_medications: clinicalHistory.current_medications ?? '',
        surgical_history: clinicalHistory.surgical_history ?? '',
        family_history: clinicalHistory.family_history ?? '',
        habits: clinicalHistory.habits ?? '',
        clinical_notes: clinicalHistory.clinical_notes ?? '',
        assessment_data: {
            responsible_dentist_id: clinicalHistory.responsible_dentist_id?.toString() ?? (auth.roles.includes('DENTIST') ? auth.user?.id.toString() ?? '' : ''),
            office_location: '', license_number: '', consultation_reason: '', current_condition: '',
            vital_signs: { blood_pressure: '', pulse: '', temperature: '', weight: '' },
            extraoral_exam: '', intraoral_exam: '', soft_tissue_findings: '', gingival_bleeding: '', pus: '', tooth_mobility: '',
            occlusal_discomfort: '', facial_swelling: '', plaque_index: '', oral_hygiene: '', calculus: '', periodontal_disease: '',
            diagnosis: '', prognosis: '', treatment_plan_notes: '', observations: '', annex_number: '', treatment_plan_date: '',
            ...(clinicalHistory.assessment_data ?? {}),
        },
    });
    const errors = assessmentForm.errors as Record<string, string>;
    const save = (event: FormEvent) => {
        event.preventDefault();
        assessmentForm.patch(route('clinical-history.update', patient.id), { preserveScroll: true });
    };

    return <AuthenticatedLayout header={<div><p className="text-sm font-medium text-blue-600">Historia clínica</p><h1 className="mt-1 text-2xl font-semibold text-slate-900">{patient.first_name} {patient.last_name}</h1></div>}>
        <Head title={`Historia clínica: ${patient.first_name} ${patient.last_name}`} />
        <main className="min-h-[calc(100vh-5rem)] bg-slate-50 px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-5xl space-y-6">
            <div className="flex flex-wrap gap-3"><Link href={route('patients.show', patient.id)} className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 bg-white px-4 font-semibold">Volver al paciente</Link>{auth.permissions.includes('clinical_history.view_intake') && <Link href={route('clinical-history.questionnaire', patient.id)} className="inline-flex min-h-11 items-center rounded-xl border border-blue-200 bg-white px-4 font-semibold text-blue-800">Cuestionario paciente</Link>}{clinicalHistory.canPrint && <Link href={route('clinical-history.print', patient.id)} className="inline-flex min-h-11 items-center rounded-xl bg-slate-800 px-4 font-semibold text-white">Vista para imprimir</Link>}</div>
            <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7"><header className="mb-5"><p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Cuestionario del paciente</p><h2 className="mt-1 text-xl font-bold text-slate-900">Respuestas declaradas</h2><p className="mt-2 text-sm text-slate-600">Actualizado: {clinicalHistory.intake_updated_at ?? 'Sin capturar'} · {clinicalHistory.reviewed_at ? `Revisado: ${clinicalHistory.reviewed_at}` : 'Pendiente de revisión profesional'}</p></header>
                {clinicalHistory.intake_responses ? <div className="grid gap-3 sm:grid-cols-2">{Object.entries(clinicalHistory.intake_responses).flatMap(([section, values]) => Object.entries(values as Record<string, unknown>).filter(([, value]) => value !== '' && value !== null && value !== undefined && value !== false).map(([key, value]) => <div key={`${section}.${key}`} className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-medium uppercase text-slate-500">{intakeLabels[key] ?? key.replaceAll('_', ' ')}</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-900">{value === 'yes' ? 'Sí' : value === 'no' ? 'No' : value === 'unknown' ? 'No sabe' : String(value)}</p></div>))}</div> : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Aún no se han capturado respuestas.</p>}
            </section>
            <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm sm:p-7"><header className="mb-6"><p className="text-sm font-semibold uppercase tracking-wide text-violet-700">Área profesional</p><h2 className="mt-1 text-xl font-bold text-slate-900">Evaluación clínica</h2><p className="mt-2 text-sm text-slate-600">Complete la valoración odontológica profesional de este paciente.</p></header>
                {canEditAssessment ? <form onSubmit={save} className="space-y-6">
                    <fieldset className="grid gap-5 rounded-xl border border-slate-200 p-4 sm:grid-cols-2"><legend className="px-2 font-semibold">Profesional y consulta</legend>
                        <div><InputLabel htmlFor="responsible_dentist" value="Odontólogo responsable asignado" /><select id="responsible_dentist" value={assessmentForm.data.assessment_data.responsible_dentist_id} onChange={(event) => assessmentForm.setData('assessment_data', { ...assessmentForm.data.assessment_data, responsible_dentist_id: event.target.value, license_number: dentists.find((dentist) => String(dentist.id) === event.target.value)?.license_number ?? '' })} className="mt-1 min-h-12 w-full rounded-xl border-slate-300"><option value="">Seleccionar</option>{dentists.map((dentist) => <option key={dentist.id} value={dentist.id}>{dentist.name}</option>)}</select><InputError message={errors['assessment_data.responsible_dentist_id']} /></div>
                        <TextAnswer label="Lugar de atención" value={assessmentForm.data.assessment_data.office_location} onChange={(value) => assessmentForm.setData('assessment_data', { ...assessmentForm.data.assessment_data, office_location: value })} />
                        <TextAnswer label="Número de matrícula" value={assessmentForm.data.assessment_data.license_number} onChange={(value) => assessmentForm.setData('assessment_data', { ...assessmentForm.data.assessment_data, license_number: value })} />
                        <TextAnswer label="Motivo de consulta" value={assessmentForm.data.assessment_data.consultation_reason} onChange={(value) => assessmentForm.setData('assessment_data', { ...assessmentForm.data.assessment_data, consultation_reason: value })} multiline />
                        <TextAnswer label="Padecimiento actual" value={assessmentForm.data.assessment_data.current_condition} onChange={(value) => assessmentForm.setData('assessment_data', { ...assessmentForm.data.assessment_data, current_condition: value })} multiline />
                    </fieldset>
                    <fieldset className="rounded-xl border border-slate-200 p-4"><legend className="px-2 font-semibold">Signos vitales</legend><div className="grid gap-4 sm:grid-cols-4">{([['blood_pressure', 'Presión arterial'], ['pulse', 'Pulso'], ['temperature', 'Temperatura'], ['weight', 'Peso']] as const).map(([key, label]) => <TextAnswer key={key} label={label} value={assessmentForm.data.assessment_data.vital_signs?.[key] ?? ''} onChange={(value) => assessmentForm.setData('assessment_data', { ...assessmentForm.data.assessment_data, vital_signs: { ...assessmentForm.data.assessment_data.vital_signs, [key]: value } })} />)}</div></fieldset>
                    <div className="grid gap-5 sm:grid-cols-2">{(['extraoral_exam', 'intraoral_exam', 'soft_tissue_findings'] as const).map((key) => <TextAnswer key={key} label={({ extraoral_exam: 'Exploración extraoral', intraoral_exam: 'Exploración intraoral', soft_tissue_findings: 'Tejidos blandos y lesiones' })[key]} value={assessmentForm.data.assessment_data[key]} onChange={(value) => assessmentForm.setData('assessment_data', { ...assessmentForm.data.assessment_data, [key]: value })} multiline />)}{(['gingival_bleeding', 'pus', 'tooth_mobility', 'facial_swelling', 'calculus', 'periodontal_disease'] as const).map((key) => <div key={key}><InputLabel value={({ gingival_bleeding: 'Sangrado gingival', pus: 'Supuración', tooth_mobility: 'Movilidad dental', facial_swelling: 'Inflamación facial', calculus: 'Presencia de sarro', periodontal_disease: 'Enfermedad periodontal' })[key]} /><select value={assessmentForm.data.assessment_data[key]} onChange={(event) => assessmentForm.setData('assessment_data', { ...assessmentForm.data.assessment_data, [key]: event.target.value })} className="mt-1 min-h-12 w-full rounded-xl border-slate-300"><option value="">Sin registrar</option><option value="yes">Sí</option><option value="no">No</option><option value="unknown">No evaluado</option></select></div>)}<TextAnswer label="Alteraciones oclusales" value={assessmentForm.data.assessment_data.occlusal_discomfort} onChange={(value) => assessmentForm.setData('assessment_data', { ...assessmentForm.data.assessment_data, occlusal_discomfort: value })} multiline /><TextAnswer label="Índice de placa" value={assessmentForm.data.assessment_data.plaque_index} onChange={(value) => assessmentForm.setData('assessment_data', { ...assessmentForm.data.assessment_data, plaque_index: value })} /><div><InputLabel value="Estado de higiene bucal" /><select value={assessmentForm.data.assessment_data.oral_hygiene} onChange={(event) => assessmentForm.setData('assessment_data', { ...assessmentForm.data.assessment_data, oral_hygiene: event.target.value })} className="mt-1 min-h-12 w-full rounded-xl border-slate-300"><option value="">Sin registrar</option><option value="very_good">Muy bueno</option><option value="good">Bueno</option><option value="poor">Deficiente</option><option value="bad">Malo</option></select></div></div>
                    <div className="grid gap-5 sm:grid-cols-2">{(['allergies', 'medical_conditions', 'current_medications', 'surgical_history', 'family_history', 'habits', 'clinical_notes'] as const).map((key) => <TextAnswer key={key} label={({ allergies: 'Alergias confirmadas', medical_conditions: 'Condiciones médicas relevantes', current_medications: 'Medicamentos actuales', surgical_history: 'Antecedentes quirúrgicos', family_history: 'Antecedentes familiares', habits: 'Hábitos relevantes', clinical_notes: 'Notas clínicas' })[key]} value={assessmentForm.data[key]} onChange={(value) => assessmentForm.setData(key, value)} multiline />)}{(['diagnosis', 'prognosis', 'treatment_plan_notes', 'observations', 'annex_number', 'treatment_plan_date'] as const).map((key) => <TextAnswer key={key} label={({ diagnosis: 'Diagnóstico presuntivo', prognosis: 'Pronóstico', treatment_plan_notes: 'Plan de tratamiento (resumen)', observations: 'Observaciones profesionales', annex_number: 'Continúa en anexo número', treatment_plan_date: 'Fecha del plan de tratamiento' })[key]} value={assessmentForm.data.assessment_data[key]} onChange={(value) => assessmentForm.setData('assessment_data', { ...assessmentForm.data.assessment_data, [key]: value })} multiline={key !== 'treatment_plan_date' && key !== 'annex_number'} />)}</div>
                    <div className="flex flex-wrap gap-3"><PrimaryButton disabled={assessmentForm.processing}>Guardar evaluación</PrimaryButton>{!clinicalHistory.reviewed_at && <button type="button" onClick={() => window.confirm('¿Marcar el cuestionario del paciente como revisado?') && window.location.assign(route('clinical-history.review', patient.id))} className="min-h-11 rounded-xl border border-violet-300 px-4 font-semibold text-violet-800">Marcar cuestionario revisado</button>}</div>{Object.entries(errors).map(([key, message]) => <InputError key={key} message={message} />)}
                </form> : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No tienes permiso para editar la evaluación clínica.</p>}
            </section>
        </div></main>
    </AuthenticatedLayout>;
}
