// import AppHeader from "@/components/header";
import BottomNavBar, { AppScreen } from "@/components/BottomNavBar";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface Props {
    onNavigate: (screen: AppScreen) => void;
}

type NotificationItem = {
    id: string;
    title: string;
    description: string;
    time: string;
    unread?: boolean;
    icon: string;
};

const initialUnread: NotificationItem[] = [
    { id: "1", title: "Report reminder", description: "42 Maple Ave is still in draft", time: "2 minutes ago", unread: true, icon: "◎" },
    { id: "2", title: "New template available", description: "Police Report v1.0 is now available", time: "1 hour ago", unread: true, icon: "↓" },
    { id: "3", title: "Template update", description: "Driving Assessment updated to v1.1", time: "3 hours ago", unread: true, icon: "!" },
];

const initialEarlier: NotificationItem[] = [
    { id: "4", title: "Elec. compliance #441 completed", description: "", time: "Yesterday · 14:02", icon: "" },
    { id: "5", title: "Driver eval — Sam K. signed off", description: "", time: "2 days ago · 09:15", icon: "" },
    { id: "6", title: "System: FieldReportX updated to v2.1", description: "", time: "5 days ago", icon: "" },
];

const NotificationCard = ({ item, onPress }: { item: NotificationItem; onPress: (id: string) => void }) => (
    <TouchableOpacity
        activeOpacity={0.7}
        className={`mx-5 mb-3 flex-row items-center justify-between rounded-2xl border p-4 ${
            item.unread ? "border-zinc-600 bg-zinc-800" : "border-zinc-800 bg-zinc-900"
        }`}
        onPress={() => onPress(item.id)}
    >
        <View className="flex-1 flex-row items-start">
            {item.unread && <View className="mr-3 mt-1 h-2.5 w-2.5 rounded-full bg-amber-500" />}
            <View className={`mr-3 h-11 w-11 items-center justify-center rounded-xl ${item.unread ? "bg-amber-500/20" : "bg-zinc-700"}`}>
                <Text className="text-base font-bold text-white">{item.icon || "•"}</Text>
            </View>

            <View className="flex-1">
                <Text className="text-white text-[15px] font-semibold">{item.title}</Text>
                {item.description && <Text className="mt-1 text-[13px] text-zinc-400">{item.description}</Text>}
                <Text className="mt-1 text-[12px] text-zinc-500">{item.time}</Text>
            </View>
        </View>
        <Text className="ml-2 text-lg text-zinc-500">›</Text>
    </TouchableOpacity>
);

const NotificationsScreen = ({ onNavigate }: Props) => {
    const [unreadNotifications, setUnreadNotifications] = useState(initialUnread);
    const [earlierNotifications, setEarlierNotifications] = useState(initialEarlier);

    const handlePress = (id: string) => {
        const updatedUnread = unreadNotifications.filter((n) => n.id !== id);
        const readItem = unreadNotifications.find((n) => n.id === id);
        if (readItem) {
            setEarlierNotifications([{ ...readItem, unread: false }, ...earlierNotifications]);
            setUnreadNotifications(updatedUnread);
        }
        console.log("Clicked notification:", id);
    };

    // Clear all notifications
    const handleClearAll = () => {
        // setUnreadNotifications([]);
        setEarlierNotifications([]);
    };

    return (
        <View className="flex-1 pt-10 bg-slate-950">
            <View className="flex-row items-center justify-between border-b border-zinc-800 px-5 py-4">
                <Text className="text-2xl font-bold text-white">Notifications</Text>
                <TouchableOpacity onPress={handleClearAll}>
                    <Text className="text-sm font-medium text-amber-500">Clear all</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {unreadNotifications.length > 0 && (
                    <>
                        <Text className="mb-3 ml-5 mt-5 text-xs font-bold uppercase tracking-widest text-zinc-500">
                            Unread · {unreadNotifications.length}
                        </Text>
                        {unreadNotifications.map((item) => (
                            <NotificationCard key={item.id} item={item} onPress={handlePress} />
                        ))}
                    </>
                )}

                {earlierNotifications.length > 0 && (
                    <>
                        <Text className="mb-3 ml-5 mt-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Earlier</Text>
                        {earlierNotifications.map((item) => (
                            <NotificationCard key={item.id} item={item} onPress={handlePress} />
                        ))}
                    </>
                )}

                <View className="h-10" />
            </ScrollView>

            <BottomNavBar active="notification" onNavigate={onNavigate} />
        </View>
    );
};

export default NotificationsScreen;


