import { fmtDuration } from "./time";
import { FieldType } from "@/lib/types";

export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function formatFieldValue(
    type: FieldType,
    value: string | boolean | number,
): string | null {
    if (value === undefined || value === null || value === "" || value === false) return null;
    switch (type) {
        case "text":
        case "select":
            return String(value).trim() || null;
        case "number":
            return String(value);
        case "checkbox":
            return "Yes";
        case "signature":
            return "Signed";
        case "timer": {
            const sec = Number(value);
            return sec > 0 ? fmtDuration(sec) : null;
        }
        case "route": {
            try {
                const d = JSON.parse(String(value));
                const dur = Math.floor((d.endTime - d.startTime) / 1000);
                return `${d.distanceKm} km · ${fmtDuration(dur)} · avg ${d.avgSpeedKmh} km/h${(d.stops?.length ?? 0) > 0 ? ` · ${d.stops.length} stops` : ""}`;
            } catch { return "Route recorded"; }
        }
        case "accelerometer": {
            try {
                const d = JSON.parse(String(value));
                return `${d.category} · RMS ${d.rms} g · Peak ${d.peak} g`;
            } catch { return "Vibration recorded"; }
        }
        case "stopwatch": {
            try {
                const d = JSON.parse(String(value));
                const trials: number[] = d.trials ?? [];
                return `${trials.length} trial${trials.length !== 1 ? "s" : ""} · avg ${d.avg} ms`;
            } catch { return "Timing recorded"; }
        }
        case "joint_angle": {
            try {
                const d = JSON.parse(String(value));
                return `${d.joint} — ${d.angle}° (${Math.round(d.confidence * 100)}% confidence)`;
            } catch { return "Angle captured"; }
        }
        case "photo":
            return null;
        default:
            return String(value) || null;
    }
}
