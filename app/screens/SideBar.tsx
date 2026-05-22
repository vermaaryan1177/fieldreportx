import { signOut } from "@/lib/auth";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import React, { useEffect, useState, useMemo } from "react";
import {
    Alert,
    Modal,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { fnv1a32 } from "@/lib/checksum";

import { AppScreen } from "@/components/BottomNavBar";
import { auth } from "@/lib/firebase";
import { getUserOrganisation } from "@/lib/db/organisations";
import { store } from "@/lib/store";
// import { getUserNotifications } from "@/lib/db/notifications";

type SidebarItem = {
    id: AppScreen;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
};

const MAIN_ITEMS: SidebarItem[] = [
    { id: "home", label: "Home", icon: "home-outline" },
    { id: "reports", label: "My Reports", icon: "document-text-outline" },
    { id: "templateLibrary", label: "Templates", icon: "layers-outline" },
];

const OTHER_ITEMS: SidebarItem[] = [
    { id: "settings", label: "Settings", icon: "settings-outline" },
];

interface SidebarProps {
    active: AppScreen;
    onNavigate: (screen: AppScreen) => void;
    onOrgSwitch?: (orgId: string) => void;
}

/* helpers */
function getEmailPrefix(email?: string | null) {
    if (!email) return "USER";
    return email.split("@")[0].toUpperCase();
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

function SidebarButton({
    item,
    active,
    onNavigate,
}: {
    item: SidebarItem;
    active: AppScreen;
    onNavigate: (screen: AppScreen) => void;
}) {
    const isActive = active === item.id;

    return (
        <TouchableOpacity
            onPress={() => onNavigate(item.id)}
            activeOpacity={0.7}
            className={`mb-3 flex-row items-center rounded-xl px-3 py-4 ${
                isActive ? "bg-zinc-800" : "bg-transparent"
            }`}
        >
            <Ionicons
                name={item.icon}
                size={22}
                color={isActive ? "#f2a72f" : "#71717a"}
            />
            <Text
                className={`ml-3 text-base ${
                    isActive ? "text-primary font-semibold" : "text-zinc-400"
                }`}
            >
                {item.label}
            </Text>
        </TouchableOpacity>
    );
}

export default function Sidebar({ active, onNavigate, onOrgSwitch }: SidebarProps) {
    const user = auth.currentUser;

    const deviceHash = useMemo(
        () => fnv1a32((user?.uid ?? "anon") + Platform.OS),
        [user?.uid],
    );

    const [signingOut, setSigningOut] = useState(false);

    const [organisations, setOrganisations] = useState<any[]>([]);
    const [currentOrg, setCurrentOrg] = useState<any | null>(null);
    const [orgModalVisible, setOrgModalVisible] = useState(false);

    const [notifications, setNotifications] = useState<any[]>([]);

    /* load orgs */
    useEffect(() => {
        if (!user?.uid) return;

        (async () => {
            const orgs = await getUserOrganisation(user.uid);
            const safe = Array.isArray(orgs) ? orgs : [];

            setOrganisations(safe);
            const active = safe.find((o) => o.id === store.currentOrgId) ?? safe[0] ?? null;
            setCurrentOrg(active);
            if (active) store.setCurrentOrgId(active.id);
        })();
    }, [user?.uid]);

    /* load notifications (replace with your real function) */
    useEffect(() => {
        if (!user?.uid) return;

        (async () => {
            // const data = await getUserNotifications(user.uid);
            // setNotifications(Array.isArray(data) ? data : []);

            setNotifications([]); // placeholder until wired
        })();
    }, [user?.uid]);

    const initials = useMemo(() => {
        return getInitials(user?.displayName, user?.email);
    }, [user]);

    const unreadCount = useMemo(() => {
        return notifications.filter((n) => !n.read).length;
    }, [notifications]);

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
                        Alert.alert("Error", "Failed to sign out.");
                    }
                },
            },
        ]);
    };

    const switchOrg = (org: any) => {
        setCurrentOrg(org);
        store.setCurrentOrgId(org.id);
        onOrgSwitch?.(org.id);
        setOrgModalVisible(false);
    };

    return (
        <View className="flex-1 pt-10 w-80 bg-slate-900 border-r border-zinc-800">
            {/* TOP USER */}
            <View className="flex-row items-center border-b border-zinc-800 p-5">
                <View className="h-14 w-14 rounded-full bg-primary items-center justify-center">
                    <Text className="text-black font-bold text-lg">
                        {initials}
                    </Text>
                </View>

                <View className="ml-3">
                    <Text className="text-white font-semibold text-base">
                        {getEmailPrefix(user?.email)}
                    </Text>
                    <Text className="text-zinc-500 text-sm">
                        Field Inspector
                    </Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-4 pt-4">
                {/* MAIN */}
                {MAIN_ITEMS.map((item) => (
                    <SidebarButton
                        key={item.id}
                        item={item}
                        active={active}
                        onNavigate={onNavigate}
                    />
                ))}

                {/* NOTIFICATIONS */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    className="mb-3 flex-row items-center justify-between rounded-xl px-3 py-4"
                    onPress={() => onNavigate("notification")}
                >
                    <View className="flex-row items-center">
                        <Ionicons
                            name="notifications-outline"
                            size={22}
                            color="#71717a"
                        />
                        <Text className="ml-3 text-base text-zinc-400">
                            Notifications
                        </Text>
                    </View>

                    {unreadCount > 0 && (
                        <View className="h-6 w-6 rounded-full bg-red-500 items-center justify-center">
                            <Text className="text-white text-xs font-bold">
                                {unreadCount}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View className="h-[1px] bg-zinc-800 my-2" />

                {/* OTHER */}
                {OTHER_ITEMS.map((item) => (
                    <SidebarButton
                        key={item.id}
                        item={item}
                        active={active}
                        onNavigate={onNavigate}
                    />
                ))}

                {/* ORG */}
                <TouchableOpacity
                    onPress={() => onNavigate("organisation")}
                    className="mb-4 flex-row items-center rounded-xl px-3 py-4"
                >
                    <Ionicons
                        name="business-outline"
                        size={22}
                        color="#71717a"
                    />
                    <Text className="ml-3 text-base text-zinc-400">
                        Organisation
                    </Text>
                </TouchableOpacity>

                <View className="h-[1px] bg-zinc-800 mb-4" />

                {/* CURRENT ORG */}
                <Text className="text-zinc-500 text-xs font-bold uppercase mb-3 px-1">
                    Current Org
                </Text>

                {organisations.length > 0 ? (
                    <TouchableOpacity
                        onPress={() => setOrgModalVisible(true)}
                        className="border border-zinc-800 rounded-xl px-4 py-4 flex-row items-center justify-between"
                    >
                        <View className="flex-row items-center">
                            <Ionicons
                                name="business"
                                size={18}
                                color="#f2a72f"
                            />
                            <Text className="text-white ml-2">
                                {currentOrg?.name || "Select Org"}
                            </Text>
                        </View>

                        <Ionicons
                            name="chevron-down"
                            size={18}
                            color="#71717a"
                        />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={() => onNavigate("organisation")}
                        className="border border-dashed border-zinc-700 rounded-xl px-4 py-4 flex-row items-center justify-center"
                    >
                        <Ionicons
                            name="add-circle-outline"
                            size={18}
                            color="#f2a72f"
                        />
                        <Text className="text-primary ml-2 font-medium">
                            Create Organisation
                        </Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            {/* ORG MODAL */}
            <Modal visible={orgModalVisible} transparent animationType="fade">
                <View className="flex-1 bg-black/70 justify-center px-6">
                    <View className="bg-slate-900 rounded-2xl p-5">
                        <Text className="text-white font-bold mb-4">
                            Switch Organisation
                        </Text>

                        {organisations.map((org) => (
                            <TouchableOpacity
                                key={org.id}
                                onPress={() => switchOrg(org)}
                                className="p-4 bg-slate-800 rounded-xl mb-2 flex-row items-center justify-between"
                            >
                                <View className="flex-row items-center">
                                    <Ionicons
                                        name="business"
                                        size={18}
                                        color="#f2a72f"
                                    />
                                    <Text className="text-white ml-2">
                                        {org.name}
                                    </Text>
                                </View>

                                <Ionicons
                                    name="chevron-forward"
                                    size={16}
                                    color="#71717a"
                                />
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            onPress={() => setOrgModalVisible(false)}
                            className="mt-3 p-3"
                        >
                            <Text className="text-zinc-400 text-center">
                                Close
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* FOOTER */}
            <View className="border-t border-zinc-800 p-4">
                <Text className="text-white font-semibold">
                    FieldReportX
                </Text>

                <Text className="text-zinc-500 text-sm mt-1">
                    Version {Constants.expoConfig?.version ?? "1.0.0"}
                </Text>

                <View className="mt-3 bg-slate-800 rounded-xl px-3 py-2.5 flex-row items-center gap-2">
                    <Ionicons name="hardware-chip-outline" size={14} color="#52525b" />
                    <View className="flex-1">
                        <Text className="text-zinc-500 text-xs">Device ID</Text>
                        <Text className="text-zinc-300 text-xs font-mono mt-0.5">
                            {Platform.OS} · {deviceHash}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    className="mt-3 flex-row items-center"
                    onPress={handleSignOut}
                    disabled={signingOut}
                >
                    <Ionicons name="log-out-outline" size={18} color="#ef4444" />
                    <Text className="text-red-500 font-medium ml-2">
                        {signingOut ? "Signing out…" : "Sign out"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}



