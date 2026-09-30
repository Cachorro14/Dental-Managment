export interface User {
    id: number;
    name: string;
    email: string;
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
    deleted_at?: string | null;
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
