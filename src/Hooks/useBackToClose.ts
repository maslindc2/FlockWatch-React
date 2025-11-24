import { useEffect, useRef } from "react";
export function useBackToClose(isOpen, onClose) {
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        if(isOpen){
            history.pushState({open: true}, "");
        }
    }, [isOpen]);

    useEffect(() => {
        function handlePop(){
            if(isOpen){
                onCloseRef.current();
            }
        }
        window.addEventListener("popstate", handlePop);
        return () => window.removeEventListener("popstate", handlePop);
    }, [isOpen]);

    useEffect(() => {
        if(!isOpen){
            history.replaceState({}, "");
        }
    }, [isOpen]);
}