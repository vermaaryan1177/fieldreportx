import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

import BottomNavBar, { AppScreen } from "@/components/BottomNavBar";
import { signOut } from "@/lib/auth";
import { auth } from "@/lib/firebase";

interface Props {
    onNavigate: (screen: AppScreen) => void;
}

export default function SettingsScreen({ onNavigate }: Props) {
    const [signingOut, setSigningOut] = useState(false);
    const user = auth.currentUser;

    const initials = user?.displayName
        ? user.displayName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : "?";

    const handleSignOut = () => {
        Alert.alert(
            "Sign out",
            "Are you sure you want to sign out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Sign out",
                    style: "destructive",
                    onPress: async () => {
                        setSigningOut(true);
                        try {
                            await signOut();
                            // useAuth in index.tsx detects user = null and
                            // renders LoginRegisterScreen automatically
                        } catch {
                            setSigningOut(false);
                            Alert.alert("Error", "Failed to sign out. Please try again.");
                        }
                    },
                },
            ],
        );
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
                </View>

                {/* Account section */}
                <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mx-5 mt-5 mb-2">
                    Account
                </Text>
                <View className="mx-5 bg-slate-900 rounded-2xl overflow-hidden">
                    {[
                        { icon: "person-outline", label: "Edit profile" },
                        { icon: "lock-closed-outline", label: "Change password" },
                        { icon: "notifications-outline", label: "Notifications" },
                    ].map((item, i, arr) => (
                        <TouchableOpacity
                            key={item.label}
                            activeOpacity={0.7}
                            className={`flex-row items-center px-4 py-4 gap-3 ${
                                i < arr.length - 1 ? "border-b border-zinc-800" : ""
                            }`}
                        >
                            <Ionicons
                                name={item.icon as any}
                                size={20}
                                color="#71717a"
                            />
                            <Text className="text-white text-sm flex-1">
                                {item.label}
                            </Text>
                            <Ionicons
                                name="chevron-forward"
                                size={16}
                                color="#3f3f46"
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* App section */}
                <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mx-5 mt-5 mb-2">
                    App
                </Text>
                <View className="mx-5 bg-slate-900 rounded-2xl overflow-hidden">
                    {[
                        { icon: "shield-checkmark-outline", label: "Privacy policy" },
                        { icon: "document-text-outline", label: "Terms of service" },
                        { icon: "information-circle-outline", label: "Version 1.0.0" },
                    ].map((item, i, arr) => (
                        <TouchableOpacity
                            key={item.label}
                            activeOpacity={0.7}
                            className={`flex-row items-center px-4 py-4 gap-3 ${
                                i < arr.length - 1 ? "border-b border-zinc-800" : ""
                            }`}
                        >
                            <Ionicons
                                name={item.icon as any}
                                size={20}
                                color="#71717a"
                            />
                            <Text className="text-white text-sm flex-1">
                                {item.label}
                            </Text>
                            <Ionicons
                                name="chevron-forward"
                                size={16}
                                color="#3f3f46"
                            />
                        </TouchableOpacity>
                    ))}
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
