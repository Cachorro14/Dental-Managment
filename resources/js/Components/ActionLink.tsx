import Icon, { IconName } from '@/Components/Icon';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

type Variant = 'accent' | 'info' | 'neutral' | 'danger';

export default function ActionLink({ href, icon, variant = 'neutral', children, className = '' }: PropsWithChildren<{ href: string; icon: IconName; variant?: Variant; className?: string }>) {
    return <Link href={href} className={`action-button action-button-${variant} inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}><Icon name={icon} /><span>{children}</span></Link>;
}
