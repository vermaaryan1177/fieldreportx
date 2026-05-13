import SubmitFormButton from "@/components/SubmitFormButton";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface Permission {
    id: string;
    icon: string;
    title: string;
    description: string;
    reason: string;
    required: boolean;
}

const PERMISSIONS: Permission[] = [
    {
        id: "camera",
        icon: "📷",
        title: "Camera",
        description: "Take photos and record video",
        reason: "Required to capture site evidence, annotate photos, and attach visual media directly to your reports.",
        required: true,
    },
    {
        id: "location",
        icon: "📍",
        title: "Location & GPS",
        description: "Access precise device location",
        reason: "Used to geotag reports, record GPS routes, and automatically attach coordinates to each captured media item.",
        required: true,
    },
    {
        id: "microphone",
        icon: "🎙️",
        title: "Microphone",
        description: "Record audio and voice notes",
        reason: "Enables voice-to-text note-taking in the Media Handler so you can dictate notes hands-free in the field.",
        required: false,
    },
    {
        id: "storage",
        icon: "💾",
        title: "Storage",
        description: "Read and write files on device",
        reason: "Needed to save drafts locally, store exported PDFs, and manage offline report data when no network is available.",
        required: true,
    },
    {
        id: "notifications",
        icon: "🔔",
        title: "Notifications",
        description: "Send push notifications",
        reason: "Keeps you informed about report signature requests, team updates, and due-date reminders.",
        required: false,
    },
    {
        id: "motion",
        icon: "📡",
        title: "Motion & Sensors",
        description: "Access accelerometer & gyroscope",
        reason: "Captures tilt, orientation, and speed data via the built-in sensor suite to enrich your inspection reports.",
        required: false,
    },
];

export default function PermissionsScreen() {
    const [granted, setGranted] = useState<Record<string, boolean>>({});
    const [expanded, setExpanded] = useState<string | null>(null);

    const toggleGranted = (id: string) => {
        setGranted((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleExpand = (id: string) => {
        setExpanded((prev) => (prev === id ? null : id));
    };

    const requiredAll = PERMISSIONS.filter((p) => p.required).every(
        (p) => granted[p.id],
    );

    const grantAll = () => {
        const all: Record<string, boolean> = {};
        PERMISSIONS.forEach((permission) => (all[permission.id] = true));
        setGranted(all);
    };

    const grantedCount = Object.values(granted).filter(Boolean).length;

    return (
        <ScrollView className="bg-background">
            {/* Header */}
            <View className="mt-20 px-5 pt-5 pb-4">
                <Text className="text-primary text-4xl font-bold tracking-tight">
                    App Permissions
                </Text>
                <Text className="text-white text-sm mt-1 leading-5">
                    FieldReportX needs these permissions to work in the field.
                    Tap any permission to learn why it's needed.
                </Text>
            </View>

            {/* Grant All */}
            <View className="mx-5 mb-4">
                <TouchableOpacity
                    onPress={grantAll}
                    className="flex-row items-center justify-between bg-slate-900 rounded-2xl px-4 py-3"
                >
                    <View>
                        <Text className="text-white font-semibold text-sm">
                            Allow All Permissions
                        </Text>
                        <Text className="text-slate-500 text-xs mt-0.5">
                            {grantedCount}/{PERMISSIONS.length} granted
                        </Text>
                    </View>
                    <View className="w-12 h-6 rounded-full bg-slate-600 items-center justify-center">
                        <Text className="text-primary text-xs font-bold">
                            All
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Permission List */}
            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingBottom: 32,
                }}
            >
                <View className="gap-3">
                    {PERMISSIONS.map((perm) => {
                        const isGranted = !!granted[perm.id];
                        const isOpen = expanded === perm.id;

                        return (
                            <View
                                key={perm.id}
                                className={
                                    "rounded-2xl border overflow-hidden bg-slate-900"
                                }
                            >
                                {/* Main row */}
                                <View className="flex-row items-center px-4 py-3.5">
                                    {/* Icon */}
                                    <View className="w-10 h-10 rounded-xl bg-slate-800 items-center justify-center mr-3">
                                        <Text className="text-xl">
                                            {perm.icon}
                                        </Text>
                                    </View>

                                    {/* Text */}
                                    <TouchableOpacity
                                        className="flex-1"
                                        onPress={() => toggleExpand(perm.id)}
                                    >
                                        <View className="flex-row items-center gap-2">
                                            <Text className="text-white font-semibold text-sm">
                                                {perm.title}
                                            </Text>
                                            {perm.required && (
                                                <View className="bg-primary/20 rounded-full px-2 py-0.5">
                                                    <Text className="text-primary text-xs">
                                                        Required
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text className="text-slate-500 text-xs mt-0.5">
                                            {perm.description}
                                        </Text>
                                    </TouchableOpacity>

                                    {/* Toggle */}
                                    <TouchableOpacity
                                        onPress={() => toggleGranted(perm.id)}
                                        className={`w-12 h-6 rounded-full ml-3 items-center justify-center transition-all ${
                                            isGranted
                                                ? "bg-primary"
                                                : "bg-slate-700"
                                        }`}
                                    >
                                        <View
                                            className={`w-4 h-4 rounded-full bg-white absolute ${
                                                isGranted ? "right-1" : "left-1"
                                            }`}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Expand reason */}
                                {isOpen && (
                                    <View className="bg-zinc-950 border-t border-zinc-800 px-4 py-3">
                                        <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-1">
                                            Why we need this
                                        </Text>
                                        <Text className="text-zinc-400 text-sm leading-5">
                                            {perm.reason}
                                        </Text>
                                    </View>
                                )}

                                {/* Expand toggle hint */}
                                <TouchableOpacity
                                    onPress={() => toggleExpand(perm.id)}
                                    className="flex-row items-center justify-center py-1.5 border-t border-zinc-800/60"
                                >
                                    <Text className="text-zinc-600 text-xs">
                                        {isOpen ? "▲ Close" : "▼ Why?"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Next */}
            <SubmitFormButton text="Next" />

            {/* Skip */}
            <Text className="text-white text-xs text-center mt-5 leading-5 px-4">
                You can update permissions at any time from{" "}
                <Text className="text-primary">Settings → Permissions</Text>
            </Text>
        </ScrollView>
    );
}
