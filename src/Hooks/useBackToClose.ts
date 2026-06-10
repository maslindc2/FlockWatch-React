import { useEffect, useRef } from "react";

/**
 * Push a history state when `isOpen` becomes true so the browser back button
 * triggers `onClose`. Replaces the state when the panel closes.
 * @param isOpen - Whether the overlay / panel is visible.
 * @param onClose - Callback invoked when the user presses back.
 */
export function useBackToClose(isOpen: boolean, onClose: () => void) {
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        if (isOpen) {
            history.pushState({ open: true }, "");
        }
    }, [isOpen]);

    useEffect(() => {
        function handlePop() {
            if (isOpen) {
                onCloseRef.current();
            }
        }
        window.addEventListener("popstate", handlePop);
        return () => window.removeEventListener("popstate", handlePop);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            history.replaceState({}, "");
        }
    }, [isOpen]);
}
