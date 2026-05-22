import { Ionicons } from "@expo/vector-icons";
import { Camera } from "expo-camera";
import * as Location from "expo-location";
import { DeviceMotion } from "expo-sensors";
import { Audio } from "expo-av";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { AppScreen } from "@/components/BottomNavBar";
import { updateUserProfile } from "@/lib/db/users";
import { auth } from "@/lib/firebase";

interface Props {
    onNavigate: (screen: AppScreen) => void;
    hasOrganisation?: boolean;
}

type PermKey = "camera" | "location" | "microphone" | "motion";

interface PermItem {
    key: PermKey;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    description: string;
    reason: string;
    defaultOn: boolean;
}

const PERMS: PermItem[] = [
    {
        key: "camera",
        icon: "camera-outline",
        label: "Camera",
        description: "Capture photos for reports and evidence",
        reason: "Required to attach site photos, annotate images, and build visual inspection records.",
        defaultOn: true,
    },
    {
        key: "location",
        icon: "location-outline",
        label: "Location & GPS",
        description: "Geotag reports and track inspection routes",
        reason: "Used to attach GPS coordinates to reports and photos, and to record route data during inspections.",
        defaultOn: true,
    },
    {
        key: "microphone",
        icon: "mic-outline",
        label: "Microphone",
        description: "Record voice notes during inspections",
        reason: "Lets you dictate notes hands-free in the field instead of typing.",
        defaultOn: true,
    },
    {
        key: "motion",
        icon: "pulse-outline",
        label: "Motion sensors",
        description: "Detect device orientation for better photos",
        reason: "Reads accelerometer and gyroscope data to enrich inspection reports with sensor readings.",
        defaultOn: false,
    },
];

const Toggle = ({ value, onPress }: { value: boolean; onPress: () => void }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        className={`w-12 h-6 rounded-full ${value ? "bg-primary" : "bg-slate-700"}`}
    >
        <View
            style={{ left: value ? 28 : 4 }}
            className="w-4 h-4 rounded-full bg-white absolute top-1"
        />
    </TouchableOpacity>
);

export default function PermissionsScreen({ onNavigate }: Props) {
    const [enabled, setEnabled] = useState<Record<PermKey, boolean>>(
        () => Object.fromEntries(PERMS.map((p) => [p.key, p.defaultOn])) as Record<PermKey, boolean>,
    );
    const [expanded, setExpanded] = useState<PermKey | null>(null);
    const [loading, setLoading] = useState(false);

    const toggle = (key: PermKey) =>
        setEnabled((prev) => ({ ...prev, [key]: !prev[key] }));

    const toggleExpanded = (key: PermKey) =>
        setExpanded((prev) => (prev === key ? null : key));

    const handleGetStarted = async () => {
        setLoading(true);

        // Each request gets its own .catch so a single failure or hang
        // doesn't block the others or prevent navigation.
        await Promise.all([
            enabled.camera
                ? Camera.requestCameraPermissionsAsync().catch(() => null)
                : null,
            enabled.location
                ? Location.requestForegroundPermissionsAsync().catch(() => null)
                : null,
            enabled.microphone
                ? Audio.requestPermissionsAsync().catch(() => null)
                : null,
            enabled.motion && Platform.OS === "ios"
                ? DeviceMotion.requestPermissionsAsync().catch(() => null)
                : null,
        ]);

        // Fire-and-forget — don't let a Firestore write block navigation.
        const uid = auth.currentUser?.uid;
        if (uid) {
            updateUserProfile(uid, { onboardingComplete: true }).catch(() => null);
        }

        setLoading(false);
        onNavigate("home");
    };

    return (
        <View className="flex-1 bg-background">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 32 }}
            >
                {/* Header */}
                <View className="px-6 pt-20 pb-6">
                    <View className="w-14 h-14 rounded-2xl bg-primary/20 items-center justify-center mb-5">
                        <Ionicons name="shield-checkmark-outline" size={28} color="#f2a72f" />
                    </View>
                    <Text className="text-white text-3xl font-bold mb-2">
                        App permissions
                    </Text>
                    <Text className="text-zinc-400 text-sm leading-relaxed">
                        FieldReportX needs the following permissions to work in
                        the field. Toggle off anything you'd prefer to skip —
                        you can always change these in Settings later.
                    </Text>
                </View>

                {/* Permission cards */}
                <View className="mx-5 gap-3">
                    {PERMS.map((perm) => {
                        const isOpen = expanded === perm.key;
                        const isOn = enabled[perm.key];
                        return (
                            <View
                                key={perm.key}
                                className="bg-slate-900 rounded-2xl overflow-hidden"
                            >
                                {/* Main row */}
                                <View className="flex-row items-center px-4 py-4">
                                    <View className="w-10 h-10 rounded-xl bg-slate-800 items-center justify-center mr-3">
                                        <Ionicons
                                            name={perm.icon}
                                            size={20}
                                            color={isOn ? "#f2a72f" : "#52525b"}
                                        />
                                    </View>
                                    <TouchableOpacity
                                        className="flex-1"
                                        activeOpacity={0.7}
                                        onPress={() => toggleExpanded(perm.key)}
                                    >
                                        <Text className="text-white font-semibold text-sm">
                                            {perm.label}
                                        </Text>
                                        <Text className="text-zinc-500 text-xs mt-0.5">
                                            {perm.description}
                                        </Text>
                                    </TouchableOpacity>
                                    <Toggle
                                        value={isOn}
                                        onPress={() => toggle(perm.key)}
                                    />
                                </View>

                                {/* Expandable reason */}
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

                                {/* Expand hint */}
                                <TouchableOpacity
                                    onPress={() => toggleExpanded(perm.key)}
                                    activeOpacity={0.6}
                                    className="items-center justify-center py-1.5 border-t border-zinc-800/60"
                                >
                                    <Ionicons
                                        name={isOpen ? "chevron-up" : "chevron-down"}
                                        size={14}
                                        color="#52525b"
                                    />
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </View>

                <Text className="text-zinc-600 text-xs text-center mx-10 mt-5 leading-relaxed">
                    You can update any permission at any time in{" "}
                    <Text className="text-zinc-400">Settings → Permissions</Text>
                </Text>
            </ScrollView>

            {/* Get started button */}
            <View className="px-5 pb-12 pt-4">
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleGetStarted}
                    disabled={loading}
                    className="bg-primary rounded-2xl py-4 items-center justify-center flex-row gap-2"
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Text className="text-white font-bold text-base">
                                Get started
                            </Text>
                            <Ionicons name="arrow-forward" size={18} color="#fff" />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
