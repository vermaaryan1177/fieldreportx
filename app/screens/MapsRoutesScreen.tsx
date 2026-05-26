import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { AppScreen } from "@/components/BottomNavBar";

interface Props {
    onNavigate: (screen: AppScreen) => void;
    hasOrganisation?: boolean;
}

// Route waypoints (px within a 250-tall map container)
// Pre-computed: S(55,215) → 1(125,165) → 2(215,105) → End(295,45)
const ROUTE_SEGMENTS = [
    // S → 1: dx=70 dy=-50 length=86.0 angle=-35.5°
    { left: 47, top: 188.5, width: 86, angle: -35.5 },
    // 1 → 2: dx=90 dy=-60 length=108.2 angle=-33.7°
    { left: 116, top: 133.5, width: 108, angle: -33.7 },
    // 2 → End: dx=80 dy=-60 length=100 angle=-36.9°
    { left: 205, top: 73.5, width: 100, angle: -36.9 },
] as const;

const ROUTE_MARKERS = [
    { x: 55, y: 215, label: "S", bg: "#22c55e", textColor: "#fff" },
    { x: 125, y: 165, label: "1", bg: "#f2a72f", textColor: "#fff" },
    { x: 215, y: 105, label: "2", bg: "#f2a72f", textColor: "#fff" },
    { x: 295, y: 45, label: null, bg: "#f2a72f", textColor: "#fff" }, // current pos
] as const;

// Horizontal grid lines (y positions within map)
const H_LINES = [40, 80, 120, 160, 200];
// Vertical grid lines (x positions within map)
const V_LINES = [60, 120, 180, 240, 300];

const SPEED_STATS = [
    { value: "42", label: "Current km/h" },
    { value: "38", label: "Avg km/h" },
    { value: "67", label: "Max km/h" },
    { value: "4.2", label: "km total" },
];

export default function MapsRoutesScreen({ onNavigate }: Props) {
    const [recording, setRecording] = useState(true);
    const [markers, setMarkers] = useState(0);

    const addMarker = () => setMarkers((v) => v + 1);
    const stopRecording = () => setRecording(false);

    return (
        <View className="flex-1 bg-background dark:bg-[#1e2529]">
            {/* Top Bar */}
            <View className="flex-row items-center justify-between px-5 pt-16 pb-4">
                <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => onNavigate("reportEditor")}
                        className="w-9 h-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
                    >
                        <Ionicons name="arrow-back" size={18} color="#ffffff" />
                    </TouchableOpacity>
                    <Text className="text-slate-900 dark:text-white text-lg font-bold">
                        Maps &amp; routes
                    </Text>
                </View>

                {/* Recording indicator */}
                {recording ? (
                    <View className="flex-row items-center gap-2 bg-red-500/15 rounded-full px-3 py-1.5">
                        <View className="w-2 h-2 rounded-full bg-red-500" />
                        <Text className="text-red-500 text-xs font-bold tracking-widest">
                            REC
                        </Text>
                    </View>
                ) : (
                    <View className="flex-row items-center gap-2 bg-slate-100 dark:bg-zinc-800 rounded-full px-3 py-1.5">
                        <View className="w-2 h-2 rounded-full bg-zinc-500" />
                        <Text className="text-slate-400 dark:text-zinc-500 text-xs font-bold">
                            STOPPED
                        </Text>
                    </View>
                )}
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 32 }}
            >
                {/* ── Map Placeholder ───────────────────────────────────────── */}
                <View
                    className="mx-5 rounded-2xl overflow-hidden"
                    style={{ height: 250, backgroundColor: "#0f172a" }}
                >
                    {/* Grid lines */}
                    {H_LINES.map((y) => (
                        <View
                            key={`h${y}`}
                            style={{
                                position: "absolute",
                                left: 0,
                                right: 0,
                                top: y,
                                height: 1,
                                backgroundColor: "#1e293b",
                            }}
                        />
                    ))}
                    {V_LINES.map((x) => (
                        <View
                            key={`v${x}`}
                            style={{
                                position: "absolute",
                                top: 0,
                                bottom: 0,
                                left: x,
                                width: 1,
                                backgroundColor: "#1e293b",
                            }}
                        />
                    ))}

                    {/* Route segments */}
                    {ROUTE_SEGMENTS.map((seg, i) => (
                        <View
                            key={i}
                            style={{
                                position: "absolute",
                                left: seg.left,
                                top: seg.top,
                                width: seg.width,
                                height: 3,
                                backgroundColor: "#f2a72f",
                                borderRadius: 1.5,
                                transform: [{ rotate: `${seg.angle}deg` }],
                            }}
                        />
                    ))}

                    {/* Waypoint markers */}
                    {ROUTE_MARKERS.map((marker, i) => {
                        const isEnd = marker.label === null;
                        const markerSize = isEnd ? 14 : 20;
                        return (
                            <View
                                key={i}
                                style={{
                                    position: "absolute",
                                    left: marker.x - markerSize / 2,
                                    top: marker.y - markerSize / 2,
                                }}
                            >
                                {/* Pulse ring on current position */}
                                {isEnd && (
                                    <View
                                        style={{
                                            position: "absolute",
                                            left: -8,
                                            top: -8,
                                            width: 30,
                                            height: 30,
                                            borderRadius: 15,
                                            borderWidth: 2,
                                            borderColor: "#f2a72f",
                                            opacity: 0.4,
                                        }}
                                    />
                                )}
                                <View
                                    style={{
                                        width: markerSize,
                                        height: markerSize,
                                        borderRadius: markerSize / 2,
                                        backgroundColor: marker.bg,
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {marker.label !== null && (
                                        <Text
                                            style={{
                                                color: marker.textColor,
                                                fontSize: 9,
                                                fontWeight: "bold",
                                            }}
                                        >
                                            {marker.label}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        );
                    })}

                    {/* User-added markers count badge */}
                    {markers > 0 && (
                        <View
                            style={{ position: "absolute", top: 10, left: 12 }}
                            className="bg-black/70 rounded-full px-2.5 py-1 flex-row items-center gap-1"
                        >
                            <Ionicons
                                name="flag"
                                size={11}
                                color="#f2a72f"
                            />
                            <Text className="text-slate-900 dark:text-white text-xs">
                                {markers} marker{markers > 1 ? "s" : ""}
                            </Text>
                        </View>
                    )}

                    {/* Coordinate label near current position */}
                    <View
                        style={{ position: "absolute", right: 8, top: 8 }}
                        className="bg-black/70 rounded-lg px-2.5 py-1"
                    >
                        <Text className="text-slate-900 dark:text-white text-xs font-medium">
                            −37.8136, 144.9631
                        </Text>
                    </View>
                </View>

                {/* ── Speed Stats ───────────────────────────────────────────── */}
                <View className="flex-row mx-5 mt-4 gap-2">
                    {SPEED_STATS.map((stat) => (
                        <View
                            key={stat.label}
                            className="flex-1 bg-white dark:bg-slate-900 rounded-2xl py-3 items-center"
                        >
                            <Text className="text-slate-900 dark:text-white text-xl font-bold">
                                {stat.value}
                            </Text>
                            <Text className="text-slate-400 dark:text-zinc-500 text-xs mt-0.5 text-center">
                                {stat.label}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* ── Route Details ─────────────────────────────────────────── */}
                <View className="mx-5 mt-3 bg-white dark:bg-slate-900 rounded-2xl px-4 py-1">
                    {[
                        { label: "Duration", value: "00:12:34" },
                        { label: "Distance", value: "4.2 km" },
                    ].map((row, i, arr) => (
                        <View
                            key={row.label}
                            className={`flex-row items-center justify-between py-3 ${
                                i < arr.length - 1
                                    ? "border-b border-slate-200 dark:border-zinc-800"
                                    : ""
                            }`}
                        >
                            <Text className="text-slate-500 dark:text-zinc-400 text-sm">
                                {row.label}
                            </Text>
                            <Text className="text-slate-900 dark:text-white font-semibold text-sm">
                                {row.value}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* ── Action Buttons ────────────────────────────────────────── */}
                <View className="flex-row mx-5 mt-4 gap-3">
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={addMarker}
                        className="flex-1 border border-primary rounded-2xl py-4 items-center"
                    >
                        <Text className="text-primary font-semibold text-sm">
                            {markers > 0 ? `Add Marker (${markers})` : "Add Marker"}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={stopRecording}
                        className={`flex-1 rounded-2xl py-4 items-center ${
                            recording ? "bg-red-500" : "bg-slate-200 dark:bg-zinc-700"
                        }`}
                    >
                        <Text className="text-slate-900 dark:text-white font-bold text-sm">
                            {recording ? "Stop recording" : "Recording stopped"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Route summary notice */}
                <Text className="text-slate-400 dark:text-zinc-500 text-xs text-center mt-4 px-5">
                    Route summary will be appended to report
                </Text>

                {/* Save to report */}
                {!recording && (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => onNavigate("reportEditor")}
                        className="bg-primary mx-5 mt-4 rounded-2xl py-4 items-center"
                    >
                        <Text className="text-slate-900 dark:text-white font-bold text-sm">
                            Save route to report
                        </Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
}
