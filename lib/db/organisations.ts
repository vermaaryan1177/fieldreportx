
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

const col = "organisations";

/**
 * SQLITE TYPE
 */
type SQLiteOrg = {
  id: string;
  name: string;
  abn: string;
  address: string;
  adminUid: string;
  memberUids: string;
  createdAt: number;
};

/**
 * MAP SQLITE → MODEL
 */
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

/**
 * TIMESTAMP SAFE CONVERT
 */
function toMs(value: any): number {
  if (typeof value === "number") return value;
  if (value?.toMillis) return value.toMillis();
  return Date.now();
}

/**
 * CACHE ORG LOCALLY
 */
async function cacheOrg(org: Organisation) {
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
      ]
    );
  } catch (e) {
    console.log("SQLite cache error:", e);
  }
}

/**
 * CREATE ORGANISATION (FIXED)
 */
export async function createOrganisation(
  adminUid: string,
  data: Pick<Organisation, "name" | "abn" | "address">
): Promise<string> {
  try {
    const ref = doc(collection(firestoreDb, col));

    const org: Organisation = {
      id: ref.id,
      name: data.name,
      abn: data.abn,
      address: data.address,
      adminUid,
      memberUids: [adminUid],
      createdAt: Date.now(),
    };

    await setDoc(ref, org);

    await cacheOrg(org);

    return ref.id;
  } catch (e) {
    console.log("CREATE ORG ERROR:", e);
    throw e;
  }
}

/**
 * GET SINGLE ORGANISATION
 */
export async function getOrganisation(
  orgId: string
): Promise<Organisation | null> {
  try {
    const cached = await sqliteDb.getFirstAsync<SQLiteOrg>(
      "SELECT * FROM organisations WHERE id = ?",
      [orgId]
    );

    if (cached) return fromRow(cached);

    const snap = await getDoc(doc(firestoreDb, col, orgId));
    if (!snap.exists()) return null;

    const raw = snap.data();

    const org: Organisation = {
      id: snap.id,
      name: raw.name,
      abn: raw.abn,
      address: raw.address,
      adminUid: raw.adminUid,
      memberUids: raw.memberUids ?? [],
      createdAt: toMs(raw.createdAt),
    };

    await cacheOrg(org);

    return org;
  } catch (e) {
    console.log("GET ORG ERROR:", e);
    return null;
  }
}

/**
 * GET ALL USER ORGANISATIONS (MULTI-ORG FIX)
 */
export async function getUserOrganisation(
  uid: string
): Promise<Organisation[]> {
  try {
    const q = query(
      collection(firestoreDb, col),
      where("memberUids", "array-contains", uid)
    );

    const snap = await getDocs(q);

    if (snap.empty) return [];

    return snap.docs.map((d) => {
      const raw = d.data();

      return {
        id: d.id,
        name: raw.name,
        abn: raw.abn,
        address: raw.address,
        adminUid: raw.adminUid,
        memberUids: raw.memberUids ?? [],
        createdAt: toMs(raw.createdAt),
      };
    });
  } catch (e) {
    console.log("GET USER ORGS ERROR:", e);
    return [];
  }
}

/**
 * UPDATE ORGANISATION
 */
export async function updateOrganisation(
  orgId: string,
  data: Partial<Pick<Organisation, "name" | "abn" | "address">>
) {
  try {
    await updateDoc(doc(firestoreDb, col, orgId), data);
  } catch (e) {
    console.log("UPDATE ORG ERROR:", e);
  }
}

/**
 * ADD MEMBER
 */
export async function addMember(orgId: string, uid: string) {
  try {
    await updateDoc(doc(firestoreDb, col, orgId), {
      memberUids: arrayUnion(uid),
    });
  } catch (e) {
    console.log("ADD MEMBER ERROR:", e);
  }
}

/**
 * REMOVE MEMBER
 */
export async function removeMember(orgId: string, uid: string) {
  try {
    await updateDoc(doc(firestoreDb, col, orgId), {
      memberUids: arrayRemove(uid),
    });
  } catch (e) {
    console.log("REMOVE MEMBER ERROR:", e);
  }
}