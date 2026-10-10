import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
} from '@headlessui/react';
import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Modal({
    children,
    show = false,
    maxWidth = '2xl',
    closeable = true,
    onClose = () => {},
}: PropsWithChildren<{
    show: boolean;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    closeable?: boolean;
    onClose: CallableFunction;
}>) {
    const { branding } = usePage<PageProps>().props;

    const close = () => {
        if (closeable) {
            onClose();
        }
    };

    const maxWidthClass = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
    }[maxWidth];

    return (
        <Transition show={show} leave="duration-200">
            <Dialog
                as="div"
                id="modal"
                data-theme={branding.theme}
                data-variant={branding.variant}
                className="fixed inset-0 z-50 overflow-y-auto px-4 py-4 transition-all sm:px-6 sm:py-8"
                onClose={close}
            >
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="theme-overlay absolute inset-0" />
                </TransitionChild>

                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                    <div className="relative flex min-h-full items-center justify-center">
                        <DialogPanel
                            className={`theme-card max-h-[calc(100vh-2rem)] w-full transform overflow-hidden rounded-2xl border theme-outline shadow-2xl transition-all sm:max-h-[calc(100vh-4rem)] ${maxWidthClass}`}
                        >
                            {children}
                        </DialogPanel>
                    </div>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}
