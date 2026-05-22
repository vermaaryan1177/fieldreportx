import { ReportSection } from "@/lib/types";

// FNV-1a 32-bit — fast, dependency-free, deterministic
export function fnv1a32(str: string): string {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 0x01000193) >>> 0;
    }
    return h.toString(16).padStart(8, "0");
}

export interface ChecksumInput {
    title: string;
    templateId: string;
    templateVersion: number;
    inspectorId: string;
    sections: Pick<ReportSection, "id" | "status" | "fieldValues" | "score">[];
    score: number | null;
}

export function computeReportChecksum(data: ChecksumInput): string {
    const payload = JSON.stringify({
        title: data.title,
        templateId: data.templateId,
        templateVersion: data.templateVersion,
        inspectorId: data.inspectorId,
        score: data.score,
        sections: [...data.sections]
            .sort((a, b) => a.id.localeCompare(b.id))
            .map((s) => ({
                id: s.id,
                status: s.status,
                score: s.score,
                fieldValues: Object.fromEntries(
                    Object.entries(s.fieldValues).sort(([a], [b]) => a.localeCompare(b)),
                ),
            })),
    });
    return fnv1a32(payload);
}
