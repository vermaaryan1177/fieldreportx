import AppHeader from "@/components/Header";
import BottomNavBar, { AppScreen } from "@/components/BottomNavBar";
import { Ionicons } from "@expo/vector-icons";
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

type Tab = "Unread" | "Read";

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
            className={`mb-3 rounded-2xl border p-4 ${
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
                        <View className="mr-3 mt-1.5 h-2 w-2 rounded-full bg-amber-500" />
                    )}

                    <View
                        className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-zinc-700"
                        style={{ marginLeft: item?.unread ? 0 : 14 }}
                    >
                        <Ionicons
                            name={(item?.icon as any) ?? "notifications-outline"}
                            size={18}
                            color="#94a3b8"
                        />
                    </View>

                    <View className="flex-1">
                        <Text className="text-white font-semibold text-sm">{item?.title ?? "Notification"}</Text>
                        {item?.description ? (
                            <Text className="text-zinc-400 text-xs mt-0.5">{item.description}</Text>
                        ) : null}
                        {item?.time ? (
                            <Text className="text-zinc-600 text-xs mt-1">{item.time}</Text>
                        ) : null}
                    </View>
                </View>

                {!isInvite && (
                    <Ionicons name="chevron-forward" size={14} color="#52525b" />
                )}
            </TouchableOpacity>

            {isInvite && (
                <View className="flex-row gap-2 mt-3" style={{ marginLeft: 56 }}>
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
    const [activeTab, setActiveTab] = useState<Tab>("Unread");

    useEffect(() => {
        if (!userId) return;
        const unsub = NotificationDB.subscribe(userId, setNotifications);
        return () => unsub?.();
    }, [userId]);

    const unread = useMemo(() => notifications.filter((n) => n?.unread), [notifications]);
    const read = useMemo(() => notifications.filter((n) => !n?.unread), [notifications]);

    const visible = activeTab === "Unread" ? unread : read;

    const handlePress = async (item: NotificationItem) => {
        if (!item?.id || !item.unread) return;
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
        await NotificationDB.markAllAsRead(userId ?? "", unread);
    };

    return (
        <View className="flex-1 bg-background">
            <AppHeader onOpenSidebar={onOpenSidebar} onNavigate={onNavigate} active="notification" />

            {/* Title row */}
            <View className="flex-row items-center justify-between px-5 pt-5 pb-4">
                <Text className="text-2xl font-bold text-white">Notifications</Text>
                {activeTab === "Unread" && unread.length > 0 && (
                    <TouchableOpacity activeOpacity={0.7} onPress={markAllRead}>
                        <Text className="text-zinc-500 text-sm">Mark all read</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Tabs */}
            <View className="flex-row bg-slate-900 mx-5 rounded-2xl p-1 mb-4">
                {(["Unread", "Read"] as Tab[]).map((tab) => {
                    const count = tab === "Unread" ? unread.length : read.length;
                    const isActive = activeTab === tab;
                    return (
                        <TouchableOpacity
                            key={tab}
                            activeOpacity={0.7}
                            onPress={() => setActiveTab(tab)}
                            className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl ${isActive ? "bg-primary" : ""}`}
                        >
                            <Text className={`text-sm font-semibold ${isActive ? "text-white" : "text-zinc-500"}`}>
                                {tab}
                            </Text>
                            {count > 0 && (
                                <View
                                    className="rounded-full px-1.5 py-0.5"
                                    style={{ backgroundColor: isActive ? "rgba(255,255,255,0.25)" : "#3f3f46" }}
                                >
                                    <Text
                                        className="text-xs font-bold"
                                        style={{ color: isActive ? "#fff" : "#a1a1aa" }}
                                    >
                                        {count}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* List */}
            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {visible.length === 0 ? (
                    <View className="items-center mt-16 gap-3">
                        <Ionicons
                            name={activeTab === "Unread" ? "checkmark-circle-outline" : "notifications-off-outline"}
                            size={44}
                            color="#3f3f46"
                        />
                        <Text className="text-zinc-500 text-sm">
                            {activeTab === "Unread" ? "You're all caught up" : "No read notifications"}
                        </Text>
                    </View>
                ) : (
                    visible.map((item) => (
                        <NotificationCard
                            key={item?.id ?? Math.random().toString()}
                            item={item}
                            onPress={handlePress}
                            onAccept={item.inviteId && activeTab === "Unread" ? handleAcceptInvite : undefined}
                            onDecline={item.inviteId && activeTab === "Unread" ? handleDeclineInvite : undefined}
                        />
                    ))
                )}
            </ScrollView>

            <BottomNavBar active="notification" onNavigate={onNavigate} hasOrganisation={hasOrganisation} />
        </View>
    );
}
