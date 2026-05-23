import {
    collection,
    deleteDoc,
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
import { Report, ReportPhoto, ReportSection, ReportStatus } from "@/lib/types";

const col = "reports";

export async function createReport(
    data: Pick<
        Report,
        | "title"
        | "templateId"
        | "templateName"
        | "organisationId"
        | "inspectorId"
        | "inspectorName"
        | "sections"
        | "gps"
    >,
): Promise<string> {
    const ref = doc(collection(db, col));
    await setDoc(ref, {
        ...data,
        id: ref.id,
        status: "draft" as ReportStatus,
        score: null,
        routeData: null,
        signatureUrl: null,
        photos: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return ref.id;
}

export async function getReport(reportId: string): Promise<Report | null> {
    const snap = await getDoc(doc(db, col, reportId));
    return snap.exists() ? (snap.data() as Report) : null;
}

export async function listReportsByUser(uid: string): Promise<Report[]> {
    const q = query(collection(db, col), where("inspectorId", "==", uid));
    const snap = await getDocs(q);

    const reports: Report[] = [];
    const staleIds: string[] = [];

    for (const d of snap.docs) {
        const data = d.data() as Report;
        // "done" was the old status name; missing status means pre-migration doc
        if (!data.status || data.status === ("done" as any)) {
            data.status = "completed";
            staleIds.push(d.id);
        }
        reports.push(data);
    }

    if (staleIds.length > 0) {
        Promise.all(
            staleIds.map((id) =>
                updateDoc(doc(db, col, id), { status: "completed", updatedAt: serverTimestamp() })
            )
        ).catch(() => {});
    }

    return reports;
}

export async function listReportsByOrg(orgId: string): Promise<Report[]> {
    const q = query(collection(db, col), where("organisationId", "==", orgId));
    const snap = await getDocs(q);

    const reports: Report[] = [];
    const staleIds: string[] = [];

    for (const d of snap.docs) {
        const data = d.data() as Report;
        if (!data.status || data.status === ("done" as any)) {
            data.status = "completed";
            staleIds.push(d.id);
        }
        reports.push(data);
    }

    if (staleIds.length > 0) {
        Promise.all(
            staleIds.map((id) =>
                updateDoc(doc(db, col, id), { status: "completed", updatedAt: serverTimestamp() })
            )
        ).catch(() => {});
    }

    return reports;
}

export async function updateReport(
    reportId: string,
    data: Partial<
        Pick<
            Report,
            "title" | "status" | "score" | "routeData" | "signatureUrl" | "gps"
        >
    >,
): Promise<void> {
    await updateDoc(doc(db, col, reportId), {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

export async function updateReportSection(
    reportId: string,
    updatedSection: ReportSection,
): Promise<void> {
    const snap = await getDoc(doc(db, col, reportId));
    const sections: ReportSection[] = snap.data()?.sections ?? [];
    const next = sections.map((s) =>
        s.id === updatedSection.id ? updatedSection : s,
    );
    await updateDoc(doc(db, col, reportId), {
        sections: next,
        updatedAt: serverTimestamp(),
    });
}

export async function addPhotoToReport(
    reportId: string,
    photo: ReportPhoto,
): Promise<void> {
    const snap = await getDoc(doc(db, col, reportId));
    const photos: ReportPhoto[] = snap.data()?.photos ?? [];
    await updateDoc(doc(db, col, reportId), {
        photos: [...photos, photo],
        updatedAt: serverTimestamp(),
    });
}

export async function updateReportStatus(
    reportId: string,
    status: ReportStatus,
): Promise<void> {
    await updateDoc(doc(db, col, reportId), {
        status,
        updatedAt: serverTimestamp(),
    });
}

// ─── Draft / In-Progress lifecycle ───────────────────────────────────────────

/**
 * Creates or updates a Firestore doc for a report in "draft" state.
 * Pass existingId to update; omit to create a new document.
 * Returns the Firestore document ID.
 */
export async function saveDraftReport(params: {
    existingId: string | null;
    title: string;
    description: string;
    templateId: string;
    templateName: string;
    inspectorId: string;
    inspectorName: string;
    sectionStubs: Array<{ id: string; name: string }>;
}): Promise<string> {
    const { existingId, sectionStubs, ...rest } = params;
    const ref = existingId ? doc(db, col, existingId) : doc(collection(db, col));

    const sections: ReportSection[] = sectionStubs.map((s) => ({
        id: s.id,
        name: s.name,
        status: "notstarted" as const,
        fieldValues: {},
        notes: "",
        photoIds: [],
        score: null,
    }));

    const payload = {
        id: ref.id,
        title: rest.title || "Untitled Report",
        description: rest.description,
        templateId: rest.templateId,
        templateName: rest.templateName,
        organisationId: null,
        inspectorId: rest.inspectorId,
        inspectorName: rest.inspectorName,
        status: "draft" as ReportStatus,
        score: null,
        gps: null,
        routeData: null,
        signatureUrl: null,
        checksum: null,
        deviceHash: null,
        sections,
        photos: [],
        updatedAt: serverTimestamp(),
        ...(existingId ? {} : { createdAt: serverTimestamp() }),
    };

    if (existingId) {
        await updateDoc(ref, payload);
    } else {
        await setDoc(ref, { ...payload, createdAt: serverTimestamp() });
    }

    return ref.id;
}

/** Persists current section values/statuses back to an inprogress Firestore doc. */
export async function updateInProgressSections(
    reportId: string,
    sections: ReportSection[],
): Promise<void> {
    await updateDoc(doc(db, col, reportId), {
        sections,
        updatedAt: serverTimestamp(),
    });
}

/** Transitions a draft doc to "inprogress" state. */
export async function markReportInProgress(reportId: string): Promise<void> {
    await updateDoc(doc(db, col, reportId), {
        status: "inprogress" as ReportStatus,
        updatedAt: serverTimestamp(),
    });
}

export async function archiveReport(reportId: string): Promise<void> {
    await updateDoc(doc(db, col, reportId), { status: "archived", updatedAt: serverTimestamp() });
}

export async function unarchiveReport(reportId: string): Promise<void> {
    await updateDoc(doc(db, col, reportId), { status: "completed", updatedAt: serverTimestamp() });
}

export async function deleteReport(reportId: string): Promise<void> {
    await deleteDoc(doc(db, col, reportId));
}
