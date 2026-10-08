import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ActionLink from '@/Components/ActionLink';
import { ClinicalHistory, PageProps, Patient } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';

type Answer = 'yes' | 'no' | 'unknown' | '';
type QuestionnaireData = {
    family: Record<string, string>;
    health: Record<string, string>;
    dental: Record<string, string>;
    declaration_accepted: boolean;
    privacy_acknowledged: boolean;
};

const sections = [
    { key: 'family', title: 'Familia' },
    { key: 'health', title: 'Salud general' },
    { key: 'dental', title: 'Consulta y dolor' },
] as const;

const healthQuestions: Record<string, string> = {
    exercise_discomfort: '¿Siente algún malestar al hacer deporte?', drug_allergy: '¿Es alérgico a algún medicamento?',
    anesthesia_allergy: '¿Es alérgico a la anestesia?', penicillin_allergy: '¿Es alérgico a la penicilina?',
    poor_healing_or_bleeding: '¿Sangra mucho o cicatriza mal cuando se lastima?', collagen_disorder: '¿Tiene algún problema de colágeno o hiperlaxitud?',
    rheumatic_fever: '¿Ha tenido fiebre reumática?', diabetes: '¿Tiene diabetes?', heart_condition: '¿Tiene algún problema del corazón?',
    anticoagulants: '¿Toma aspirina o anticoagulantes con frecuencia?', high_blood_pressure: '¿Tiene presión alta?',
    chagas: '¿Tiene o tuvo Chagas?', kidney_condition: '¿Tiene problemas renales?', gastric_ulcer: '¿Tiene úlcera gástrica?',
    hepatitis: '¿Tuvo hepatitis?', liver_condition: '¿Tiene problemas del hígado?', seizures: '¿Tuvo convulsiones?',
    epilepsy: '¿Tiene epilepsia?', sti_history: '¿Ha tenido sífilis o gonorrea?', other_contagious_disease: '¿Tiene otra enfermedad contagiosa?',
    transfusions: '¿Ha recibido transfusiones?', previous_surgery: '¿Le han operado?', respiratory_condition: '¿Tiene problemas respiratorios?',
    smokes: '¿Fuma?', pregnant: '¿Está embarazada?', other_medical_recommendation: '¿Su médico le hizo alguna recomendación especial?',
};

const dentalQuestions: Record<string, string> = {
    previous_professional: '¿Consultó antes con otro profesional por este problema?',
    took_medication: '¿Tomó algún medicamento por este problema?', treatment_result: '¿Obtuvo resultados?', had_pain: '¿Ha tenido dolor?',
    tooth_trauma: '¿Sufrió un golpe en los dientes?', fractured_tooth: '¿Se le fracturó algún diente?',
    speaking_difficulty: '¿Tiene dificultad para hablar?', chewing_difficulty: '¿Tiene dificultad para masticar?',
    opening_difficulty: '¿Tiene dificultad para abrir la boca?', swallowing_difficulty: '¿Tiene dificultad para tragar?',
};

function AnswerChoice({ value, onChange, disabled = false }: { value: string; onChange: (value: Answer) => void; disabled?: boolean }) {
    return <div className="grid grid-cols-3 gap-2">{([['yes', 'Sí'], ['no', 'No'], ['unknown', 'No sé']] as const).map(([answer, label]) => <button key={answer} type="button" aria-pressed={value === answer} disabled={disabled} onClick={() => onChange(value === answer ? '' : answer)} className={`min-h-12 rounded-xl border px-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-default ${value === answer ? 'border-accent theme-accent-button' : 'theme-outline-strong theme-card theme-content-secondary hover:bg-info-surface hover:text-info-content'}`}>{label}</button>)}</div>;
}

function AnswerQuestion({ label, value, onChange, disabled = false }: { label: string; value: string; onChange: (value: Answer) => void; disabled?: boolean }) {
    return <div className="space-y-2 rounded-xl border theme-outline p-4"><p className="font-medium theme-content">{label}</p><AnswerChoice value={value} onChange={onChange} disabled={disabled} /></div>;
}

function TextAnswer({ label, value, onChange, multiline = false, type = 'text', disabled = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; type?: string; disabled?: boolean }) {
    return <div><InputLabel value={label} />{multiline ? <textarea disabled={disabled} rows={3} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 block min-h-12 w-full rounded-xl theme-outline-strong shadow-sm focus:border-accent focus:ring-accent disabled:bg-surface-sunken" /> : <input disabled={disabled} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 block min-h-12 w-full rounded-xl theme-outline-strong shadow-sm focus:border-accent focus:ring-accent disabled:bg-surface-sunken" />}</div>;
}

export default function Questionnaire({ patient, clinicalHistory }: { patient: Pick<Patient, 'id' | 'first_name' | 'last_name'>; clinicalHistory: ClinicalHistory }) {
    const { auth } = usePage<PageProps>().props;
    const canEdit = clinicalHistory.canEditIntake ?? auth.permissions.includes('clinical_history.update_intake');
    const [activeSection, setActiveSection] = useState(0);
    const [tabletMode, setTabletMode] = useState(false);
    const [tabletLocked, setTabletLocked] = useState(false);
    const form = useForm<QuestionnaireData>({
        family: { father_alive: '', father_conditions: '', mother_alive: '', mother_conditions: '', has_siblings: '', siblings_health: '' },
        health: { ...Object.fromEntries(Object.keys(healthQuestions).map((key) => [key, ''])), medications: '', medications_last_five_years: '', sports: '', diabetes_control: '', bleeding_details: '', operation_when: '', pregnancy_months: '', homeopathic_treatment: '', clinician_name: '', referral_clinic: '' },
        dental: { ...Object.fromEntries(Object.keys(dentalQuestions).map((key) => [key, ''])), reason: '', medication_names: '', medication_since: '', treatment_since: '', pain_intensity: '', pain_duration: '', pain_origin: '', pain_trigger: '', pain_location: '', pain_radiation: '', pain_relief: '', trauma_when: '', trauma_details: '', fracture_details: '', fracture_treatment: '' },
        declaration_accepted: false,
        privacy_acknowledged: false,
        ...((clinicalHistory.intake_responses ?? {}) as Partial<QuestionnaireData>),
    });
    const data = form.data;
    const errors = form.errors as Record<string, string>;

    useEffect(() => {
        if (!tabletMode) return;
        let timeout: ReturnType<typeof setTimeout>;
        const reset = () => {
            window.clearTimeout(timeout);
            timeout = window.setTimeout(() => setTabletLocked(true), 5 * 60 * 1000);
        };
        const events: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'touchstart'];
        events.forEach((event) => window.addEventListener(event, reset));
        reset();
        return () => {
            window.clearTimeout(timeout);
            events.forEach((event) => window.removeEventListener(event, reset));
        };
    }, [tabletMode]);

    const setAnswer = (section: 'family' | 'health' | 'dental', key: string, value: string) => form.setData(section, { ...data[section], [key]: value });
    const save = (event: FormEvent) => {
        event.preventDefault();
        form.patch(route('clinical-history.intake.update', patient.id), { preserveScroll: true });
    };
    const exitTablet = () => {
        setTabletMode(false);
        setTabletLocked(false);
        if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
    };
    const text = (section: 'family' | 'health' | 'dental', key: string, label: string, multiline = false, type = 'text') => <TextAnswer key={key} label={label} value={data[section][key] ?? ''} onChange={(value) => setAnswer(section, key, value)} multiline={multiline} type={type} disabled={!canEdit} />;

    return <AuthenticatedLayout header={<div><p className="theme-accent text-sm font-medium">Cuestionario del paciente</p><h1 className="mt-1 text-2xl font-semibold theme-content">{patient.first_name} {patient.last_name}</h1></div>}>
        <Head title={`Cuestionario: ${patient.first_name} ${patient.last_name}`} />
        <main className={`min-h-[calc(100vh-5rem)] theme-page px-4 py-6 sm:px-6 lg:px-8 ${tabletMode ? 'fixed inset-0 z-50 overflow-y-auto theme-muted-surface' : ''}`}>
            <div className={`mx-auto space-y-6 ${tabletMode ? 'max-w-3xl py-6' : 'max-w-4xl'}`}>
                {tabletMode && <div className="flex items-center justify-between"><p className="font-semibold theme-content">Modo paciente · {patient.first_name} {patient.last_name}</p><button type="button" onClick={exitTablet} className="min-h-12 rounded-xl border theme-outline-strong theme-card px-4 font-semibold">Salir del modo paciente</button></div>}
                {tabletMode && tabletLocked && <div className="theme-overlay fixed inset-0 z-[60] grid place-items-center p-6 backdrop-blur-sm"><section className="theme-card max-w-md space-y-4 rounded-2xl border theme-outline p-7 text-center shadow-xl"><h2 className="theme-content text-xl font-bold">Formulario pausado</h2><p className="theme-content-secondary">La pantalla se bloqueó por inactividad para proteger la información.</p><button type="button" onClick={() => setTabletLocked(false)} className="theme-accent-button min-h-12 rounded-xl px-6 font-semibold">Continuar</button><button type="button" onClick={exitTablet} className="theme-content-secondary ml-3 min-h-12 rounded-xl border theme-outline-strong px-6 font-semibold">Salir</button></section></div>}
                {!tabletMode && <div className="flex flex-wrap gap-3">{canEdit && <button type="button" onClick={() => { setTabletMode(true); if (document.fullscreenEnabled) document.documentElement.requestFullscreen().catch(() => undefined); }} className="theme-info inline-flex min-h-11 items-center rounded-xl border px-4 font-semibold">Abrir modo tablet</button>}<ActionLink href={route('patients.show', patient.id)} icon="arrow-left" variant="info">Volver al paciente</ActionLink></div>}
                <section className="theme-card rounded-2xl border theme-outline p-5 shadow-sm sm:p-7"><header className="mb-6"><p className="theme-accent text-sm font-semibold uppercase tracking-wide">Cuestionario del paciente</p><h2 className="mt-1 text-xl font-bold theme-content">Cuéntenos sobre su salud</h2><p className="mt-2 text-sm theme-content-secondary">Responda según lo que sabe. Si no está seguro, elija “No sé”. Esta información será revisada por el odontólogo.</p></header>
                    <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-3">{sections.map((section, index) => <button key={section.key} type="button" onClick={() => setActiveSection(index)} className={`min-h-12 rounded-xl px-3 text-sm font-semibold ${activeSection === index ? 'theme-accent-button' : 'theme-muted-surface theme-content-secondary'}`}>{index + 1}. {section.title}</button>)}</div>
                    <form onSubmit={save} className="space-y-6">
                        {activeSection === 0 && <div className="grid gap-4 sm:grid-cols-2"><AnswerQuestion label="¿Su padre vive?" value={data.family.father_alive} onChange={(value) => setAnswer('family', 'father_alive', value)} disabled={!canEdit} />{text('family', 'father_conditions', 'Si tiene enfermedades, ¿cuáles?', true)}<AnswerQuestion label="¿Su madre vive?" value={data.family.mother_alive} onChange={(value) => setAnswer('family', 'mother_alive', value)} disabled={!canEdit} />{text('family', 'mother_conditions', 'Si tiene enfermedades, ¿cuáles?', true)}<AnswerQuestion label="¿Tiene hermanos?" value={data.family.has_siblings} onChange={(value) => setAnswer('family', 'has_siblings', value)} disabled={!canEdit} />{text('family', 'siblings_health', '¿Cómo es la salud de sus hermanos?', true)}</div>}
                        {activeSection === 1 && <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-2">{Object.entries(healthQuestions).map(([key, label]) => <AnswerQuestion key={key} label={label} value={data.health[key] ?? ''} onChange={(value) => setAnswer('health', key, value)} disabled={!canEdit} />)}</div><div className="grid gap-5 sm:grid-cols-2">{text('health', 'medications', '¿Qué medicamentos consume habitualmente?', true)}{text('health', 'medications_last_five_years', 'Medicamentos consumidos en los últimos cinco años', true)}{text('health', 'sports', '¿Qué deporte realiza?', true)}{text('health', 'diabetes_control', 'Si tiene diabetes, ¿está controlada y con qué?', true)}{text('health', 'bleeding_details', 'Cuéntenos sobre sangrado o cicatrización', true)}{text('health', 'operation_when', 'Si tuvo una operación, ¿cuándo?', true)}{text('health', 'pregnancy_months', 'Si está embarazada, ¿de cuántos meses?')}{text('health', 'homeopathic_treatment', 'Homeopatía, acupuntura u otros tratamientos', true)}{text('health', 'clinician_name', 'Nombre de su médico clínico')}{text('health', 'referral_clinic', 'Clínica u hospital para una derivación', true)}</div></div>}
                        {activeSection === 2 && <div className="space-y-5">{text('dental', 'reason', '¿Por qué acudió a consulta?', true)}<div className="grid gap-4 sm:grid-cols-2">{Object.entries(dentalQuestions).map(([key, label]) => <AnswerQuestion key={key} label={label} value={data.dental[key] ?? ''} onChange={(value) => setAnswer('dental', key, value)} disabled={!canEdit} />)}</div><div className="grid gap-5 sm:grid-cols-2">{text('dental', 'medication_names', 'Nombre de los medicamentos', true)}{text('dental', 'medication_since', '¿Desde cuándo?', true)}{text('dental', 'treatment_since', '¿Cuándo empezó el problema?')}{text('dental', 'pain_intensity', 'Intensidad del dolor (suave, moderado o intenso)')}{text('dental', 'pain_duration', 'Duración (temporal, intermitente o continuo)')}{text('dental', 'pain_origin', '¿Espontáneo o provocado?')}{text('dental', 'pain_trigger', '¿Lo provoca el frío o el calor?')}{text('dental', 'pain_location', '¿Dónde se localiza?', true)}{text('dental', 'pain_radiation', '¿Hacia dónde se irradia?', true)}{text('dental', 'pain_relief', '¿Puede calmarlo con algo?', true)}{text('dental', 'trauma_when', 'Si sufrió un golpe, ¿cuándo?')}{text('dental', 'trauma_details', '¿Cómo se produjo el golpe?', true)}{text('dental', 'fracture_details', '¿Qué diente se fracturó?', true)}{text('dental', 'fracture_treatment', '¿Recibió algún tratamiento?', true)}</div></div>}
                        <div className="space-y-4 border-t theme-outline pt-5"><label className="flex min-h-14 items-start gap-3 rounded-xl theme-page p-4 text-sm"><input type="checkbox" checked={data.declaration_accepted} onChange={(event) => form.setData('declaration_accepted', event.target.checked)} className="mt-1 size-5 rounded border-outline-strong text-accent" /><span>Declaro que respondí honestamente y según mi conocimiento.</span></label><label className="flex min-h-14 items-start gap-3 rounded-xl theme-page p-4 text-sm"><input type="checkbox" checked={data.privacy_acknowledged} onChange={(event) => form.setData('privacy_acknowledged', event.target.checked)} className="mt-1 size-5 rounded border-outline-strong text-accent" /><span>Entiendo que la información se conservará en mi historia clínica y está amparada por el secreto profesional.</span></label>{errors['intake_responses.declaration_accepted'] && <InputError message={errors['intake_responses.declaration_accepted']} />}{errors['intake_responses.privacy_acknowledged'] && <InputError message={errors['intake_responses.privacy_acknowledged']} />}</div>
                        <div className="flex flex-col justify-between gap-3 sm:flex-row">{activeSection > 0 && <button type="button" onClick={() => setActiveSection((current) => Math.max(0, current - 1))} className="min-h-12 rounded-xl border theme-outline-strong px-5 font-semibold">Anterior</button>}<p className="self-center text-sm theme-content-muted">Sección {activeSection + 1} de {sections.length}</p>{activeSection < sections.length - 1 ? <button type="button" onClick={() => setActiveSection((current) => Math.min(sections.length - 1, current + 1))} className="min-h-12 rounded-xl theme-accent-button px-5 font-semibold theme-content-inverse">Siguiente</button> : canEdit && <PrimaryButton disabled={form.processing}>Guardar cuestionario</PrimaryButton>}</div>
                    </form>
                </section>
            </div>
        </main>
    </AuthenticatedLayout>;
}

