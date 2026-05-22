// import {
//     collection,
//     doc,
//     onSnapshot,
//     orderBy,
//     query,
//     updateDoc,
//     serverTimestamp,
//     addDoc,
// } from "firebase/firestore";

// import { db } from "@/lib/firebase";

// export type NotificationItem = {
//     id: string;
//     title: string;
//     description?: string;
//     time?: string;
//     icon?: string;
//     unread: boolean;
//     createdAt: any;
// };

// const getPath = (userId: string) =>
//     collection(db, "users", userId, "notifications");

// export const NotificationDB = {
//     // REAL-TIME LISTENER
//     subscribe(
//         userId: string,
//         callback: (items: NotificationItem[]) => void
//     ) {
//         const q = query(getPath(userId), orderBy("createdAt", "desc"));

//         return onSnapshot(q, (snapshot) => {
//             const items: NotificationItem[] = snapshot.docs.map((doc) => {
//                 const data = doc.data();

//                 return {
//                     id: doc.id,
//                     title: data.title,
//                     description: data.description || "",
//                     icon: data.icon || "",
//                     unread: data.unread ?? true,
//                     createdAt: data.createdAt,
//                     time: data.time || "",
//                 };
//             });

//             callback(items);
//         });
//     },

//     // MARK AS READ
//     async markAsRead(userId: string, id: string) {
//         const ref = doc(db, "users", userId, "notifications", id);

//         await updateDoc(ref, {
//             unread: false,
//         });
//     },

//     // CLEAR READ (keeps unread only)
//     async clearRead(userId: string) {
//         const q = query(getPath(userId));

//         // simple approach: fetch via listener snapshot not needed here
//         // you can extend later with batch delete if required
//         // kept minimal for production safety
//         return;
//     },

//     // CREATE NOTIFICATION (backend use)
//     async create(userId: string, data: Omit<NotificationItem, "id">) {
//         await addDoc(getPath(userId), {
//             ...data,
//             createdAt: serverTimestamp(),
//         });
//     },
// };



import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type NotificationItem = {
  id: string;
  title: string;
  description?: string;
  time?: string;
  icon?: string;
  unread: boolean;
  createdAt: any;
  inviteId?: string;
};

const getPath = (userId: string) =>
  collection(db, "users", userId, "notifications");

export const NotificationDB = {
  subscribe(userId: string, callback: (items: NotificationItem[]) => void) {
    const q = query(getPath(userId), orderBy("createdAt", "desc"));

    return onSnapshot(q, (snapshot) => {
      const items: NotificationItem[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description || "",
          icon: data.icon || "",
          unread: data.unread ?? true,
          createdAt: data.createdAt,
          time: data.time || "",
          inviteId: data.inviteId || null,
        };
      });
      callback(items);
    });
  },

  async markAsRead(userId: string, id: string) {
    const ref = doc(db, "users", userId, "notifications", id);
    await updateDoc(ref, { unread: false });
  },

  async create(userId: string, data: any) {
    await addDoc(getPath(userId), {
      ...data,
      createdAt: serverTimestamp(),
    });
  },
};