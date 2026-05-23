import { useCallback, useEffect, useState } from "react";

import { listReportsByUser } from "@/lib/db/reports";
import { toMs } from "@/lib/utils/time";
import { Report } from "@/lib/types";

export function useReports(userId: string | undefined) {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(async () => {
        if (!userId) { setLoading(false); return; }
        setLoading(true);
        try {
            const all = await listReportsByUser(userId);
            all.sort((a, b) => toMs(b.updatedAt) - toMs(a.updatedAt));
            setReports(all);
        } catch {
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => { refetch(); }, [refetch]);

    return { reports, loading, refetch };
}
