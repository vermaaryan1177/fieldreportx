import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export interface ReflexStopwatchData {
    trials: number[];
    avg: number;
}

interface Props {
    value: string | boolean | number | undefined;
    onChange: (v: string) => void;
}

export default function ReflexStopwatchField({ value, onChange }: Props) {
    type Phase = "idle" | "running" | "paused" | "done";
    const [phase, setPhase] = useState<Phase>("idle");
    const [trials, setTrials] = useState<number[]>([]);
    const [liveMs, setLiveMs] = useState(0);
    const startRef = useRef(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    // Restore from saved value on mount
    useEffect(() => {
        if (typeof value === "string" && value) {
            try {
                const d: ReflexStopwatchData = JSON.parse(value);
                if (Array.isArray(d.trials) && d.trials.length > 0) {
                    setTrials(d.trials);
                    setPhase("done");
                }
            } catch {}
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startTrial = () => {
        startRef.current = Date.now();
        setLiveMs(0);
        setPhase("running");
        intervalRef.current = setInterval(() => {
            setLiveMs(Date.now() - startRef.current);
        }, 30);
    };

    const stopTrial = () => {
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
        const elapsed = Date.now() - startRef.current;
        const newTrials = [...trials, elapsed];
        setTrials(newTrials);
        setLiveMs(elapsed);
        if (newTrials.length >= 3) {
            finalize(newTrials);
        } else {
            setPhase("paused");
        }
    };

    const finalize = (trialData: number[]) => {
        const avg = Math.round(trialData.reduce((a, b) => a + b, 0) / trialData.length);
        setPhase("done");
        onChangeRef.current(JSON.stringify({ trials: trialData, avg }));
    };

    const reset = () => {
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
        setTrials([]);
        setLiveMs(0);
        setPhase("idle");
        onChangeRef.current("");
    };

    const trialColors = ["#f2a72f", "#60a5fa", "#a78bfa"];

    // ── Running ──────────────────────────────────────────────────────────────
    if (phase === "running") {
        return (
            <View style={{ gap: 10 }}>
                <View style={{ backgroundColor: "#1e293b", borderRadius: 12, padding: 20, borderWidth: 1, borderColor: "#ef444430", alignItems: "center", gap: 6 }}>
                    <Text style={{ color: "#94a3b8", fontSize: 12, fontWeight: "600" }}>
                        TRIAL {trials.length + 1}  ·  TAP STOP WHEN PATIENT RESPONDS
                    </Text>
                    <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 52, fontVariant: ["tabular-nums"] as any }}>
                        {liveMs < 1000
                            ? `${liveMs} ms`
                            : `${(liveMs / 1000).toFixed(2)} s`}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={stopTrial}
                    activeOpacity={0.7}
                    style={{ backgroundColor: "#7f1d1d", borderWidth: 1, borderColor: "#ef444440", borderRadius: 12, paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
                >
                    <Ionicons name="stop-circle" size={20} color="#ef4444" />
                    <Text style={{ color: "#ef4444", fontWeight: "bold", fontSize: 16 }}>Stop</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ── Between trials ───────────────────────────────────────────────────────
    if (phase === "paused") {
        return (
            <View style={{ gap: 10 }}>
                <View style={{ backgroundColor: "#1e293b", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#3f3f46", gap: 12 }}>
                    {trials.map((ms, i) => (
                        <View key={i} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <Text style={{ color: "#71717a", fontSize: 13 }}>Trial {i + 1}</Text>
                            <Text style={{ color: trialColors[i], fontWeight: "bold", fontSize: 18, fontVariant: ["tabular-nums"] as any }}>
                                {ms} ms
                            </Text>
                        </View>
                    ))}
                </View>
                <View style={{ flexDirection: "row", gap: 10 }}>
                    <TouchableOpacity
                        onPress={startTrial}
                        activeOpacity={0.8}
                        style={{ flex: 1, backgroundColor: "#14532d", borderWidth: 1, borderColor: "#22c55e40", borderRadius: 12, paddingVertical: 13, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 }}
                    >
                        <Ionicons name="play" size={16} color="#22c55e" />
                        <Text style={{ color: "#22c55e", fontWeight: "bold", fontSize: 14 }}>Trial {trials.length + 1}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => finalize(trials)}
                        activeOpacity={0.8}
                        style={{ flex: 1, backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#3f3f46", borderRadius: 12, paddingVertical: 13, alignItems: "center" }}
                    >
                        <Text style={{ color: "#94a3b8", fontWeight: "600", fontSize: 14 }}>Finish</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // ── Done ─────────────────────────────────────────────────────────────────
    if (phase === "done" && trials.length > 0) {
        const avg = Math.round(trials.reduce((a, b) => a + b, 0) / trials.length);
        return (
            <View style={{ gap: 10 }}>
                <View style={{ backgroundColor: "#1e293b", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#22c55e30", gap: 10 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                        <Text style={{ color: "#22c55e", fontWeight: "bold", fontSize: 13 }}>Completed — {trials.length} trial{trials.length !== 1 ? "s" : ""}</Text>
                        <Text style={{ color: "#71717a", fontSize: 12 }}>avg {avg} ms</Text>
                    </View>
                    {trials.map((ms, i) => (
                        <View key={i} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <Text style={{ color: "#71717a", fontSize: 13 }}>Trial {i + 1}</Text>
                            <Text style={{ color: trialColors[i], fontWeight: "bold", fontSize: 18, fontVariant: ["tabular-nums"] as any }}>
                                {ms} ms
                            </Text>
                        </View>
                    ))}
                </View>
                <TouchableOpacity
                    onPress={reset}
                    activeOpacity={0.7}
                    style={{ backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#3f3f46", borderRadius: 12, paddingVertical: 12, alignItems: "center" }}
                >
                    <Text style={{ color: "#94a3b8", fontSize: 13, fontWeight: "600" }}>Reset & Redo</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ── Idle ─────────────────────────────────────────────────────────────────
    return (
        <TouchableOpacity
            onPress={startTrial}
            activeOpacity={0.8}
            style={{ backgroundColor: "#14532d", borderWidth: 1, borderColor: "#22c55e40", borderRadius: 12, paddingVertical: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
        >
            <Ionicons name="play-circle-outline" size={20} color="#22c55e" />
            <Text style={{ color: "#22c55e", fontWeight: "bold", fontSize: 15 }}>Start Trial 1</Text>
        </TouchableOpacity>
    );
}
