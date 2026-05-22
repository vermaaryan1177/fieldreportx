import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { AppScreen } from "@/components/BottomNavBar";
import { auth } from "@/lib/firebase";

interface HeaderProps {
    onOpenSidebar: () => void;
    onNavigate: (screen: AppScreen) => void;
    profileInitials?: string;
    active?: AppScreen;
}

function getInitials(name?: string | null, email?: string | null) {
    if (name && name.trim().length > 0) {
        return name
            .trim()
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    }

    if (email) return email[0].toUpperCase();

    return "U";
}

export default function AppHeader({
    onOpenSidebar,
    onNavigate,
    profileInitials,
    active,
}: HeaderProps) {
    const user = auth.currentUser;
    const lastNav = useRef(0);

    const initials = useMemo(() => {
        if (profileInitials) return profileInitials.toUpperCase();
        return getInitials(user?.displayName, user?.email);
    }, [profileInitials, user]);

    const safeNavigate = (screen: AppScreen) => {
        if (active === screen) return;
        const now = Date.now();
        if (now - lastNav.current < 500) return;
        lastNav.current = now;
        onNavigate(screen);
    };

    return (
        <View className="flex-row items-center justify-between px-5 pt-12 pb-5 bg-slate-900">
            {/* LEFT: Sidebar */}
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={onOpenSidebar}
                className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center"
            >
                <Ionicons name="menu" size={22} color="#ffffff" />
            </TouchableOpacity>

            {/* RIGHT: Actions */}
            <View className="flex-row items-center gap-3">
                <TouchableOpacity
                    activeOpacity={0.7}
                    className="w-9 h-9 items-center justify-center rounded-full bg-slate-800"
                    onPress={() => safeNavigate("notification")}
                >
                    <Ionicons
                        name="notifications-outline"
                        size={20}
                        color="#f2a72f"
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => safeNavigate("settings")}
                    className="w-10 h-10 rounded-full bg-primary items-center justify-center"
                >
                    <Text className="text-white font-bold text-sm">
                        {initials}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}