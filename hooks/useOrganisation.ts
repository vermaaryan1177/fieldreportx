import { useCallback, useEffect, useState } from "react";

import { getUserOrganisation } from "@/lib/db/organisations";
import { getUserProfile } from "@/lib/db/users";
import { store } from "@/lib/store";

export interface OrgMember {
    uid: string;
    username: string;
    role: "Admin" | "Member";
}

export function useOrganisation(userId: string | undefined) {
    const [organisations, setOrganisations] = useState<any[]>([]);
    const [selectedOrg, setSelectedOrg] = useState<any | null>(null);
    const [members, setMembers] = useState<OrgMember[]>([]);
    const [loading, setLoading] = useState(true);

    const buildMembers = useCallback(async (org: any, currentUserId: string) => {
        if (!org?.memberUids?.length) { setMembers([]); return; }
        const list: OrgMember[] = await Promise.all(
            org.memberUids.map(async (uid: string) => {
                let username = "Unknown User";
                try {
                    const profile = await getUserProfile(uid);
                    if (profile) username = profile.displayName || profile.email || "Unknown User";
                } catch {}
                if (uid === currentUserId) username = "You";
                return { uid, username, role: uid === org.adminUid ? "Admin" : "Member" };
            }),
        );
        setMembers(list);
    }, []);

    const refetch = useCallback(async () => {
        if (!userId) { setLoading(false); return; }
        try {
            setLoading(true);
            const orgs = await getUserOrganisation(userId);
            setOrganisations(orgs);
            if (orgs.length > 0) {
                const active = orgs.find((o: any) => o.id === store.currentOrgId) ?? orgs[0];
                setSelectedOrg(active);
                store.setCurrentOrgId(active.id);
                await buildMembers(active, userId);
            } else {
                setSelectedOrg(null);
                setMembers([]);
            }
        } catch {
        } finally {
            setLoading(false);
        }
    }, [userId, buildMembers]);

    useEffect(() => { refetch(); }, [refetch]);

    const switchOrg = useCallback(async (org: any) => {
        if (!userId) return;
        setSelectedOrg(org);
        store.setCurrentOrgId(org.id);
        await buildMembers(org, userId);
    }, [userId, buildMembers]);

    return { organisations, selectedOrg, members, loading, refetch, switchOrg, setSelectedOrg, setOrganisations, setMembers };
}
