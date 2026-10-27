const dateTimeFormatter = new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' });
const dateFormatter = new Intl.DateTimeFormat('es', { dateStyle: 'long', timeZone: 'UTC' });

export const formatDateTime = (value: string) => dateTimeFormatter.format(new Date(value));

// Dates without time (e.g. birth dates) arrive as UTC midnight, so format in UTC to avoid shifting the day.
export const formatDate = (value?: string | null) => (value ? dateFormatter.format(new Date(value)) : '-');
