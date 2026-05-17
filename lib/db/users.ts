import {
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
    updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { UserProfile } from "@/lib/types";

const col = "users";

// Called immediately after Firebase Auth sign-up to create the Firestore profile
export async function createUserProfile(
    uid: string,
    displayName: string,
    email: string,
): Promise<void> {
    await setDoc(doc(db, col, uid), {
        uid,
        displayName,
        email,
        organisationId: null,
        role: "inspector",
        createdAt: serverTimestamp(),
    });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const snap = await getDoc(doc(db, col, uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(
    uid: string,
    data: Partial<Pick<UserProfile, "displayName" | "organisationId" | "role">>,
): Promise<void> {
    await updateDoc(doc(db, col, uid), data);
}
