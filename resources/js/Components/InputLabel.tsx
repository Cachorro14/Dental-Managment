import { LabelHTMLAttributes } from 'react';

export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { value?: string }) {
    const isFieldLabel = Boolean(props.htmlFor);

    return (
        <label
            {...props}
            className={
                `${isFieldLabel ? 'floating-input-label ' : ''}theme-content-secondary block text-sm font-semibold tracking-tight ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
