import { ButtonHTMLAttributes, PropsWithChildren, ReactNode } from 'react';

type Variant = 'accent' | 'info' | 'neutral' | 'danger';
type IconName = 'archive' | 'arrow-left' | 'close' | 'edit' | 'file' | 'tooth' | 'users';

export default function ActionButton({ icon, variant = 'neutral', children, className = '', ...props }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { icon: IconName; variant?: Variant }>) {
    return <button {...props} className={`action-button action-button-${variant} inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}>
        <ActionIcon name={icon} />
        <span>{children}</span>
    </button>;
}

function ActionIcon({ name }: { name: IconName }): ReactNode {
    const paths: Record<IconName, ReactNode> = {
        archive: <><path d="M3 6h18" /><path d="M5 6v14h14V6" /><path d="M9 10h6" /><path d="m8 6 1-3h6l1 3" /></>,
        'arrow-left': <><path d="m15 18-6-6 6-6" /><path d="M9 12h10" /></>,
        close: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>,
        edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
        file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></>,
        tooth: <><path d="M8 3C5 3 3 5 3 8c0 4 2 5 2 9 0 2 1 4 3 4 2 0 2-3 4-3s2 3 4 3 3-2 3-4c0-4 2-5 2-9 0-3-2-5-5-5-2 0-3 1-4 1S10 3 8 3Z" /></>,
        users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    };

    return <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
