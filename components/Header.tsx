// import { Ionicons } from "@expo/vector-icons";
// import React from "react";
// import { Text, TouchableOpacity, View } from "react-native";
// import BottomNavBar, { AppScreen } from "./BottomNavBar";

// interface HeaderProps {
//     onOpenSidebar: () => void;
//     onNavigate: (screen: AppScreen) => void;
//     profileInitials?: string;
// }

// export default function AppHeader({
//     onOpenSidebar,
//     onNavigate,
//     profileInitials = "AK",
// }: HeaderProps) {
//     return (
//         <View className="flex-row items-center justify-between px-5 pt-16 pb-5 bg-background">
//             {/* Left: Sidebar */}
//             <TouchableOpacity
//                 activeOpacity={0.7}
//                 onPress={onOpenSidebar}
//                 className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center"
//             >
//                 <Ionicons name="menu" size={22} color="#ffffff" />
//             </TouchableOpacity>

//             {/* Right: Notifications + Profile */}
//             <View className="flex-row items-center gap-3">
//                 <TouchableOpacity
//                     activeOpacity={0.7}
//                     className="w-9 h-9 items-center justify-center rounded-full bg-slate-800"
//                     onPress={() => onNavigate("notification")} // navigate to notifications
//                 >
//                     <Ionicons name="notifications-outline" size={20} color="#f2a72f" />
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                     activeOpacity={0.8}
//                     onPress={() => onNavigate("settings")} // navigate to settings
//                     className="w-10 h-10 rounded-full bg-primary items-center justify-center"
//                 >
//                     <Text className="text-white font-bold text-sm">{profileInitials}</Text>
//                 </TouchableOpacity>
//             </View>
//         </View>
//     );
// }


import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { AppScreen } from "@/components/BottomNavBar";

interface HeaderProps {
    onOpenSidebar: () => void;
    onNavigate: (screen: AppScreen) => void;
    profileInitials?: string;
}

export default function AppHeader({
    onOpenSidebar,
    onNavigate,
    profileInitials = "AK",
}: HeaderProps) {
    return (
        <View className="flex-row items-center justify-between px-5 pt-12 pb-5 bg-slate-900">
            {/* Left: Sidebar */}
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={onOpenSidebar}
                className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center"
            >
                <Ionicons name="menu" size={22} color="#ffffff" />
            </TouchableOpacity>

            {/* Right: Notifications + Profile */}
            <View className="flex-row items-center gap-3">
                <TouchableOpacity
                    activeOpacity={0.7}
                    className="w-9 h-9 items-center justify-center rounded-full bg-slate-800"
                    onPress={() => onNavigate("notification")}
                >
                    <Ionicons
                        name="notifications-outline"
                        size={20}
                        color="#f2a72f"
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => onNavigate("settings")}
                    className="w-10 h-10 rounded-full bg-primary items-center justify-center"
                >
                    <Text className="text-white font-bold text-sm">
                        {profileInitials}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}