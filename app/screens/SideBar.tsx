import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export type AppScreen =
    | "home"
    | "reports"
    | "templateLibrary"
    | "templateBuilder"
    | "reportSetup"
    | "reportEditor"
    | "mediaHandler"
    | "mapsRoutes"
    | "reportPreview"
    | "score"
    | "signature"
    | "reportComparison"
    | "settings"
    | "notifications"
    | "organisation";

type SidebarItem = {
    id: AppScreen;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
};

const MAIN_ITEMS: SidebarItem[] = [
    {
        id: "home",
        label: "Home",
        icon: "home-outline",
    },
    {
        id: "reports",
        label: "My Reports",
        icon: "document-text-outline",
    },
    {
        id: "templateLibrary",
        label: "Templates",
        icon: "layers-outline",
    },
];

const OTHER_ITEMS: SidebarItem[] = [
    {
        id: "settings",
        label: "Settings",
        icon: "settings-outline",
    },
];

interface SidebarProps {
    active: AppScreen;
    onNavigate: (screen: AppScreen) => void;
    onSignOut: () => void;
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

export default function Sidebar({
    active,
    onNavigate,
    onSignOut,
}: SidebarProps) {
    return (
        <View className="flex-1 w-80 bg-slate-900 border-r border-zinc-800">
            {/* Top User */}
            <View className="flex-row items-center border-b border-zinc-800 p-5">
                <View className="h-14 w-14 rounded-full bg-primary items-center justify-center">
                    <Text className="text-black font-bold text-lg">AK</Text>
                </View>

                <View className="ml-3">
                    <Text className="text-white font-semibold text-base">
                        Alex King
                    </Text>

                    <Text className="text-zinc-500 text-sm">
                        Senior Inspector
                    </Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-4 pt-4">
                {/* Main Navigation */}
                {MAIN_ITEMS.map((item) => (
                    <SidebarButton
                        key={item.id}
                        item={item}
                        active={active}
                        onNavigate={onNavigate}
                    />
                ))}

                {/* Notifications */}
                {/* <TouchableOpacity
          activeOpacity={0.7}
          className="mb-3 flex-row items-center justify-between rounded-xl px-3 py-4"
        > */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    className="mb-3 flex-row items-center justify-between rounded-xl px-3 py-4"
                    onPress={() => onNavigate("notifications")}
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

                    <View className="h-6 w-6 rounded-full bg-red-500 items-center justify-center">
                        <Text className="text-white text-xs font-bold">3</Text>
                    </View>
                </TouchableOpacity>

                {/* Divider */}
                <View className="h-[1px] bg-zinc-800 my-2" />

                {/* Other Items */}
                {OTHER_ITEMS.map((item) => (
                    <SidebarButton
                        key={item.id}
                        item={item}
                        active={active}
                        onNavigate={onNavigate}
                    />
                ))}

                {/* Organisation */}
                {/* <TouchableOpacity
          activeOpacity={0.7}
          className="mb-4 flex-row items-center rounded-xl px-3 py-4"
        > */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    className="mb-4 flex-row items-center rounded-xl px-3 py-4"
                    onPress={() => onNavigate("organisation")}
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

                {/* Divider */}
                <View className="h-[1px] bg-zinc-800 mb-4" />

                {/* Current Org */}
                <Text className="text-zinc-500 text-xs font-bold uppercase mb-3 px-1">
                    Current Org
                </Text>

                <TouchableOpacity
                    activeOpacity={0.7}
                    className="border border-zinc-800 rounded-xl px-4 py-4 flex-row items-center justify-between"
                >
                    <View className="flex-row items-center">
                        <Ionicons name="business" size={18} color="#f2a72f" />

                        <Text className="text-white ml-2">
                            Field Inspectors Co
                        </Text>
                    </View>

                    <Ionicons
                        name="chevron-forward"
                        size={18}
                        color="#71717a"
                    />
                </TouchableOpacity>
            </ScrollView>

            {/* Footer */}
            <View className="border-t border-zinc-800 p-4">
                <Text className="text-white font-semibold">FieldReportX</Text>

                <Text className="text-zinc-500 text-sm mt-1">
                    Version 2.1.0 · Build 441
                </Text>

                <TouchableOpacity
                    activeOpacity={0.7}
                    className="mt-3 flex-row items-center"
                    onPress={onSignOut}
                >
                    <Ionicons
                        name="log-out-outline"
                        size={18}
                        color="#ef4444"
                    />

                    <Text className="text-red-500 font-medium ml-2">
                        Sign out
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
