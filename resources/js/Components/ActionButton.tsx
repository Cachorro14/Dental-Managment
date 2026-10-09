import Icon, { IconName } from '@/Components/Icon';
import { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type Variant = 'accent' | 'info' | 'neutral' | 'danger';

export default function ActionButton({ icon, variant = 'neutral', children, className = '', ...props }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { icon: IconName; variant?: Variant }>) {
    return <button {...props} className={`action-button action-button-${variant} inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus:ring-accent ${className}`}><Icon name={icon} /><span>{children}</span></button>;
}
