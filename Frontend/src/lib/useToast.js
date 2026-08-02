import { useCallback, useState } from "react";
export function useToast() {
    const [toast, setToast] = useState(null);
    const show = useCallback((message, tone = "info") => {
        setToast({ message, tone });
        setTimeout(() => setToast(null), 3200);
    }, []);
    return { toast, show };
}
