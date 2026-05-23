import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { SYSTEM_TEMPLATES, SystemTemplate } from "@/lib/templates/systemTemplates";

interface Props {
    onSelect: (t: SystemTemplate) => void;
    onImport: () => void;
}

export default function TypePicker({ onSelect, onImport }: Props) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const selected = SYSTEM_TEMPLATES.find((t) => t.id === selectedId);

    const rows: SystemTemplate[][] = [];
    for (let i = 0; i < SYSTEM_TEMPLATES.length; i += 2) {
        rows.push(SYSTEM_TEMPLATES.slice(i, i + 2));
    }

    return (
        <View className="flex-1">
            <View className="px-5 pt-4 pb-5">
                <Text className="text-white text-xl font-bold">
                    Choose a base type
                </Text>
                <Text className="text-zinc-400 text-sm mt-1 leading-relaxed">
                    Pick the template type that best fits your report. You'll
                    customise the sections in the next step.
                </Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}
            >
                {rows.map((row, ri) => (
                    <View key={ri} className="flex-row gap-3 mb-3">
                        {row.map((template) => {
                            const isSelected = selectedId === template.id;
                            return (
                                <TouchableOpacity
                                    key={template.id}
                                    activeOpacity={0.75}
                                    onPress={() => setSelectedId(template.id)}
                                    style={{
                                        flex: 1,
                                        borderWidth: 2,
                                        borderColor: isSelected ? template.color : "transparent",
                                        borderRadius: 16,
                                    }}
                                    className="bg-slate-900 p-4"
                                >
                                    <View
                                        className="w-10 h-10 rounded-xl items-center justify-center mb-3"
                                        style={{ backgroundColor: template.color + "28" }}
                                    >
                                        <Ionicons name={template.icon as any} size={20} color={template.color} />
                                    </View>
                                    <Text className="text-white font-semibold text-sm">
                                        {template.name}
                                    </Text>
                                    <Text className="text-zinc-500 text-xs mt-1 leading-relaxed" numberOfLines={2}>
                                        {template.description}
                                    </Text>
                                    <View
                                        className="mt-2.5 self-start px-2 py-0.5 rounded-full"
                                        style={{ backgroundColor: template.color + "22" }}
                                    >
                                        <Text className="text-xs font-medium" style={{ color: template.color }}>
                                            {template.sections.length} sections
                                        </Text>
                                    </View>
                                    {isSelected && (
                                        <View
                                            className="absolute top-3 right-3 w-5 h-5 rounded-full items-center justify-center"
                                            style={{ backgroundColor: template.color }}
                                        >
                                            <Ionicons name="checkmark" size={12} color="#fff" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                        {row.length === 1 && <View style={{ flex: 1 }} />}
                    </View>
                ))}

                <View style={{ marginTop: 8, gap: 12 }}>
                    <TouchableOpacity
                        activeOpacity={0.85}
                        disabled={!selected}
                        onPress={() => selected && onSelect(selected)}
                        className={`rounded-2xl py-4 items-center ${selected ? "bg-primary" : "bg-slate-700"}`}
                    >
                        <Text className="text-white font-bold text-base">
                            {selected ? `Continue with ${selected.name}` : "Select a type to continue"}
                        </Text>
                    </TouchableOpacity>

                    <View className="flex-row items-center gap-3">
                        <View className="flex-1 h-px bg-zinc-800" />
                        <Text className="text-zinc-600 text-xs">or</Text>
                        <View className="flex-1 h-px bg-zinc-800" />
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={onImport}
                        className="border border-zinc-700 rounded-2xl py-3.5 items-center flex-row justify-center gap-2"
                    >
                        <Ionicons name="code-download-outline" size={16} color="#f2a72f" />
                        <Text className="text-primary font-semibold text-sm">Import from JSON / YAML</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
