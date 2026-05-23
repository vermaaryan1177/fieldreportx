import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { trackingStore, AccelFieldData } from "@/lib/trackingStore";

function formatDuration(sec: number): string {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

interface Props {
    value: string | boolean | number | undefined;
    onChange: (v: string) => void;
}

export default function AccelerometerField({ value, onChange }: Props) {
    const [, refresh] = useState(0);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    useEffect(() => trackingStore.subscribe(() => refresh((n) => n + 1)), []);

    useEffect(() => {
        if (trackingStore.accelStatus === "done" && trackingStore.accelResult) {
            const serialized = JSON.stringify(trackingStore.accelResult);
            if (String(value ?? "") !== serialized) onChangeRef.current(serialized);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const savedData: AccelFieldData | null = (() => {
        if (trackingStore.accelStatus !== "idle") return null;
        if (!value || typeof value !== "string") return null;
        try { return JSON.parse(value); } catch { return null; }
    })();

    const handleStop = () => {
        const result = trackingStore.stopAccel();
        onChangeRef.current(JSON.stringify(result));
    };

    const handleReset = () => {
        trackingStore.resetAccel();
        onChangeRef.current("");
    };

    // ── Active sampling ──────────────────────────────────────────────────────
    if (trackingStore.accelStatus === "sampling") {
        return (
            <View style={{ gap: 10 }}>
                <View style={{ backgroundColor: "#1e293b", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#60a5fa30" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#60a5fa" }} />
                            <Text style={{ color: "#60a5fa", fontWeight: "bold", fontSize: 13 }}>
                                Sampling  ·  {formatDuration(trackingStore.accelElapsed)}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => trackingStore.cancelAccel()}>
                            <Text style={{ color: "#52525b", fontSize: 12 }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <View>
                            <Text style={{ color: "#52525b", fontSize: 11 }}>Samples</Text>
                            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 20 }}>{trackingStore.accelSampleCount}</Text>
                        </View>
                        <View>
                            <Text style={{ color: "#52525b", fontSize: 11 }}>Live Magnitude</Text>
                            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 20 }}>
                                {trackingStore.accelLiveMag}{" "}
                                <Text style={{ fontSize: 12, fontWeight: "normal", color: "#94a3b8" }}>g</Text>
                            </Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={handleStop}
                    activeOpacity={0.8}
                    style={{ backgroundColor: "#1e3a5f", borderWidth: 1, borderColor: "#60a5fa40", borderRadius: 12, paddingVertical: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
                >
                    <Ionicons name="stop-circle" size={18} color="#60a5fa" />
                    <Text style={{ color: "#60a5fa", fontWeight: "bold", fontSize: 15 }}>Stop Analysis</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ── Completed / saved result ─────────────────────────────────────────────
    const displayData: AccelFieldData | null =
        trackingStore.accelStatus === "done" ? trackingStore.accelResult : savedData;

    if (displayData) {
        const catColor =
            displayData.category === "Smooth" ? "#22c55e" :
            displayData.category === "Moderate" ? "#f2a72f" :
            displayData.category === "Rough" ? "#f97316" : "#ef4444";
        return (
            <View style={{ gap: 10 }}>
                <View style={{ backgroundColor: "#1e293b", borderRadius: 12, padding: 16, gap: 12 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={{ color: "#94a3b8", fontSize: 12 }}>
                            {formatDuration(displayData.durationSec)} · {trackingStore.accelSampleCount || "saved"} samples
                        </Text>
                        <View style={{ backgroundColor: catColor + "20", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                            <Text style={{ color: catColor, fontWeight: "bold", fontSize: 13 }}>{displayData.category}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <View>
                            <Text style={{ color: "#52525b", fontSize: 11 }}>RMS</Text>
                            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>{displayData.rms} g</Text>
                        </View>
                        <View>
                            <Text style={{ color: "#52525b", fontSize: 11 }}>Peak</Text>
                            <Text style={{ color: "#ef4444", fontWeight: "bold", fontSize: 16 }}>{displayData.peak} g</Text>
                        </View>
                        <View>
                            <Text style={{ color: "#52525b", fontSize: 11 }}>Avg</Text>
                            <Text style={{ color: "#60a5fa", fontWeight: "bold", fontSize: 16 }}>{displayData.avgMagnitude} g</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={handleReset}
                    activeOpacity={0.7}
                    style={{ backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#3f3f46", borderRadius: 12, paddingVertical: 12, alignItems: "center" }}
                >
                    <Text style={{ color: "#94a3b8", fontSize: 13, fontWeight: "600" }}>Reset & Analyse Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ── Idle ────────────────────────────────────────────────────────────────
    return (
        <TouchableOpacity
            onPress={() => trackingStore.startAccel()}
            activeOpacity={0.8}
            style={{ backgroundColor: "#1e3a5f", borderWidth: 1, borderColor: "#60a5fa40", borderRadius: 12, paddingVertical: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
        >
            <Ionicons name="pulse-outline" size={18} color="#60a5fa" />
            <Text style={{ color: "#60a5fa", fontWeight: "bold", fontSize: 15 }}>Start Vibration Analysis</Text>
        </TouchableOpacity>
    );
}
