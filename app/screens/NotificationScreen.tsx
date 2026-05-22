import AppHeader from "@/components/Header";
import BottomNavBar, { AppScreen } from "@/components/BottomNavBar";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { NotificationDB, NotificationItem } from "@/lib/db/notifications";

interface Props {
    onNavigate: (screen: AppScreen) => void;
    onOpenSidebar: () => void;
    hasOrganisation: boolean;
    userId: string; // IMPORTANT
}

const NotificationCard = ({
    item,
    onPress,
}: {
    item: NotificationItem;
    onPress: (id: string) => void;
}) => (
    <TouchableOpacity
        activeOpacity={0.7}
        className={`mx-5 mb-3 flex-row items-center justify-between rounded-2xl border p-4 ${
            item.unread
                ? "border-zinc-600 bg-zinc-800"
                : "border-zinc-800 bg-zinc-900"
        }`}
        onPress={() => onPress(item.id)}
    >
        <View className="flex-1 flex-row items-start">
            {item.unread && (
                <View className="mr-3 mt-1 h-2.5 w-2.5 rounded-full bg-amber-500" />
            )}

            <View
                className={`mr-3 h-11 w-11 items-center justify-center rounded-xl ${
                    item.unread ? "bg-amber-500/20" : "bg-zinc-700"
                }`}
            >
                <Text className="text-base font-bold text-white">
                    {item.icon || "•"}
                </Text>
            </View>

            <View className="flex-1">
                <Text className="text-white text-[15px] font-semibold">
                    {item.title}
                </Text>

                {!!item.description && (
                    <Text className="mt-1 text-[13px] text-zinc-400">
                        {item.description}
                    </Text>
                )}

                <Text className="mt-1 text-[12px] text-zinc-500">
                    {item.time}
                </Text>
            </View>
        </View>

        <Text className="ml-2 text-lg text-zinc-500">›</Text>
    </TouchableOpacity>
);

export default function NotificationsScreen({
    onNavigate,
    onOpenSidebar,
    hasOrganisation,
    userId,
}: Props) {
    const [notifications, setNotifications] = useState<NotificationItem[]>(
        []
    );

    // REAL-TIME SUBSCRIBE
    useEffect(() => {
        if (!userId) return;

        const unsub = NotificationDB.subscribe(userId, setNotifications);

        return () => unsub();
    }, [userId]);

    const unread = useMemo(
        () => notifications.filter((n) => n.unread),
        [notifications]
    );

    const earlier = useMemo(
        () => notifications.filter((n) => !n.unread),
        [notifications]
    );

    const handlePress = async (id: string) => {
        await NotificationDB.markAsRead(userId, id);
    };

    return (
        <View className="flex-1 bg-background">
            <AppHeader
                onOpenSidebar={onOpenSidebar}
                onNavigate={onNavigate}
                profileInitials="AK"
            />

            <View className="flex-row items-center justify-between border-b border-zinc-800 px-5 py-4">
                <Text className="text-2xl font-bold text-white">
                    Notifications
                </Text>

                <TouchableOpacity>
                    <Text className="text-sm font-medium text-amber-500">
                        {unread.length} unread
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {unread.length > 0 && (
                    <>
                        <Text className="mb-3 ml-5 mt-5 text-xs font-bold uppercase tracking-widest text-zinc-500">
                            Unread · {unread.length}
                        </Text>

                        {unread.map((item) => (
                            <NotificationCard
                                key={item.id}
                                item={item}
                                onPress={handlePress}
                            />
                        ))}
                    </>
                )}

                {earlier.length > 0 && (
                    <>
                        <Text className="mb-3 ml-5 mt-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
                            Earlier
                        </Text>

                        {earlier.map((item) => (
                            <NotificationCard
                                key={item.id}
                                item={item}
                                onPress={handlePress}
                            />
                        ))}
                    </>
                )}

                <View className="h-10" />
            </ScrollView>

            <BottomNavBar
                active="notification"
                onNavigate={onNavigate}
                hasOrganisation={hasOrganisation}
            />
        </View>
    );
}