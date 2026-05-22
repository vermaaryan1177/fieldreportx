import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export type AppScreen =
    | "home"
    | "reports"
    | "templateLibrary"
    | "templateBuilder"
    | "reportSetup"
    | "reportEditor"
    | "mapsRoutes"
    | "reportPreview"
    | "score"
    | "reportDetail"
    | "reportComparison"
    | "settings"
    | "notification"
    | "organisation"
    | "sharedReports"
    | "sharedTemplates"
    | "permissions";

type NavItem = {
    id: AppScreen;
    label: string;
    icon: string;
    activeIcon: string;
};

const BASE_NAV_ITEMS: NavItem[] = [
    {
        id: "home",
        label: "Home",
        icon: "home-outline",
        activeIcon: "home",
    },
    {
        id: "reports",
        label: "Reports",
        icon: "document-text-outline",
        activeIcon: "document-text",
    },
    {
        id: "templateLibrary",
        label: "Templates",
        icon: "layers-outline",
        activeIcon: "layers",
    },
    {
        id: "settings",
        label: "Settings",
        icon: "settings-outline",
        activeIcon: "settings",
    },
];

interface BottomNavBarProps {
    active: AppScreen;
    onNavigate: (screen: AppScreen) => void;

    // NEW
    hasOrganisation?: boolean;
}

export default function BottomNavBar({
    active,
    onNavigate,
    hasOrganisation = false,
}: BottomNavBarProps) {
    const navItems: NavItem[] = hasOrganisation
        ? [
              ...BASE_NAV_ITEMS,
              {
                  id: "sharedReports",
                  label: "Shared",
                  icon: "people-outline",
                  activeIcon: "people",
              },
              {
                  id: "organisation",
                  label: "Org",
                  icon: "business-outline",
                  activeIcon: "business",
              },
          ]
        : BASE_NAV_ITEMS;

    return (
        <View className="flex-row bg-slate-900 border-t border-zinc-800 pb-8 pt-3 px-2">
            {navItems.map((item) => {
                const isActive = active === item.id;

                return (
                    <TouchableOpacity
                        key={item.id}
                        onPress={() => onNavigate(item.id)}
                        activeOpacity={0.7}
                        className="flex-1 items-center gap-1"
                    >
                        <Ionicons
                            name={
                                (isActive
                                    ? item.activeIcon
                                    : item.icon) as any
                            }
                            size={22}
                            color={isActive ? "#f2a72f" : "#52525b"}
                        />

                        <Text
                            className={`text-xs ${
                                isActive
                                    ? "text-primary font-semibold"
                                    : "text-zinc-600"
                            }`}
                        >
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}