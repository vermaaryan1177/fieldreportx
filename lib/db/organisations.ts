import {
    arrayRemove,
    arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { Organisation } from "@/lib/types";
import { updateUserProfile } from "./users";

const col = "organisations";

export async function createOrganisation(
    adminUid: string,
    data: Pick<Organisation, "name" | "abn" | "address">,
): Promise<string> {
    const ref = doc(collection(db, col));
    await setDoc(ref, {
        ...data,
        id: ref.id,
        adminUid,
        memberUids: [adminUid],
        createdAt: serverTimestamp(),
    });
    // Link the admin's user profile to this org
    await updateUserProfile(adminUid, {
        organisationId: ref.id,
        role: "admin",
    });
    return ref.id;
}

export async function getOrganisation(
    orgId: string,
): Promise<Organisation | null> {
    const snap = await getDoc(doc(db, col, orgId));
    return snap.exists() ? (snap.data() as Organisation) : null;
}

// Returns the organisation a user belongs to
export async function getUserOrganisation(
    uid: string,
): Promise<Organisation | null> {
    const q = query(
        collection(db, col),
        where("memberUids", "array-contains", uid),
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as Organisation;
}

export async function updateOrganisation(
    orgId: string,
    data: Partial<Pick<Organisation, "name" | "abn" | "address">>,
): Promise<void> {
    await updateDoc(doc(db, col, orgId), data);
}

export async function addMember(orgId: string, uid: string): Promise<void> {
    await updateDoc(doc(db, col, orgId), {
        memberUids: arrayUnion(uid),
    });
    await updateUserProfile(uid, { organisationId: orgId });
}

export async function removeMember(orgId: string, uid: string): Promise<void> {
    await updateDoc(doc(db, col, orgId), {
        memberUids: arrayRemove(uid),
    });
    await updateUserProfile(uid, { organisationId: null });
}
