import yaml from "js-yaml";

import { FieldType, TemplateField, TemplateSection } from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ParsedImport {
    name: string;
    category: string;
    gpsValidation: boolean;
    sections: TemplateSection[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_TYPES = new Set<FieldType>([
    "text", "number", "checkbox", "select", "photo",
    "signature", "route", "accelerometer", "timer", "stopwatch", "joint_angle",
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid(): string {
    return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

function err(msg: string): never {
    throw new Error(msg);
}

// ─── Parser ───────────────────────────────────────────────────────────────────

export function parseImportText(raw: string): ParsedImport {
    const trimmed = raw.trim();
    if (!trimmed) err("Nothing to import — paste your YAML or JSON above.");

    let parsed: unknown;
    try {
        parsed = yaml.load(trimmed);
    } catch (e: any) {
        err(`Parse error: ${e.message}`);
    }

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        err("Top level must be an object, not an array or primitive.");
    }

    const obj = parsed as Record<string, unknown>;

    // name
    if (!obj.name || typeof obj.name !== "string" || !obj.name.trim()) {
        err('Missing required field "name" (string).');
    }

    // sections
    if (!Array.isArray(obj.sections)) {
        err('Missing required field "sections" (must be an array).');
    }
    if ((obj.sections as unknown[]).length === 0) {
        err('"sections" must contain at least one entry.');
    }

    const sections: TemplateSection[] = (obj.sections as unknown[]).map(
        (sec: unknown, si: number) => {
            if (!sec || typeof sec !== "object" || Array.isArray(sec)) {
                err(`sections[${si}] must be an object.`);
            }
            const s = sec as Record<string, unknown>;

            if (!s.name || typeof s.name !== "string" || !String(s.name).trim()) {
                err(`sections[${si}] is missing a "name".`);
            }
            const secName = String(s.name).trim();

            if (!Array.isArray(s.fields) || (s.fields as unknown[]).length === 0) {
                err(`Section "${secName}" must have at least one field.`);
            }

            const fields: TemplateField[] = (s.fields as unknown[]).map(
                (f: unknown, fi: number) => {
                    if (!f || typeof f !== "object" || Array.isArray(f)) {
                        err(`${secName}.fields[${fi}] must be an object.`);
                    }
                    const field = f as Record<string, unknown>;

                    if (!field.label || typeof field.label !== "string" || !String(field.label).trim()) {
                        err(`${secName}.fields[${fi}] is missing a "label".`);
                    }

                    const type = field.type ? String(field.type) as FieldType : "text";
                    if (!VALID_TYPES.has(type)) {
                        err(
                            `Unknown type "${type}" in ${secName}.fields[${fi}]. ` +
                            `Valid types: ${[...VALID_TYPES].join(", ")}.`,
                        );
                    }

                    const out: TemplateField = {
                        id: uid(),
                        label: String(field.label).trim(),
                        type,
                        required: Boolean(field.required ?? false),
                    };
                    if (type === "select" && Array.isArray(field.options)) {
                        out.options = (field.options as unknown[]).map(String);
                    }
                    if (field.gyroCapture) out.gyroCapture = true;
                    return out;
                },
            );

            return { id: uid(), name: secName, fields };
        },
    );

    return {
        name: String(obj.name).trim(),
        category: typeof obj.category === "string" && obj.category.trim()
            ? obj.category.trim()
            : "custom",
        gpsValidation: Boolean(obj.gpsValidation ?? false),
        sections,
    };
}
