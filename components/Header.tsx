import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { AppScreen } from "@/components/BottomNavBar";
import { NotificationDB } from "@/lib/db/notifications";
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
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user?.uid) return;
        return NotificationDB.subscribe(user.uid, (items) => {
            setUnreadCount(items.filter((n) => n.unread).length);
        });
    }, [user?.uid]);

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
                    style={{ overflow: "visible" }}
                    onPress={() => safeNavigate("notification")}
                >
                    <Ionicons name="notifications-outline" size={20} color="#f2a72f" />
                    {unreadCount > 0 && (
                        <View style={{
                            position: "absolute", top: 0, right: 0,
                            minWidth: 16, height: 16, borderRadius: 8,
                            backgroundColor: "#ef4444",
                            alignItems: "center", justifyContent: "center",
                            paddingHorizontal: 3,
                            borderWidth: 1.5, borderColor: "#0f172a",
                        }}>
                            <Text style={{ color: "#fff", fontSize: 9, fontWeight: "800", lineHeight: 11 }}>
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </Text>
                        </View>
                    )}
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