import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { AppScreen } from "@/components/BottomNavBar";

interface Props {
    onNavigate: (screen: AppScreen) => void;
}

const CATEGORIES = [
    "Rental",
    "Trades",
    "Legal",
    "Driving",
    "Rehab",
    "Other",
];

interface Section {
    id: string;
    name: string;
    fields: string;
}

const INITIAL_SECTIONS: Section[] = [
    { id: "1", name: "Property details", fields: "Text · Dropdown · Date" },
    { id: "2", name: "Exterior", fields: "Photos · GPS · Checklist" },
    { id: "3", name: "Lounge / dining", fields: "Checklist · Photos · Notes" },
];

export default function TemplateBuilderScreen({ onNavigate }: Props) {
    const [templateName, setTemplateName] = useState("Rental inspection");
    const [category, setCategory] = useState("Rental");
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [sections, setSections] = useState<Section[]>(INITIAL_SECTIONS);
    const [gpsValidation, setGpsValidation] = useState(true);

    const deleteSection = (id: string) => {
        setSections((prev) => prev.filter((s) => s.id !== id));
    };

    const addSection = () => {
        setSections((prev) => [
            ...prev,
            {
                id: Date.now().toString(),
                name: "New section",
                fields: "Text",
            },
        ]);
    };

    return (
        <View className="flex-1 bg-background">
            {/* Top Bar */}
            <View className="flex-row items-center justify-between px-5 pt-16 pb-4">
                <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => onNavigate("templateLibrary")}
                        className="w-9 h-9 items-center justify-center rounded-full bg-slate-800"
                    >
                        <Ionicons name="arrow-back" size={18} color="#ffffff" />
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-bold">
                        Template builder
                    </Text>
                </View>
                <TouchableOpacity activeOpacity={0.7}>
                    <Text className="text-primary font-semibold">Preview</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
            >
                {/* Template Name */}
                <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2">
                    Template Name
                </Text>
                <View className="bg-slate-900 rounded-2xl px-4 h-12 justify-center mb-5">
                    <TextInput
                        className="text-white text-sm"
                        value={templateName}
                        onChangeText={setTemplateName}
                        placeholderTextColor="#52525b"
                    />
                </View>

                {/* Category */}
                <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2">
                    Category
                </Text>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setShowCategoryPicker((v) => !v)}
                    className="bg-slate-900 rounded-2xl px-4 h-12 flex-row items-center justify-between mb-2"
                >
                    <Text className="text-white text-sm">{category}</Text>
                    <Ionicons
                        name={showCategoryPicker ? "chevron-up" : "chevron-down"}
                        size={16}
                        color="#52525b"
                    />
                </TouchableOpacity>
                {showCategoryPicker && (
                    <View className="bg-slate-900 rounded-2xl overflow-hidden mb-4 border border-zinc-800">
                        {CATEGORIES.map((cat, i) => (
                            <TouchableOpacity
                                key={cat}
                                activeOpacity={0.7}
                                onPress={() => {
                                    setCategory(cat);
                                    setShowCategoryPicker(false);
                                }}
                                className={`px-4 py-3 ${i < CATEGORIES.length - 1 ? "border-b border-zinc-800" : ""}`}
                            >
                                <Text
                                    className={`text-sm ${cat === category ? "text-primary font-semibold" : "text-white"}`}
                                >
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Sections Header */}
                <View className="flex-row items-center justify-between mb-3 mt-3">
                    <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">
                        Sections
                    </Text>
                    <TouchableOpacity activeOpacity={0.7} onPress={addSection}>
                        <Text className="text-primary text-sm font-semibold">
                            + Add section
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Sections List */}
                <View className="gap-2 mb-3">
                    {sections.map((section, index) => (
                        <View
                            key={section.id}
                            className="bg-slate-900 rounded-2xl px-4 py-3 flex-row items-center"
                        >
                            {/* Drag handle */}
                            <Ionicons
                                name="reorder-three-outline"
                                size={20}
                                color="#3f3f46"
                            />

                            {/* Number badge */}
                            <View className="w-7 h-7 rounded-lg bg-zinc-800 items-center justify-center mx-2.5">
                                <Text className="text-zinc-400 text-xs font-bold">
                                    {String(index + 1).padStart(2, "0")}
                                </Text>
                            </View>

                            {/* Content */}
                            <View className="flex-1">
                                <Text className="text-white font-semibold text-sm">
                                    {section.name}
                                </Text>
                                <Text className="text-zinc-500 text-xs mt-0.5">
                                    {section.fields}
                                </Text>
                            </View>

                            {/* Edit */}
                            <TouchableOpacity activeOpacity={0.7} className="mr-3">
                                <Text className="text-primary text-sm font-semibold">
                                    Edit
                                </Text>
                            </TouchableOpacity>

                            {/* Delete */}
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => deleteSection(section.id)}
                            >
                                <Ionicons
                                    name="close-circle"
                                    size={20}
                                    color="#ef4444"
                                />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Add New Section */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={addSection}
                    className="bg-slate-900 rounded-2xl py-4 items-center mb-6 border border-zinc-700"
                >
                    <Text className="text-zinc-500 text-sm">
                        + Add new section
                    </Text>
                </TouchableOpacity>

                {/* Validation Rules */}
                <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-3">
                    Validation Rules
                </Text>
                <View className="bg-slate-900 rounded-2xl px-4 py-3.5 flex-row items-center justify-between mb-6">
                    <Text className="text-white text-sm flex-1 mr-4">
                        Require GPS on all photo fields
                    </Text>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setGpsValidation((v) => !v)}
                        className={`w-12 h-6 rounded-full ${gpsValidation ? "bg-primary" : "bg-zinc-700"}`}
                    >
                        <View
                            className={`w-4 h-4 rounded-full bg-white absolute top-1 ${gpsValidation ? "right-1" : "left-1"}`}
                        />
                    </TouchableOpacity>
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-3">
                    <TouchableOpacity
                        activeOpacity={0.7}
                        className="flex-1 bg-slate-900 border border-zinc-700 rounded-2xl py-4 items-center"
                    >
                        <Text className="text-white font-semibold text-sm">
                            Export YAML
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        className="flex-1 bg-primary rounded-2xl py-4 items-center"
                    >
                        <Text className="text-white font-bold text-sm">
                            Save template
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
