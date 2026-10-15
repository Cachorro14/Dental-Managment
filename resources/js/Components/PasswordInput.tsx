import Icon from '@/Components/Icon';
import TextInput from '@/Components/TextInput';
import { forwardRef, InputHTMLAttributes, useState } from 'react';

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
    isFocused?: boolean;
};

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
    { className = '', isFocused = false, ...props },
    ref,
) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className={`relative ${props.value ? 'password-input-filled' : ''}`}>
            <TextInput
                {...props}
                ref={ref}
                type={isVisible ? 'text' : 'password'}
                isFocused={isFocused}
                className={`w-full pe-12 ${className}`}
            />
            <button
                type="button"
                onClick={() => setIsVisible((visible) => !visible)}
                aria-label={isVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={isVisible}
                className="theme-content-muted absolute inset-y-0 end-0 inline-flex min-h-11 w-12 items-center justify-center rounded-e-full transition hover:text-accent focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-accent"
            >
                <Icon name={isVisible ? 'eye-off' : 'eye'} className="h-5 w-5" />
            </button>
        </div>
    );
});

export default PasswordInput;
