import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

import BottomNavBar, { AppScreen } from "@/components/BottomNavBar";
import { signOut } from "@/lib/auth";
import { auth } from "@/lib/firebase";

interface Props {
    onNavigate: (screen: AppScreen) => void;
}

const Toggle = ({ value, onPress }: { value: boolean; onPress: () => void }) => (
    <TouchableOpacity
        onPress={onPress}
        className={`w-12 h-6 rounded-full items-center justify-center ${
            value ? "bg-primary" : "bg-slate-700"
        }`}
    >
        <View
            className={`w-4 h-4 rounded-full bg-white absolute ${
                value ? "right-1" : "left-1"
            }`}
        />
    </TouchableOpacity>
);

export default function SettingsScreen({ onNavigate }: Props) {
    const user = auth.currentUser;

    // Permissions
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [locationEnabled, setLocationEnabled] = useState(true);
    const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
    const [motionEnabled, setMotionEnabled] = useState(false);

    // Notifications
    const [reportReminderEnabled, setReportReminderEnabled] = useState(true);
    const [templateUpdatesEnabled, setTemplateUpdatesEnabled] = useState(true);

    // Storage
    const [cloudSyncEnabled, setCloudSyncEnabled] = useState(true);

    // Sign out
    const [signingOut, setSigningOut] = useState(false);

    const initials = user?.displayName
        ? user.displayName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : "?";

    const handleSignOut = () => {
        Alert.alert("Sign out", "Are you sure you want to sign out?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Sign out",
                style: "destructive",
                onPress: async () => {
                    setSigningOut(true);
                    try {
                        await signOut();
                    } catch {
                        setSigningOut(false);
                        Alert.alert(
                            "Error",
                            "Failed to sign out. Please try again.",
                        );
                    }
                },
            },
        ]);
    };

    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <View className="px-5 pt-16 pb-4">
                <Text className="text-white text-2xl font-bold">Settings</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 32 }}
            >
                {/* Profile card */}
                <View className="mx-5 bg-slate-900 rounded-2xl p-4 flex-row items-center gap-4">
                    <View className="w-14 h-14 rounded-full bg-primary items-center justify-center">
                        <Text className="text-white text-lg font-bold">
                            {initials}
                        </Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-white font-semibold text-base">
                            {user?.displayName ?? "—"}
                        </Text>
                        <Text className="text-zinc-500 text-sm mt-0.5">
                            {user?.email ?? "—"}
                        </Text>
                    </View>
                    <TouchableOpacity activeOpacity={0.7}>
                        <Ionicons
                            name="pencil-outline"
                            size={18}
                            color="#71717a"
                        />
                    </TouchableOpacity>
                </View>

                {/* Permissions */}
                <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mx-5 mt-5 mb-2">
                    Permissions
                </Text>
                <View className="mx-5 bg-slate-900 rounded-2xl px-4">
                    {[
                        { label: "Camera", value: cameraEnabled, onPress: () => setCameraEnabled((v) => !v) },
                        { label: "Location (GPS)", value: locationEnabled, onPress: () => setLocationEnabled((v) => !v) },
                        { label: "Microphone", value: microphoneEnabled, onPress: () => setMicrophoneEnabled((v) => !v) },
                        { label: "Motion sensors", value: motionEnabled, onPress: () => setMotionEnabled((v) => !v) },
                    ].map((item, i, arr) => (
                        <View
                            key={item.label}
                            className={`flex-row items-center justify-between py-4 ${
                                i < arr.length - 1 ? "border-b border-zinc-800" : ""
                            }`}
                        >
                            <Text className="text-white text-sm">{item.label}</Text>
                            <Toggle value={item.value} onPress={item.onPress} />
                        </View>
                    ))}
                </View>

                {/* Notifications */}
                <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mx-5 mt-5 mb-2">
                    Notifications
                </Text>
                <View className="mx-5 bg-slate-900 rounded-2xl px-4">
                    {[
                        { label: "Report reminders", value: reportReminderEnabled, onPress: () => setReportReminderEnabled((v) => !v) },
                        { label: "Template updates", value: templateUpdatesEnabled, onPress: () => setTemplateUpdatesEnabled((v) => !v) },
                    ].map((item, i, arr) => (
                        <View
                            key={item.label}
                            className={`flex-row items-center justify-between py-4 ${
                                i < arr.length - 1 ? "border-b border-zinc-800" : ""
                            }`}
                        >
                            <Text className="text-white text-sm">{item.label}</Text>
                            <Toggle value={item.value} onPress={item.onPress} />
                        </View>
                    ))}
                </View>

                {/* Storage & Data */}
                <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mx-5 mt-5 mb-2">
                    Storage &amp; Data
                </Text>
                <View className="mx-5 bg-slate-900 rounded-2xl px-4">
                    <View className="flex-row items-center justify-between py-4 border-b border-zinc-800">
                        <Text className="text-white text-sm">Cloud sync</Text>
                        <Toggle
                            value={cloudSyncEnabled}
                            onPress={() => setCloudSyncEnabled((v) => !v)}
                        />
                    </View>
                    <View className="flex-row items-center justify-between py-4 border-b border-zinc-800">
                        <Text className="text-white text-sm">Local storage used</Text>
                        <Text className="text-zinc-400 text-sm">1.2 GB</Text>
                    </View>
                    <TouchableOpacity activeOpacity={0.7} className="py-4">
                        <Text className="text-white text-sm">Export &amp; backup data</Text>
                    </TouchableOpacity>
                </View>

                {/* About */}
                <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mx-5 mt-5 mb-2">
                    About
                </Text>
                <View className="mx-5 bg-slate-900 rounded-2xl px-4">
                    <View className="flex-row items-center justify-between py-4 border-b border-zinc-800">
                        <Text className="text-white text-sm">App version</Text>
                        <Text className="text-zinc-400 text-sm">1.0.0</Text>
                    </View>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        className="flex-row items-center justify-between py-4"
                    >
                        <Text className="text-white text-sm">Terms &amp; privacy policy</Text>
                        <Ionicons name="chevron-forward" size={16} color="#3f3f46" />
                    </TouchableOpacity>
                </View>

                {/* Sign out */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleSignOut}
                    disabled={signingOut}
                    className="mx-5 mt-5 bg-alert/10 border border-alert/30 rounded-2xl py-4 flex-row items-center justify-center gap-2"
                >
                    <Ionicons name="log-out-outline" size={18} color="#f93a3a" />
                    <Text className="text-alert font-semibold text-sm">
                        {signingOut ? "Signing out…" : "Sign out"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            <BottomNavBar active="settings" onNavigate={onNavigate} />
        </View>
    );
}
