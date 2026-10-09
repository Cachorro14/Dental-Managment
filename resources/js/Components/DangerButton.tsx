import Icon, { IconName } from '@/Components/Icon';
import { ButtonHTMLAttributes, PropsWithChildren } from 'react';

export default function DangerButton({
    className = '',
    disabled,
    children,
    icon,
    ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { icon?: IconName }>) {
    return (
        <button
            {...props}
            className={
                `theme-danger inline-flex items-center rounded-md border px-4 py-2 text-xs font-semibold uppercase tracking-widest shadow-[0_0_12px_color-mix(in_srgb,var(--danger-outline)_55%,transparent)] transition duration-150 ease-in-out hover:opacity-80 hover:shadow-[0_0_20px_color-mix(in_srgb,var(--danger-outline)_80%,transparent)] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface-raised ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {icon && <Icon name={icon} />}
            <span>{children}</span>
        </button>
    );
}
