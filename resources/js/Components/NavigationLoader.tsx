import ToothLoader from '@/Components/ToothLoader';
import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function NavigationLoader() {
    const [isNavigating, setIsNavigating] = useState(false);
    const activeVisits = useRef(0);

    useEffect(() => {
        let delay: ReturnType<typeof setTimeout> | undefined;

        const removeStartListener = router.on('start', (event) => {
            if (event.detail.visit.only.length > 0) {
                return;
            }

            activeVisits.current += 1;
            clearTimeout(delay);
            delay = setTimeout(() => setIsNavigating(true), 180);
        });

        const removeFinishListener = router.on('finish', (event) => {
            if (event.detail.visit.only.length > 0) {
                return;
            }

            activeVisits.current = Math.max(activeVisits.current - 1, 0);

            if (activeVisits.current === 0) {
                clearTimeout(delay);
                setIsNavigating(false);
            }
        });

        return () => {
            clearTimeout(delay);
            removeStartListener();
            removeFinishListener();
        };
    }, []);

    if (!isNavigating) {
        return null;
    }

    return (
        <div className="theme-overlay fixed inset-0 z-[100] flex items-center justify-center px-4 backdrop-blur-[1px]" aria-label="Cargando página">
            <div className="theme-card w-full max-w-xs rounded-2xl border theme-outline p-5 shadow-xl">
                <ToothLoader label="Cargando sección…" compact />
            </div>
        </div>
    );
}
