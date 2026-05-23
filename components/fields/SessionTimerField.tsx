import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { trackingStore } from "@/lib/trackingStore";

interface Props {
    value: string | boolean | number | undefined;
    onChange: (v: number) => void;
}

export default function SessionTimerField({ value, onChange }: Props) {
    const [, refresh] = useState(0);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    useEffect(() => trackingStore.subscribe(() => refresh((n) => n + 1)), []);

    // Sync a completed result that finished while unmounted
    useEffect(() => {
        if (trackingStore.timerStatus === "done" && trackingStore.timerResult !== null) {
            if (value !== trackingStore.timerResult) onChangeRef.current(trackingStore.timerResult);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const savedSeconds: number | null = (() => {
        if (trackingStore.timerStatus !== "idle") return null;
        if (typeof value === "number" && value > 0) return value;
        return null;
    })();

    const handleStop = () => {
        const result = trackingStore.stopTimer();
        onChangeRef.current(result);
    };

    const handleReset = () => {
        trackingStore.resetTimer();
        onChangeRef.current(0);
    };

    // ── Running ──────────────────────────────────────────────────────────────
    if (trackingStore.timerStatus === "running") {
        const elapsed = trackingStore.timerElapsed;
        const hrs = Math.floor(elapsed / 3600);
        const mins = Math.floor((elapsed % 3600) / 60);
        const secs = elapsed % 60;
        const display = hrs > 0
            ? `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
            : `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
        return (
            <View style={{ gap: 10 }}>
                <View style={{ backgroundColor: "#1e293b", borderRadius: 12, padding: 20, borderWidth: 1, borderColor: "#a78bfa30", alignItems: "center", gap: 8 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#a78bfa" }} />
                        <Text style={{ color: "#a78bfa", fontWeight: "bold", fontSize: 13 }}>Session in progress</Text>
                        <TouchableOpacity onPress={() => trackingStore.cancelTimer()} style={{ marginLeft: 12 }}>
                            <Text style={{ color: "#52525b", fontSize: 12 }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 48, fontVariant: ["tabular-nums"] as any, letterSpacing: 2 }}>
                        {display}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={handleStop}
                    activeOpacity={0.8}
                    style={{ backgroundColor: "#3b0764", borderWidth: 1, borderColor: "#a78bfa40", borderRadius: 12, paddingVertical: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
                >
                    <Ionicons name="stop-circle" size={18} color="#a78bfa" />
                    <Text style={{ color: "#a78bfa", fontWeight: "bold", fontSize: 15 }}>Stop Timer</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ── Done / saved ─────────────────────────────────────────────────────────
    const displaySeconds: number | null =
        trackingStore.timerStatus === "done" ? trackingStore.timerResult : savedSeconds;

    if (displaySeconds !== null && displaySeconds > 0) {
        const hrs = Math.floor(displaySeconds / 3600);
        const mins = Math.floor((displaySeconds % 3600) / 60);
        const secs = displaySeconds % 60;
        const display = hrs > 0
            ? `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
            : `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
        const minLabel = Math.round(displaySeconds / 60);
        return (
            <View style={{ gap: 10 }}>
                <View style={{ backgroundColor: "#1e293b", borderRadius: 12, padding: 20, borderWidth: 1, borderColor: "#a78bfa30", alignItems: "center", gap: 4 }}>
                    <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 40, fontVariant: ["tabular-nums"] as any, letterSpacing: 2 }}>
                        {display}
                    </Text>
                    <Text style={{ color: "#71717a", fontSize: 13 }}>{minLabel} {minLabel === 1 ? "minute" : "minutes"}</Text>
                </View>
                <TouchableOpacity
                    onPress={handleReset}
                    activeOpacity={0.7}
                    style={{ backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#3f3f46", borderRadius: 12, paddingVertical: 12, alignItems: "center" }}
                >
                    <Text style={{ color: "#94a3b8", fontSize: 13, fontWeight: "600" }}>Reset Timer</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ── Idle ─────────────────────────────────────────────────────────────────
    return (
        <TouchableOpacity
            onPress={() => trackingStore.startTimer()}
            activeOpacity={0.8}
            style={{ backgroundColor: "#3b0764", borderWidth: 1, borderColor: "#a78bfa40", borderRadius: 12, paddingVertical: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
        >
            <Ionicons name="timer-outline" size={18} color="#a78bfa" />
            <Text style={{ color: "#a78bfa", fontWeight: "bold", fontSize: 15 }}>Start Session Timer</Text>
        </TouchableOpacity>
    );
}
