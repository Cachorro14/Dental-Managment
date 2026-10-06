export interface User {
    id: number;
    name: string;
    email: string;
    license_number?: string | null;
    license_number?: string | null;
    email_verified_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User | null;
        roles: string[];
        permissions: string[];
    };
    system: {
        modules: Module[];
        features: Feature[];
    };
    clinic: ClinicSettings;
    branding: Branding;
};

export interface Module {
    code: string;
    label: string;
    dependencies: string[];
    enabled: boolean;
}

export interface RoleSummary {
    id: number;
    name: string;
}

export interface ClinicStaffAssignableRole {
    name: 'RECEPTIONIST' | 'DENTIST';
    label: string;
}

export interface Feature {
    code: string;
    label: string;
    module: string;
    enabled: boolean;
}

export interface ClinicSettings {
    'clinic.name': string;
    'clinic.logo': string | null;
    'clinic.timezone': string;
    'clinic.locale': string;
    'clinic.currency': string;
}

export interface Branding {
    name: string;
    logoUrl: string | null;
    iconUrl: string | null;
    variant: 'clinical' | 'modern' | 'minimal';
    theme: 'light' | 'dark' | 'system';
}

export interface DashboardData {
    patients: number | null;
    appointmentsToday: number | null;
    pendingAppointments: number | null;
    debtors: Array<{
        id: number;
        first_name: string;
        last_name: string;
        balance: string;
    }> | null;
    upcoming: Array<{
        id: number;
        scheduled_at: string;
        status: string;
        patient: Pick<Patient, 'first_name' | 'last_name'>;
    }>;
}

export interface Patient {
    id: number;
    first_name: string;
    last_name: string;
    date_of_birth: string | null;
    gender: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    medical_notes: string | null;
    insurance_provider: string | null;
    insurance_member_number: string | null;
    marital_status: string | null;
    nationality: string | null;
    document_type: string | null;
    document_number: string | null;
    mobile_phone: string | null;
    occupation: string | null;
    insurance_holder: string | null;
    workplace: string | null;
    job_title: string | null;
    insurance_provider: string | null;
    insurance_member_number: string | null;
    marital_status: string | null;
    nationality: string | null;
    document_type: string | null;
    document_number: string | null;
    mobile_phone: string | null;
    occupation: string | null;
    insurance_holder: string | null;
    workplace: string | null;
    job_title: string | null;
    deleted_at?: string | null;
}

export interface DentistSummary {
    id: number;
    name: string;
}

export interface ClinicalHistory {
    id?: number;
    patient_id: number;
    allergies: string | null;
    medical_conditions: string | null;
    current_medications: string | null;
    surgical_history: string | null;
    family_history: string | null;
    habits: string | null;
    clinical_notes: string | null;
    intake_responses?: Record<string, unknown> | null;
    assessment_data?: Record<string, unknown> | null;
    intake_updated_at?: string | null;
    assessment_updated_at?: string | null;
    reviewed_at?: string | null;
    responsible_dentist_id?: number | null;
    canViewAssessment?: boolean;
    canViewIntake?: boolean;
    canEditIntake?: boolean;
    canEditAssessment?: boolean;
    canPrint?: boolean;
}

export type OdontogramStatus =
    | 'not_assessed'
    | 'healthy'
    | 'caries'
    | 'filled'
    | 'crown'
    | 'missing'
    | 'extraction'
    | 'other';

export interface OdontogramEntry {
    tooth_number: number;
    status: OdontogramStatus;
    notes: string;
    findings: OdontogramFinding[];
}

export type OdontogramSurface = 'mesial' | 'distal' | 'vestibular' | 'lingual' | 'occlusal' | 'incisal';

export interface OdontogramFinding {
    surface: OdontogramSurface;
    condition: 'caries' | 'restoration' | 'fracture' | 'wear' | 'lesion' | 'sealant' | 'other';
    severity: 'mild' | 'moderate' | 'severe';
    notes: string;
}

export interface OdontogramAssessmentSummary {
    id: number;
    assessed_at: string;
    created_by: string;
}

export interface Appointment {
    id: number;
    patient_id: number;
    dentist_id: number | null;
    scheduled_at: string;
    duration_minutes: number;
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
    reason: string | null;
    notes: string | null;
    patient?: Pick<Patient, 'id' | 'first_name' | 'last_name'>;
    dentist?: { id: number; name: string } | null;
}

export interface AppointmentFormOptions {
    patients: Pick<Patient, 'id' | 'first_name' | 'last_name'>[];
    dentists: Array<{ id: number; name: string }>;
}

export interface AuditLog {
    id: number;
    event: string;
    auditable_type: string;
    auditable_id: number;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
    user: { id: number; name: string } | null;
    created_at: string;
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}
