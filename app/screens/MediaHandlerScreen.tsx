import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { AppScreen } from "@/components/BottomNavBar";

interface Props {
    onNavigate: (screen: AppScreen) => void;
}

type CameraMode = "photo" | "video";

const ANNOTATION_TOOLS: { icon: string; label: string }[] = [
    { icon: "text", label: "Text" },
    { icon: "arrow-forward", label: "Arrow" },
    { icon: "ellipse-outline", label: "Circle" },
    { icon: "pencil", label: "Draw" },
    { icon: "color-palette-outline", label: "Colour" },
];

const SENSOR_READINGS = [
    { label: "Tilt", value: "2.3°" },
    { label: "Speed", value: "0 km/h" },
    { label: "Alt", value: "84 m" },
    { label: "Heading", value: "NNE" },
];

// Corner bracket for the viewfinder
function Bracket({
    position,
}: {
    position: "tl" | "tr" | "bl" | "br";
}) {
    const size = 24;
    const thickness = 2.5;
    const color = "#f2a72f";
    const radius = 5;

    const borderStyle = {
        tl: { borderTopWidth: thickness, borderLeftWidth: thickness, borderTopLeftRadius: radius },
        tr: { borderTopWidth: thickness, borderRightWidth: thickness, borderTopRightRadius: radius },
        bl: { borderBottomWidth: thickness, borderLeftWidth: thickness, borderBottomLeftRadius: radius },
        br: { borderBottomWidth: thickness, borderRightWidth: thickness, borderBottomRightRadius: radius },
    }[position];

    const offset = 36;
    const pos = {
        tl: { top: offset, left: offset },
        tr: { top: offset, right: offset },
        bl: { bottom: offset, left: offset },
        br: { bottom: offset, right: offset },
    }[position];

    return (
        <View
            style={{
                position: "absolute",
                width: size,
                height: size,
                borderColor: color,
                ...borderStyle,
                ...pos,
            }}
        />
    );
}

export default function MediaHandlerScreen({ onNavigate }: Props) {
    const [mode, setMode] = useState<CameraMode>("photo");
    const [captured, setCaptured] = useState(false);
    const [flash, setFlash] = useState(false);
    const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null);

    if (captured) {
        return (
            <View style={{ flex: 1, backgroundColor: "#000000" }}>
                <StatusBar barStyle="light-content" />

                {/* Annotation Top Bar */}
                <View
                    style={{ paddingTop: 56 }}
                    className="flex-row items-center justify-between px-5 pb-4"
                >
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setCaptured(false)}
                        className="w-10 h-10 rounded-full bg-zinc-800 items-center justify-center"
                    >
                        <Ionicons name="close" size={20} color="#ffffff" />
                    </TouchableOpacity>
                    <Text className="text-white font-semibold text-base">
                        Annotate
                    </Text>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => onNavigate("reportEditor")}
                        className="bg-primary rounded-full px-4 py-2"
                    >
                        <Text className="text-white font-bold text-sm">
                            Save
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Captured Image Placeholder */}
                <View
                    style={{ flex: 1, backgroundColor: "#18181b" }}
                    className="items-center justify-center"
                >
                    <Ionicons name="image-outline" size={72} color="#3f3f46" />
                    <Text className="text-zinc-700 text-sm mt-3">
                        Image preview
                    </Text>

                    {/* GPS overlay on image */}
                    <View
                        style={{ position: "absolute", bottom: 14, left: 14 }}
                        className="bg-black/70 rounded-xl px-3 py-2 flex-row items-center gap-1.5"
                    >
                        <Ionicons name="location" size={13} color="#f2a72f" />
                        <Text className="text-white text-xs font-medium">
                            −37.8136, 144.9631
                        </Text>
                        <View className="bg-primary/30 rounded-full px-1.5">
                            <Text className="text-primary text-xs">Tagged</Text>
                        </View>
                    </View>
                </View>

                {/* Annotation Toolbar */}
                <View
                    style={{ backgroundColor: "#0a0a0a" }}
                    className="flex-row justify-around items-center py-4 px-3 border-t border-zinc-800"
                >
                    {ANNOTATION_TOOLS.map((tool) => {
                        const isActive = activeAnnotation === tool.label;
                        return (
                            <TouchableOpacity
                                key={tool.label}
                                activeOpacity={0.7}
                                onPress={() =>
                                    setActiveAnnotation(
                                        isActive ? null : tool.label,
                                    )
                                }
                                className="items-center gap-1"
                            >
                                <View
                                    className={`w-10 h-10 rounded-xl items-center justify-center ${
                                        isActive
                                            ? "bg-primary"
                                            : "bg-zinc-800"
                                    }`}
                                >
                                    <Ionicons
                                        name={tool.icon as any}
                                        size={18}
                                        color={isActive ? "#fff" : "#71717a"}
                                    />
                                </View>
                                <Text className="text-zinc-500 text-xs">
                                    {tool.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Sensor strip */}
                <View
                    style={{ backgroundColor: "#09090b" }}
                    className="flex-row justify-around py-3 border-t border-zinc-800"
                >
                    {SENSOR_READINGS.map((r) => (
                        <View key={r.label} className="items-center">
                            <Text className="text-zinc-600 text-xs">
                                {r.label}
                            </Text>
                            <Text className="text-white text-xs font-semibold mt-0.5">
                                {r.value}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Delete / Keep row */}
                <View
                    style={{ backgroundColor: "#0a0a0a", paddingBottom: 36 }}
                    className="flex-row gap-3 px-5 pt-3"
                >
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setCaptured(false)}
                        className="flex-1 bg-zinc-900 border border-zinc-700 rounded-2xl py-3.5 items-center flex-row justify-center gap-2"
                    >
                        <Ionicons name="trash-outline" size={16} color="#ef4444" />
                        <Text className="text-red-500 font-semibold text-sm">
                            Delete
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => onNavigate("reportEditor")}
                        className="flex-1 bg-primary rounded-2xl py-3.5 items-center flex-row justify-center gap-2"
                    >
                        <Ionicons name="checkmark" size={16} color="#ffffff" />
                        <Text className="text-white font-bold text-sm">
                            Save to report
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // ── Camera View ────────────────────────────────────────────────────────────
    return (
        <View style={{ flex: 1, backgroundColor: "#000000" }}>
            <StatusBar barStyle="light-content" />

            {/* Viewfinder */}
            <View style={{ flex: 1, position: "relative" }}>
                {/* Simulated dark viewfinder background */}
                <View
                    style={{
                        ...StyleSheet.absoluteFillObject,
                        backgroundColor: "#0c0c0c",
                    }}
                />

                {/* Top Controls Overlay */}
                <View
                    style={{ paddingTop: 56, position: "absolute", top: 0, left: 0, right: 0 }}
                    className="flex-row items-center justify-between px-5 pb-3"
                >
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => onNavigate("reportEditor")}
                        className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
                    >
                        <Ionicons name="arrow-back" size={18} color="#ffffff" />
                    </TouchableOpacity>

                    {/* GPS Pill */}
                    <View className="bg-black/60 rounded-full px-3 py-1.5 flex-row items-center gap-1.5">
                        <Ionicons name="location" size={12} color="#f2a72f" />
                        <Text className="text-white text-xs font-medium">
                            −37.8136, 144.9631
                        </Text>
                    </View>

                    {/* Right Controls */}
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => setFlash((v) => !v)}
                            className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
                        >
                            <Ionicons
                                name={flash ? "flash" : "flash-off"}
                                size={18}
                                color={flash ? "#f2a72f" : "#ffffff"}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
                        >
                            <Ionicons
                                name="camera-reverse-outline"
                                size={18}
                                color="#ffffff"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Corner Brackets */}
                <Bracket position="tl" />
                <Bracket position="tr" />
                <Bracket position="bl" />
                <Bracket position="br" />

                {/* Focus Ring */}
                <View
                    style={{
                        position: "absolute",
                        alignSelf: "center",
                        top: "38%",
                        width: 68,
                        height: 68,
                        borderWidth: 1.5,
                        borderColor: "#f2a72f",
                        borderRadius: 8,
                    }}
                />

                {/* Sensor Data — right side */}
                <View
                    style={{ position: "absolute", right: 16, top: 150 }}
                    className="bg-black/60 rounded-xl px-3 py-2.5 gap-2"
                >
                    {SENSOR_READINGS.map((r) => (
                        <View key={r.label} className="flex-row items-center gap-2">
                            <Text className="text-zinc-500 text-xs w-12">
                                {r.label}
                            </Text>
                            <Text className="text-white text-xs font-semibold">
                                {r.value}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Bottom GPS tag */}
                <View
                    style={{ position: "absolute", bottom: 16, left: 0, right: 0 }}
                    className="items-center"
                >
                    <View className="bg-black/60 rounded-full px-4 py-1.5 flex-row items-center gap-2">
                        <View className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <Text className="text-zinc-300 text-xs">
                            GPS locked · Accuracy{" "}
                            <Text className="text-primary">±3 m</Text>
                        </Text>
                    </View>
                </View>
            </View>

            {/* Mode Toggle */}
            <View
                style={{ backgroundColor: "#09090b" }}
                className="items-center pt-3 pb-2"
            >
                <View className="flex-row bg-zinc-800 rounded-full p-1">
                    {(["photo", "video"] as CameraMode[]).map((m) => (
                        <TouchableOpacity
                            key={m}
                            activeOpacity={0.7}
                            onPress={() => setMode(m)}
                            className={`px-6 py-1.5 rounded-full ${m === mode ? "bg-zinc-600" : ""}`}
                        >
                            <Text
                                className={`text-sm font-medium capitalize ${
                                    m === mode ? "text-white" : "text-zinc-500"
                                }`}
                            >
                                {m}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Controls Row */}
            <View
                style={{ backgroundColor: "#09090b", paddingBottom: 48 }}
                className="flex-row items-center justify-between px-10 pt-4"
            >
                {/* Last capture thumbnail */}
                <View className="w-14 h-14 rounded-xl bg-zinc-800 items-center justify-center">
                    <Ionicons name="images-outline" size={22} color="#52525b" />
                </View>

                {/* Capture Button */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setCaptured(true)}
                >
                    <View
                        style={{
                            width: 76,
                            height: 76,
                            borderRadius: 38,
                            borderWidth: 3.5,
                            borderColor: "#ffffff",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <View
                            style={{
                                width: 60,
                                height: 60,
                                borderRadius: mode === "video" ? 10 : 30,
                                backgroundColor:
                                    mode === "video" ? "#ef4444" : "#ffffff",
                            }}
                        />
                    </View>
                </TouchableOpacity>

                {/* Audio button */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    className="w-14 h-14 rounded-xl bg-zinc-800 items-center justify-center"
                >
                    <Ionicons name="mic-outline" size={22} color="#52525b" />
                    <Text className="text-zinc-600 text-xs mt-0.5">Audio</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

