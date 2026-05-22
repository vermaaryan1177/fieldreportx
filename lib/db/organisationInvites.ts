import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export type OrgInvite = {
  id: string;
  orgId: string;
  orgName: string;
  invitedUid: string;
  invitedBy: string;
  status: "pending" | "accepted" | "declined";
  createdAt: any;
};

const col = "organisationInvites";

export const OrganisationInvitesDB = {
  async createInvite(params: {
    orgId: string;
    orgName: string;
    invitedUid: string;
    invitedBy: string;
  }) {
    const ref = doc(collection(db, col));

    const invite: OrgInvite = {
      id: ref.id,
      orgId: params.orgId,
      orgName: params.orgName,
      invitedUid: params.invitedUid,
      invitedBy: params.invitedBy,
      status: "pending",
      createdAt: serverTimestamp(),
    };

    await setDoc(ref, invite);

    return ref.id;
  },

  async acceptInvite(userId: string, inviteId: string) {
    const ref = doc(db, col, inviteId);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const invite = snap.data() as OrgInvite;
    if (invite.status !== "pending") return;

    await updateDoc(ref, { status: "accepted" });

    const orgRef = doc(db, "organisations", invite.orgId);
    await updateDoc(orgRef, {
      memberUids: arrayUnion(userId),
    });
  },

  async declineInvite(inviteId: string) {
    const ref = doc(db, col, inviteId);
    await updateDoc(ref, { status: "declined" });
  },
};