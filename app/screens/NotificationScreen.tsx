// screens/NotificationsScreen.tsx
import AppHeader from "@/components/Header";
import BottomNavBar, { AppScreen } from "@/components/BottomNavBar";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, Button } from "react-native";

import { NotificationDB, NotificationItem } from "@/lib/db/notifications";
import { OrganisationInvitesDB } from "@/lib/db/organisationInvites";

interface Props {
    onNavigate: (screen: AppScreen) => void;
    onOpenSidebar: () => void;
    hasOrganisation: boolean;
    userId: string;
}

const NotificationCard = ({ item, onPress }: any) => (
    <TouchableOpacity
        activeOpacity={0.7}
        className={`mx-5 mb-3 flex-row items-center justify-between rounded-2xl border p-4 ${
            item?.unread ? "border-zinc-600 bg-zinc-800" : "border-zinc-800 bg-zinc-900"
        }`}
        onPress={() => onPress(item)}
    >
        <View className="flex-1 flex-row items-start">
            {item?.unread && (
                <View className="mr-3 mt-1 h-2.5 w-2.5 rounded-full bg-amber-500" />
            )}

            <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-zinc-700">
                <Text className="text-white">{item?.icon ?? "•"}</Text>
            </View>

            <View className="flex-1">
                <Text className="text-white font-semibold">{item?.title ?? "No Title"}</Text>
                {item?.description ? (
                    <Text className="text-zinc-400 text-sm">{item.description}</Text>
                ) : null}
            </View>
        </View>

        <Text className="text-zinc-500">›</Text>
    </TouchableOpacity>
);

export default function NotificationsScreen({
    onNavigate,
    onOpenSidebar,
    hasOrganisation,
    userId,
}: Props) {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);

    useEffect(() => {
        if (!userId) return;

        const unsub = NotificationDB.subscribe(userId, setNotifications);
        return () => unsub?.();
    }, [userId]);

    const unread = useMemo(() => notifications.filter((n) => n?.unread), [notifications]);
    const earlier = useMemo(() => notifications.filter((n) => !n?.unread), [notifications]);

    const handlePress = async (item: NotificationItem) => {
        if (!item?.id) return;
        await NotificationDB.markAsRead(userId, item.id);

        if (item?.inviteId) {
            // SIMPLE AUTO-ACCEPT
            await OrganisationInvitesDB.acceptInvite(userId, item.inviteId);
        }
    };

    // --- Test Notification Button ---
    const createTestNotification = async () => {
        if (!userId) return;

        try {
            await NotificationDB.create(userId, {
                title: "🔥 Test Notification",
                description: "This notification was created for testing!",
                icon: "🔔",
                unread: true,
                time: new Date().toLocaleTimeString(),
            });
            console.log("✅ Test notification created!");
        } catch (error) {
            console.error("❌ Failed to create test notification:", error);
        }
    };

    // --- Optional: Mark All Read Button ---
    const markAllRead = async () => {
        await NotificationDB.markAllAsRead(userId, notifications);
    };

    return (
        <View className="flex-1 bg-background">
            <AppHeader onOpenSidebar={onOpenSidebar} onNavigate={onNavigate} profileInitials="AK" />

            <View className="flex-row items-center justify-between border-b border-zinc-800 px-5 py-4">
                <Text className="text-2xl font-bold text-white">Notifications</Text>
                <Text className="text-amber-500">{unread.length ?? 0} unread</Text>
            </View>

            {/* --- Test Buttons --- */}
            <View className="px-5 py-2 flex-row space-x-2">
                <Button title="Create Test Notification" onPress={createTestNotification} />
                <Button title="Mark All Read" onPress={markAllRead} />
            </View>

            <ScrollView>
                {unread.map((item) => (
                    <NotificationCard
                        key={item?.id ?? Math.random().toString()}
                        item={item}
                        onPress={handlePress}
                    />
                ))}

                {earlier.map((item) => (
                    <NotificationCard
                        key={item?.id ?? Math.random().toString()}
                        item={item}
                        onPress={handlePress}
                    />
                ))}
            </ScrollView>

            <BottomNavBar active="notification" onNavigate={onNavigate} hasOrganisation={hasOrganisation} />
        </View>
    );
}