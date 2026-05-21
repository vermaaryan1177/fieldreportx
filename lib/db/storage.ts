import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { storage } from "@/lib/firebase";

/**
 * Uploads a local file URI (file://...) to Firebase Storage and returns
 * the public download URL
 */
export async function uploadFile(
    localUri: string,
    storagePath: string,
): Promise<string> {
    const response = await fetch(localUri);
    const blob = await response.blob();
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, blob);
    return getDownloadURL(storageRef);
}
