import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import BottomNavBar, { AppScreen } from "@/components/BottomNavBar";

interface Props {
    onNavigate: (screen: AppScreen) => void;
}

const CATEGORIES = ["All", "Rental", "Trades", "Legal", "Driving", "Rehab"];

type BadgeType = "update" | "version";

const TEMPLATES: {
    id: string;
    name: string;
    category: string;
    sections: number;
    version: string;
    badge: string;
    badgeType: BadgeType;
    color: string;
}[] = [
    {
        id: "1",
        name: "Rental inspection",
        category: "Rental",
        sections: 8,
        version: "v2.1",
        badge: "Updated",
        badgeType: "update",
        color: "#8b5cf6",
    },
    {
        id: "2",
        name: "Trades — electrician",
        category: "Trades",
        sections: 6,
        version: "v1.2",
        badge: "v1.2",
        badgeType: "version",
        color: "#22c55e",
    },
    {
        id: "3",
        name: "Forensics report",
        category: "Legal",
        sections: 9,
        version: "v2.0",
        badge: "v2.0",
        badgeType: "version",
        color: "#ec4899",
    },
    {
        id: "4",
        name: "Driving assessment",
        category: "Driving",
        sections: 5,
        version: "v1.0",
        badge: "Update",
        badgeType: "update",
        color: "#f59e0b",
    },
    {
        id: "5",
        name: "Patient rehab",
        category: "Rehab",
        sections: 7,
        version: "v1.0",
        badge: "v1.0",
        badgeType: "version",
        color: "#3b82f6",
    },
];

export default function TemplateLibraryScreen({ onNavigate }: Props) {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    const filtered = TEMPLATES.filter((t) => {
        const matchesSearch = t.name
            .toLowerCase()
            .includes(search.toLowerCase());
        const matchesCategory =
            activeCategory === "All" || t.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-16 pb-5">
                <View>
                    <Text className="text-white text-2xl font-bold">
                        Templates
                    </Text>
                    <Text className="text-zinc-400 text-sm mt-0.5">
                        7 available · 2 updates
                    </Text>
                </View>
                <TouchableOpacity
                    activeOpacity={0.7}
                    className="w-9 h-9 items-center justify-center rounded-full bg-slate-800"
                >
                    <Ionicons
                        name="ellipsis-horizontal"
                        size={20}
                        color="#f2a72f"
                    />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="mx-5 mb-4">
                <View className="flex-row items-center bg-slate-900 rounded-2xl px-4 h-11 gap-2">
                    <Ionicons name="search-outline" size={18} color="#52525b" />
                    <TextInput
                        className="flex-1 text-white text-sm"
                        placeholder="Search templates..."
                        placeholderTextColor="#52525b"
                        value={search}
                        onChangeText={setSearch}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity
                            onPress={() => setSearch("")}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name="close-circle"
                                size={18}
                                color="#52525b"
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Category Filter Pills */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
            >
                <View className="flex-row gap-2">
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            activeOpacity={0.7}
                            onPress={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-full border ${
                                activeCategory === cat
                                    ? "bg-primary border-primary"
                                    : "bg-slate-900 border-zinc-700"
                            }`}
                        >
                            <Text
                                className={`text-sm font-medium ${
                                    activeCategory === cat
                                        ? "text-white"
                                        : "text-zinc-400"
                                }`}
                            >
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Template List */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
            >
                <View className="gap-3">
                    {filtered.length === 0 ? (
                        <View className="items-center py-12">
                            <Ionicons
                                name="search-outline"
                                size={40}
                                color="#52525b"
                            />
                            <Text className="text-zinc-500 text-sm mt-3">
                                No templates found
                            </Text>
                        </View>
                    ) : (
                        filtered.map((template) => (
                            <TouchableOpacity
                                key={template.id}
                                activeOpacity={0.7}
                                onPress={() => onNavigate("templateBuilder")}
                                className="flex-row items-center bg-slate-900 rounded-2xl px-4 py-3"
                            >
                                {/* Icon */}
                                <View
                                    className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                                    style={{
                                        backgroundColor: template.color + "33",
                                    }}
                                >
                                    <Ionicons
                                        name="document-text"
                                        size={18}
                                        color={template.color}
                                    />
                                </View>

                                {/* Info */}
                                <View className="flex-1">
                                    <Text className="text-white font-semibold text-sm">
                                        {template.name}
                                    </Text>
                                    <Text className="text-zinc-500 text-xs mt-0.5">
                                        {template.category} ·{" "}
                                        {template.sections} sections ·{" "}
                                        {template.version}
                                    </Text>
                                </View>

                                {/* Badge */}
                                <View
                                    className="px-2.5 py-1 rounded-full ml-2"
                                    style={{
                                        backgroundColor:
                                            template.badgeType === "update"
                                                ? "#f2a72f25"
                                                : "#ffffff10",
                                    }}
                                >
                                    <Text
                                        className="text-xs font-semibold"
                                        style={{
                                            color:
                                                template.badgeType === "update"
                                                    ? "#f2a72f"
                                                    : "#71717a",
                                        }}
                                    >
                                        {template.badge}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>

            <BottomNavBar active="templateLibrary" onNavigate={onNavigate} />
        </View>
    );
}
