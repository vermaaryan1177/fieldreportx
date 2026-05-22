// screens/NotificationsScreen.tsx
import AppHeader from "@/components/Header";
import BottomNavBar, { AppScreen } from "@/components/BottomNavBar";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { NotificationDB, NotificationItem } from "@/lib/db/notifications";
import { OrganisationInvitesDB } from "@/lib/db/organisationInvites";

interface Props {
    onNavigate: (screen: AppScreen) => void;
    onOpenSidebar: () => void;
    hasOrganisation?: boolean;
    userId?: string;
}

function NotificationCard({
    item,
    onPress,
    onAccept,
    onDecline,
}: {
    item: NotificationItem;
    onPress: (item: NotificationItem) => void;
    onAccept?: (item: NotificationItem) => void;
    onDecline?: (item: NotificationItem) => void;
}) {
    const isInvite = !!(item?.inviteId && onAccept && onDecline);

    return (
        <View
            className={`mx-5 mb-3 rounded-2xl border p-4 ${
                item?.unread ? "border-zinc-600 bg-zinc-800" : "border-zinc-800 bg-zinc-900"
            }`}
        >
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => onPress(item)}
                className="flex-row items-start"
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

                {!isInvite && <Text className="text-zinc-500">›</Text>}
            </TouchableOpacity>

            {isInvite && (
                <View className="flex-row gap-2 mt-3 ml-14">
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => onDecline!(item)}
                        className="flex-1 py-2 rounded-xl bg-slate-700 items-center"
                    >
                        <Text className="text-zinc-300 text-sm font-semibold">Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => onAccept!(item)}
                        className="flex-1 py-2 rounded-xl bg-primary items-center"
                    >
                        <Text className="text-white text-sm font-semibold">Accept</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

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
        await NotificationDB.markAsRead(userId ?? "", item.id);
    };

    const handleAcceptInvite = async (item: NotificationItem) => {
        if (!item?.inviteId) return;
        await OrganisationInvitesDB.acceptInvite(userId ?? "", item.inviteId);
        await NotificationDB.markAsRead(userId ?? "", item.id);
    };

    const handleDeclineInvite = async (item: NotificationItem) => {
        if (!item?.inviteId) return;
        await OrganisationInvitesDB.declineInvite(item.inviteId);
        await NotificationDB.markAsRead(userId ?? "", item.id);
    };

    const markAllRead = async () => {
        await NotificationDB.markAllAsRead(userId ?? "", notifications);
    };

    return (
        <View className="flex-1 bg-background">
            <AppHeader onOpenSidebar={onOpenSidebar} onNavigate={onNavigate} active="notification" />

            <View className="flex-row items-center justify-between border-b border-zinc-800 px-5 py-4">
                <Text className="text-2xl font-bold text-white">Notifications</Text>
                <View className="flex-row items-center gap-3">
                    <Text className="text-amber-500">{unread.length} unread</Text>
                    {unread.length > 0 && (
                        <TouchableOpacity activeOpacity={0.7} onPress={markAllRead}>
                            <Text className="text-zinc-500 text-sm">Mark all read</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}>
                {notifications.length === 0 ? (
                    <View className="items-center mt-16 gap-3">
                        <Text className="text-zinc-600 text-4xl">🔔</Text>
                        <Text className="text-zinc-500 text-sm">No notifications yet</Text>
                    </View>
                ) : (
                    <>
                        {unread.map((item) => (
                            <NotificationCard
                                key={item?.id ?? Math.random().toString()}
                                item={item}
                                onPress={handlePress}
                                onAccept={item.inviteId ? handleAcceptInvite : undefined}
                                onDecline={item.inviteId ? handleDeclineInvite : undefined}
                            />
                        ))}

                        {earlier.length > 0 && unread.length > 0 && (
                            <Text className="text-zinc-600 text-xs font-semibold uppercase tracking-widest mx-5 mb-3">
                                Earlier
                            </Text>
                        )}

                        {earlier.map((item) => (
                            <NotificationCard
                                key={item?.id ?? Math.random().toString()}
                                item={item}
                                onPress={handlePress}
                            />
                        ))}
                    </>
                )}
            </ScrollView>

            <BottomNavBar active="notification" onNavigate={onNavigate} hasOrganisation={hasOrganisation} />
        </View>
    );
}
