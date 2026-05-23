import { useCallback, useEffect, useState } from "react";

import { listTemplates } from "@/lib/db/templates";
import { Template } from "@/lib/types";

export function useTemplates(userId: string | undefined, orgId: string | null | undefined) {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(async () => {
        if (!userId && !orgId) { setLoading(false); return; }
        setLoading(true);
        try {
            const all = await listTemplates(userId ?? "", orgId ?? null);
            setTemplates(all);
        } catch {
        } finally {
            setLoading(false);
        }
    }, [userId, orgId]);

    useEffect(() => { refetch(); }, [refetch]);

    return { templates, loading, refetch };
}
