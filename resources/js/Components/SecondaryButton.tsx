import Icon, { IconName } from '@/Components/Icon';
import { ButtonHTMLAttributes, PropsWithChildren } from 'react';

export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    icon,
    ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { icon?: IconName }>) {
    return (
        <button
            {...props}
            type={type}
            className={
                `theme-content-secondary inline-flex items-center rounded-md border border-outline-strong bg-surface-raised px-4 py-2 text-xs font-semibold uppercase tracking-widest shadow-[0_0_10px_color-mix(in_srgb,var(--outline-strong)_45%,transparent)] transition duration-150 ease-in-out hover:border-accent hover:bg-surface-sunken hover:shadow-[0_0_18px_color-mix(in_srgb,var(--accent)_55%,transparent)] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface-raised active:bg-surface-sunken disabled:cursor-not-allowed ${
                    disabled ? 'opacity-50' : ''
                } ` + className
            }
            disabled={disabled}
        >
            {icon && <Icon name={icon} />}
            <span>{children}</span>
        </button>
    );
}
