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

    return <div className="nav-progress" role="progressbar" aria-label="Cargando página" />;
}
