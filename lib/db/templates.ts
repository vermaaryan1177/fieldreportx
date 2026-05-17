import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    or,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { Template, TemplateSection } from "@/lib/types";

const col = "templates";

export async function createTemplate(
    createdBy: string,
    data: Pick<
        Template,
        "name" | "category" | "sections" | "gpsValidation" | "organisationId"
    >,
): Promise<string> {
    const ref = doc(collection(db, col));
    await setDoc(ref, {
        ...data,
        id: ref.id,
        createdBy,
        version: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return ref.id;
}

export async function getTemplate(
    templateId: string,
): Promise<Template | null> {
    const snap = await getDoc(doc(db, col, templateId));
    return snap.exists() ? (snap.data() as Template) : null;
}

// Returns all templates visible to a user: personal + organisation's templates
export async function listTemplates(
    uid: string,
    organisationId: string | null,
): Promise<Template[]> {
    const conditions = [where("createdBy", "==", uid)];
    if (organisationId) {
        conditions.push(where("organisationId", "==", organisationId));
    }
    const q = query(collection(db, col), or(...conditions));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Template);
}

export async function updateTemplate(
    templateId: string,
    data: Partial<
        Pick<Template, "name" | "category" | "sections" | "gpsValidation">
    >,
): Promise<void> {
    await updateDoc(doc(db, col, templateId), {
        ...data,
        updatedAt: serverTimestamp(),
        // bump version on every save
        version: (await getDoc(doc(db, col, templateId))).data()?.version + 1,
    });
}

export async function addTemplateSection(
    templateId: string,
    section: TemplateSection,
): Promise<void> {
    const snap = await getDoc(doc(db, col, templateId));
    const current: TemplateSection[] = snap.data()?.sections ?? [];
    await updateDoc(doc(db, col, templateId), {
        sections: [...current, section],
        updatedAt: serverTimestamp(),
    });
}

export async function deleteTemplate(templateId: string): Promise<void> {
    await deleteDoc(doc(db, col, templateId));
}
