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
import { store } from "@/lib/store";
import {
    CATEGORIES,
    SYSTEM_TEMPLATES,
    SystemTemplate,
} from "@/lib/templates/systemTemplates";

interface Props {
    onNavigate: (screen: AppScreen) => void;
}

export default function TemplateLibraryScreen({ onNavigate }: Props) {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<string>("All");

    const filtered = SYSTEM_TEMPLATES.filter((t) => {
        const matchesSearch =
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory =
            activeCategory === "All" || t.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const handleSelect = (template: SystemTemplate) => {
        store.setSelectedTemplate(template.id);
        onNavigate("reportSetup");
    };

    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <View className="px-5 pt-16 pb-4">
                <Text className="text-white text-2xl font-bold">Templates</Text>
                <Text className="text-zinc-400 text-sm mt-0.5">
                    {SYSTEM_TEMPLATES.length} available
                </Text>
            </View>

            {/* Search */}
            <View className="mx-5 mb-4">
                <View className="flex-row items-center bg-slate-900 rounded-2xl px-4 h-11 gap-2">
                    <Ionicons name="search-outline" size={18} color="#52525b" />
                    <TextInput
                        className="flex-1 text-white text-sm"
                        placeholder="Search templates…"
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

            {/* Category Pills */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 14 }}
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

            {/* Template Cards */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
            >
                {filtered.length === 0 ? (
                    <View className="items-center py-16">
                        <Ionicons name="search-outline" size={40} color="#52525b" />
                        <Text className="text-zinc-500 text-sm mt-3">
                            No templates match "{search}"
                        </Text>
                    </View>
                ) : (
                    <View className="gap-3">
                        {filtered.map((template) => (
                            <TouchableOpacity
                                key={template.id}
                                activeOpacity={0.75}
                                onPress={() => handleSelect(template)}
                                className="bg-slate-900 rounded-2xl p-4"
                            >
                                {/* Top row */}
                                <View className="flex-row items-center mb-3">
                                    <View
                                        className="w-11 h-11 rounded-xl items-center justify-center mr-3"
                                        style={{ backgroundColor: template.color + "28" }}
                                    >
                                        <Ionicons
                                            name={template.icon as any}
                                            size={22}
                                            color={template.color}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white font-semibold text-sm">
                                            {template.name}
                                        </Text>
                                        <View className="flex-row items-center gap-2 mt-0.5">
                                            <View
                                                className="px-2 py-0.5 rounded-full"
                                                style={{ backgroundColor: template.color + "28" }}
                                            >
                                                <Text
                                                    className="text-xs font-medium"
                                                    style={{ color: template.color }}
                                                >
                                                    {template.category}
                                                </Text>
                                            </View>
                                            <Text className="text-zinc-600 text-xs">
                                                {template.sections.length} sections
                                            </Text>
                                            {template.gpsValidation && (
                                                <View className="flex-row items-center gap-1">
                                                    <Ionicons
                                                        name="location"
                                                        size={10}
                                                        color="#52525b"
                                                    />
                                                    <Text className="text-zinc-600 text-xs">
                                                        GPS
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                    <Ionicons
                                        name="chevron-forward"
                                        size={16}
                                        color="#3f3f46"
                                    />
                                </View>

                                {/* Description */}
                                <Text className="text-zinc-400 text-xs leading-relaxed mb-3">
                                    {template.description}
                                </Text>

                                {/* Feature tags */}
                                <View className="flex-row flex-wrap gap-1.5">
                                    {template.features.map((feat) => (
                                        <View
                                            key={feat}
                                            className="bg-slate-800 px-2.5 py-1 rounded-full"
                                        >
                                            <Text className="text-zinc-400 text-xs">
                                                {feat}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>

            <BottomNavBar active="templateLibrary" onNavigate={onNavigate} />
        </View>
    );
}
