import BottomNavBar, { AppScreen } from "@/components/BottomNavBar";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface Props {
    onNavigate: (screen: AppScreen) => void;
}

/* Reusable Toggle (same style as Permissions page) */
const Toggle = ({
    value,
    onPress,
}: {
    value: boolean;
    onPress: () => void;
}) => {
    return (
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
};

const SettingsScreen = ({ onNavigate }: Props) => {
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

    return (
        <View className="flex-1 pt-10 bg-slate-900">
            {/* Header */}
            <View className="border-b border-zinc-800 px-5 py-4">
                <Text className="text-3xl font-bold text-white">Settings</Text>
            </View>

            {/* Scrollable content */}
            <ScrollView className="flex-1 px-5">
                {/* Permissions */}
                <View className="pt-5">
                    <Text className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
                        Permissions
                    </Text>

                    <View className="flex-row items-center justify-between border-b border-zinc-800 py-4">
                        <Text className="text-base text-white">Camera</Text>
                        <Toggle
                            value={cameraEnabled}
                            onPress={() => setCameraEnabled(!cameraEnabled)}
                        />
                    </View>

                    <View className="flex-row items-center justify-between border-b border-zinc-800 py-4">
                        <Text className="text-base text-white">
                            Location (GPS)
                        </Text>
                        <Toggle
                            value={locationEnabled}
                            onPress={() => setLocationEnabled(!locationEnabled)}
                        />
                    </View>

                    <View className="flex-row items-center justify-between border-b border-zinc-800 py-4">
                        <Text className="text-base text-white">Microphone</Text>
                        <Toggle
                            value={microphoneEnabled}
                            onPress={() =>
                                setMicrophoneEnabled(!microphoneEnabled)
                            }
                        />
                    </View>

                    <View className="flex-row items-center justify-between border-b border-zinc-800 py-4">
                        <Text className="text-base text-white">
                            Motion sensors
                        </Text>
                        <Toggle
                            value={motionEnabled}
                            onPress={() => setMotionEnabled(!motionEnabled)}
                        />
                    </View>
                </View>

                {/* Notifications */}
                <View className="pt-5">
                    <Text className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
                        Notifications
                    </Text>

                    <View className="flex-row items-center justify-between border-b border-zinc-800 py-4">
                        <Text className="text-base text-white">
                            Report reminders
                        </Text>
                        <Toggle
                            value={reportReminderEnabled}
                            onPress={() =>
                                setReportReminderEnabled(!reportReminderEnabled)
                            }
                        />
                    </View>

                    <View className="flex-row items-center justify-between border-b border-zinc-800 py-4">
                        <Text className="text-base text-white">
                            Template updates
                        </Text>
                        <Toggle
                            value={templateUpdatesEnabled}
                            onPress={() =>
                                setTemplateUpdatesEnabled(
                                    !templateUpdatesEnabled,
                                )
                            }
                        />
                    </View>
                </View>

                {/* Storage */}
                <View className="pt-5 pb-20">
                    <Text className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
                        Storage & Data
                    </Text>

                    <View className="flex-row items-center justify-between border-b border-zinc-800 py-4">
                        <Text className="text-base text-white">Cloud sync</Text>
                        <Toggle
                            value={cloudSyncEnabled}
                            onPress={() =>
                                setCloudSyncEnabled(!cloudSyncEnabled)
                            }
                        />
                    </View>

                    <View className="flex-row items-center justify-between border-b border-zinc-800 py-4">
                        <Text className="text-base text-white">
                            Local storage used
                        </Text>
                        <Text className="text-zinc-400">1.2 GB</Text>
                    </View>

                    <TouchableOpacity className="border-b border-zinc-800 py-4">
                        <Text className="font-medium text-white">
                            Export & backup data
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* About */}
                <View className="pt-5 pb-24">
                    <Text className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
                        About
                    </Text>

                    <View className="flex-row items-center justify-between border-b border-zinc-800 py-4">
                        <Text className="text-base text-white">
                            App version
                        </Text>
                        <Text className="text-zinc-400">2.1.0 (441)</Text>
                    </View>

                    <TouchableOpacity className="flex-row items-center justify-between py-4">
                        <Text className="text-base text-white">
                            Terms & privacy policy
                        </Text>
                        <Text className="text-zinc-400">›</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Bottom Nav */}
            <BottomNavBar active="settings" onNavigate={onNavigate} />
        </View>
    );
};

export default SettingsScreen;
