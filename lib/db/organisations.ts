// import {
//     arrayRemove,
//     arrayUnion,
//     collection,
//     doc,
//     getDoc,
//     getDocs,
//     query,
//     setDoc,
//     updateDoc,
//     where,
// } from "firebase/firestore";

// import { db as firestoreDb } from "@/lib/firebase";
// import { Organisation } from "@/lib/types";
// import { sqliteDb } from "./database";
// import { updateUserProfile } from "./users";

// const col = "organisations";

// type SQLiteOrg = {
//     id: string;
//     name: string;
//     abn: string;
//     address: string;
//     adminUid: string;
//     memberUids: string; // JSON-encoded string[]
//     createdAt: number;
// };

// function fromRow(row: SQLiteOrg): Organisation {
//     return {
//         id: row.id,
//         name: row.name,
//         abn: row.abn,
//         address: row.address,
//         adminUid: row.adminUid,
//         memberUids: JSON.parse(row.memberUids),
//         createdAt: row.createdAt,
//     };
// }

// function toMs(value: unknown): number {
//     if (typeof value === "number") return value;
//     if (value && typeof (value as any).toMillis === "function")
//         return (value as any).toMillis();
//     return Date.now();
// }

// async function cacheOrg(org: Organisation): Promise<void> {
//     await sqliteDb.runAsync(
//         `INSERT OR REPLACE INTO organisations
//          (id, name, abn, address, adminUid, memberUids, createdAt)
//          VALUES (?, ?, ?, ?, ?, ?, ?)`,
//         [
//             org.id,
//             org.name,
//             org.abn,
//             org.address,
//             org.adminUid,
//             JSON.stringify(org.memberUids),
//             org.createdAt,
//         ],
//     );
// }

// export async function createOrganisation(
//     adminUid: string,
//     data: Pick<Organisation, "name" | "abn" | "address">,
// ): Promise<string> {
//     const ref = doc(collection(firestoreDb, col));
//     const org: Organisation = {
//         ...data,
//         id: ref.id,
//         adminUid,
//         memberUids: [adminUid],
//         createdAt: Date.now(),
//     };
//     await setDoc(ref, org);
//     await cacheOrg(org);
//     await updateUserProfile(adminUid, { organisationId: ref.id, role: "admin" });
//     return ref.id;
// }

// export async function getOrganisation(
//     orgId: string,
// ): Promise<Organisation | null> {
//     // SQLite first
//     const cached = await sqliteDb.getFirstAsync<SQLiteOrg>(
//         "SELECT * FROM organisations WHERE id = ?",
//         [orgId],
//     );
//     if (cached) return fromRow(cached);

//     // Firestore fallback
//     const snap = await getDoc(doc(firestoreDb, col, orgId));
//     if (!snap.exists()) return null;

//     const raw = snap.data();
//     const org: Organisation = {
//         id: raw.id,
//         name: raw.name,
//         abn: raw.abn,
//         address: raw.address,
//         adminUid: raw.adminUid,
//         memberUids: raw.memberUids ?? [],
//         createdAt: toMs(raw.createdAt),
//     };
//     await cacheOrg(org);
//     return org;
// }

// // Uses the cached user row to avoid a Firestore query for the common case.
// export async function getUserOrganisation(
//     uid: string,
// ): Promise<Organisation | null> {
//     const userRow = await sqliteDb.getFirstAsync<{ organisationId: string | null }>(
//         "SELECT organisationId FROM users WHERE uid = ?",
//         [uid],
//     );
//     if (userRow?.organisationId) {
//         return getOrganisation(userRow.organisationId);
//     }

//     // Firestore fallback (user not cached yet)
//     const q = query(
//         collection(firestoreDb, col),
//         where("memberUids", "array-contains", uid),
//     );
//     const snap = await getDocs(q);
//     if (snap.empty) return null;

//     const raw = snap.docs[0].data();
//     const org: Organisation = {
//         id: raw.id,
//         name: raw.name,
//         abn: raw.abn,
//         address: raw.address,
//         adminUid: raw.adminUid,
//         memberUids: raw.memberUids ?? [],
//         createdAt: toMs(raw.createdAt),
//     };
//     await cacheOrg(org);
//     return org;
// }

// export async function updateOrganisation(
//     orgId: string,
//     data: Partial<Pick<Organisation, "name" | "abn" | "address">>,
// ): Promise<void> {
//     await updateDoc(doc(firestoreDb, col, orgId), data);

//     const cached = await sqliteDb.getFirstAsync<SQLiteOrg>(
//         "SELECT * FROM organisations WHERE id = ?",
//         [orgId],
//     );
//     if (cached) {
//         await cacheOrg({ ...fromRow(cached), ...data });
//     }
// }

// export async function addMember(orgId: string, uid: string): Promise<void> {
//     await updateDoc(doc(firestoreDb, col, orgId), {
//         memberUids: arrayUnion(uid),
//     });

//     const cached = await sqliteDb.getFirstAsync<SQLiteOrg>(
//         "SELECT * FROM organisations WHERE id = ?",
//         [orgId],
//     );
//     if (cached) {
//         const org = fromRow(cached);
//         org.memberUids = [...new Set([...org.memberUids, uid])];
//         await cacheOrg(org);
//     }

//     await updateUserProfile(uid, { organisationId: orgId });
// }

// export async function removeMember(orgId: string, uid: string): Promise<void> {
//     await updateDoc(doc(firestoreDb, col, orgId), {
//         memberUids: arrayRemove(uid),
//     });

//     const cached = await sqliteDb.getFirstAsync<SQLiteOrg>(
//         "SELECT * FROM organisations WHERE id = ?",
//         [orgId],
//     );
//     if (cached) {
//         const org = fromRow(cached);
//         org.memberUids = org.memberUids.filter((m) => m !== uid);
//         await cacheOrg(org);
//     }

//     await updateUserProfile(uid, { organisationId: null });
// }







import {
    arrayRemove,
    arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";

import { db as firestoreDb } from "@/lib/firebase";
import { Organisation } from "@/lib/types";
import { sqliteDb } from "./database";
import { updateUserProfile } from "./users";

const col = "organisations";

type SQLiteOrg = {
    id: string;
    name: string;
    abn: string;
    address: string;
    adminUid: string;
    memberUids: string;
    createdAt: number;
};

function fromRow(row: SQLiteOrg): Organisation {
    return {
        id: row.id,
        name: row.name,
        abn: row.abn,
        address: row.address,
        adminUid: row.adminUid,
        memberUids: JSON.parse(row.memberUids || "[]"),
        createdAt: row.createdAt,
    };
}

function toMs(value: any): number {
    if (typeof value === "number") return value;
    if (value?.toMillis) return value.toMillis();
    return Date.now();
}

async function cacheOrg(org: Organisation): Promise<void> {
    try {
        await sqliteDb.runAsync(
            `INSERT OR REPLACE INTO organisations
             (id, name, abn, address, adminUid, memberUids, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                org.id,
                org.name,
                org.abn,
                org.address,
                org.adminUid,
                JSON.stringify(org.memberUids || []),
                org.createdAt,
            ],
        );
    } catch (e) {
        console.log("SQLite cache error:", e);
    }
}

export async function createOrganisation(
    adminUid: string,
    data: Pick<Organisation, "name" | "abn" | "address">,
): Promise<string> {
    try {
        const ref = doc(collection(firestoreDb, col));

        const org: Organisation = {
            ...data,
            id: ref.id,
            adminUid,
            memberUids: [adminUid],
            createdAt: Date.now(),
        };

        // 🔥 Firestore write (critical path)
        await setDoc(ref, org);

        // ⚡ parallel non-critical updates (faster)
        await Promise.all([
            updateUserProfile(adminUid, {
                organisationId: ref.id,
                role: "admin",
            }),
            cacheOrg(org),
        ]);

        return ref.id;
    } catch (e) {
        console.log("CREATE ORG ERROR:", e);
        throw e;
    }
}

export async function getOrganisation(
    orgId: string,
): Promise<Organisation | null> {
    const cached = await sqliteDb.getFirstAsync<SQLiteOrg>(
        "SELECT * FROM organisations WHERE id = ?",
        [orgId],
    );

    if (cached) return fromRow(cached);

    const snap = await getDoc(doc(firestoreDb, col, orgId));
    if (!snap.exists()) return null;

    const raw = snap.data();

    const org: Organisation = {
        id: raw.id,
        name: raw.name,
        abn: raw.abn,
        address: raw.address,
        adminUid: raw.adminUid,
        memberUids: raw.memberUids ?? [],
        createdAt: toMs(raw.createdAt),
    };

    await cacheOrg(org);
    return org;
}

export async function getUserOrganisation(uid: string): Promise<Organisation | null> {
    const userRow = await sqliteDb.getFirstAsync<{ organisationId: string | null }>(
        "SELECT organisationId FROM users WHERE uid = ?",
        [uid],
    );

    if (userRow?.organisationId) {
        return getOrganisation(userRow.organisationId);
    }

    const q = query(
        collection(firestoreDb, col),
        where("memberUids", "array-contains", uid),
    );

    const snap = await getDocs(q);
    if (snap.empty) return null;

    const raw = snap.docs[0].data();

    const org: Organisation = {
        id: raw.id,
        name: raw.name,
        abn: raw.abn,
        address: raw.address,
        adminUid: raw.adminUid,
        memberUids: raw.memberUids ?? [],
        createdAt: toMs(raw.createdAt),
    };

    await cacheOrg(org);
    return org;
}

export async function updateOrganisation(
    orgId: string,
    data: Partial<Pick<Organisation, "name" | "abn" | "address">>,
): Promise<void> {
    await updateDoc(doc(firestoreDb, col, orgId), data);

    const cached = await sqliteDb.getFirstAsync<SQLiteOrg>(
        "SELECT * FROM organisations WHERE id = ?",
        [orgId],
    );

    if (cached) {
        await cacheOrg({ ...fromRow(cached), ...data });
    }
}

export async function addMember(orgId: string, uid: string): Promise<void> {
    await updateDoc(doc(firestoreDb, col, orgId), {
        memberUids: arrayUnion(uid),
    });

    const cached = await sqliteDb.getFirstAsync<SQLiteOrg>(
        "SELECT * FROM organisations WHERE id = ?",
        [orgId],
    );

    if (cached) {
        const org = fromRow(cached);
        org.memberUids = [...new Set([...org.memberUids, uid])];
        await cacheOrg(org);
    }

    await updateUserProfile(uid, { organisationId: orgId });
}

export async function removeMember(orgId: string, uid: string): Promise<void> {
    await updateDoc(doc(firestoreDb, col, orgId), {
        memberUids: arrayRemove(uid),
    });

    const cached = await sqliteDb.getFirstAsync<SQLiteOrg>(
        "SELECT * FROM organisations WHERE id = ?",
        [orgId],
    );

    if (cached) {
        const org = fromRow(cached);
        org.memberUids = org.memberUids.filter((m) => m !== uid);
        await cacheOrg(org);
    }

    await updateUserProfile(uid, { organisationId: null });
}