import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { AppScreen } from "@/components/BottomNavBar";
import { createTemplate } from "@/lib/db/templates";
import { auth } from "@/lib/firebase";
import {
    SYSTEM_TEMPLATES,
    SystemTemplate,
} from "@/lib/templates/systemTemplates";
import { TemplateField } from "@/lib/types";

interface Props {
    onNavigate: (screen: AppScreen) => void;
}

interface EditableSection {
    id: string;
    name: string;
    fields: TemplateField[];
}

// ─── Step 1 — type picker ─────────────────────────────────────────────────────

function TypePicker({ onSelect }: { onSelect: (t: SystemTemplate) => void }) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const selected = SYSTEM_TEMPLATES.find((t) => t.id === selectedId);

    // Split into rows of 2 for the grid
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
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
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
                                        borderColor: isSelected
                                            ? template.color
                                            : "transparent",
                                        borderRadius: 16,
                                    }}
                                    className="bg-slate-900 p-4"
                                >
                                    <View
                                        className="w-10 h-10 rounded-xl items-center justify-center mb-3"
                                        style={{
                                            backgroundColor:
                                                template.color + "28",
                                        }}
                                    >
                                        <Ionicons
                                            name={template.icon as any}
                                            size={20}
                                            color={template.color}
                                        />
                                    </View>
                                    <Text className="text-white font-semibold text-sm">
                                        {template.name}
                                    </Text>
                                    <Text
                                        className="text-zinc-500 text-xs mt-1 leading-relaxed"
                                        numberOfLines={2}
                                    >
                                        {template.description}
                                    </Text>
                                    <View
                                        className="mt-2.5 self-start px-2 py-0.5 rounded-full"
                                        style={{
                                            backgroundColor:
                                                template.color + "22",
                                        }}
                                    >
                                        <Text
                                            className="text-xs font-medium"
                                            style={{ color: template.color }}
                                        >
                                            {template.sections.length} sections
                                        </Text>
                                    </View>
                                    {isSelected && (
                                        <View
                                            className="absolute top-3 right-3 w-5 h-5 rounded-full items-center justify-center"
                                            style={{
                                                backgroundColor: template.color,
                                            }}
                                        >
                                            <Ionicons
                                                name="checkmark"
                                                size={12}
                                                color="#fff"
                                            />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                        {/* Filler if odd row */}
                        {row.length === 1 && <View style={{ flex: 1 }} />}
                    </View>
                ))}
            </ScrollView>

            <View className="px-5 pb-12 pt-3">
                <TouchableOpacity
                    activeOpacity={0.85}
                    disabled={!selected}
                    onPress={() => selected && onSelect(selected)}
                    className={`rounded-2xl py-4 items-center ${
                        selected ? "bg-primary" : "bg-slate-700"
                    }`}
                >
                    <Text className="text-white font-bold text-base">
                        {selected
                            ? `Continue with ${selected.name}`
                            : "Select a type to continue"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─── Step 2 — sections editor ─────────────────────────────────────────────────

function SectionsEditor({
    baseTemplate,
    onSaved,
}: {
    baseTemplate: SystemTemplate;
    onSaved: () => void;
}) {
    const [templateName, setTemplateName] = useState(
        `${baseTemplate.name} (Custom)`,
    );
    const [gpsValidation, setGpsValidation] = useState(
        baseTemplate.gpsValidation,
    );
    const [saving, setSaving] = useState(false);
    const [sections, setSections] = useState<EditableSection[]>(() =>
        baseTemplate.sections.map((s) => ({
            id: s.id,
            name: s.name,
            fields: s.fields,
        })),
    );

    const addSection = () => {
        const id = `custom_${Date.now()}`;
        setSections((prev) => [
            ...prev,
            {
                id,
                name: "New section",
                fields: [
                    {
                        id: `${id}_notes`,
                        label: "Notes",
                        type: "text",
                        required: false,
                    },
                    {
                        id: `${id}_photos`,
                        label: "Photos",
                        type: "photo",
                        required: false,
                    },
                ] as TemplateField[],
            },
        ]);
    };

    const removeSection = (id: string) => {
        if (sections.length <= 1) {
            Alert.alert(
                "Cannot remove",
                "A template must have at least one section.",
            );
            return;
        }
        Alert.alert(
            "Remove section",
            `Remove "${sections.find((s) => s.id === id)?.name}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: () =>
                        setSections((prev) => prev.filter((s) => s.id !== id)),
                },
            ],
        );
    };

    const renameSection = (id: string, name: string) => {
        setSections((prev) =>
            prev.map((s) => (s.id === id ? { ...s, name } : s)),
        );
    };

    const moveSection = (id: string, dir: "up" | "down") => {
        setSections((prev) => {
            const idx = prev.findIndex((s) => s.id === id);
            if (dir === "up" && idx === 0) return prev;
            if (dir === "down" && idx === prev.length - 1) return prev;
            const arr = [...prev];
            const swap = dir === "up" ? idx - 1 : idx + 1;
            [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
            return arr;
        });
    };

    const handleSave = async () => {
        const name = templateName.trim();
        if (!name) {
            Alert.alert("Name required", "Please give your template a name.");
            return;
        }
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        setSaving(true);
        let timedOut = false;

        const timer = setTimeout(() => {
            timedOut = true;
            setSaving(false);
            Alert.alert(
                "Connection timeout",
                "Could not reach the database. Make sure Firestore is enabled in your Firebase Console and your internet connection is working.",
            );
        }, 10000);

        try {
            await createTemplate(uid, {
                name,
                category: baseTemplate.category,
                sections: sections.map((s) => ({
                    id: s.id,
                    name: s.name,
                    fields: s.fields,
                })),
                gpsValidation,
                organisationId: null,
            });
            clearTimeout(timer);
            if (!timedOut) {
                Alert.alert(
                    "Template saved",
                    `"${name}" is now in your template library.`,
                    [{ text: "OK", onPress: onSaved }],
                );
            }
        } catch {
            clearTimeout(timer);
            if (!timedOut) {
                Alert.alert(
                    "Error",
                    "Failed to save template. Please try again.",
                );
            }
        } finally {
            if (!timedOut) setSaving(false);
        }
    };

    return (
        <View className="flex-1">
            {/* Sub-header */}
            <View className="flex-row items-center justify-between px-5 pt-4 pb-4">
                <View>
                    <Text className="text-white text-xl font-bold">
                        Customise sections
                    </Text>
                    <Text className="text-zinc-400 text-sm mt-0.5">
                        Based on{" "}
                        <Text
                            style={{ color: baseTemplate.color }}
                            className="font-semibold"
                        >
                            {baseTemplate.name}
                        </Text>
                    </Text>
                </View>
                <View
                    className="w-10 h-10 rounded-xl items-center justify-center"
                    style={{ backgroundColor: baseTemplate.color + "28" }}
                >
                    <Ionicons
                        name={baseTemplate.icon as any}
                        size={20}
                        color={baseTemplate.color}
                    />
                </View>
            </View>

            <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
            >
                {/* Template name */}
                <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2">
                    Template name
                </Text>
                <View className="bg-slate-900 rounded-2xl px-4 h-12 justify-center mb-5">
                    <TextInput
                        className="text-white text-sm"
                        value={templateName}
                        onChangeText={setTemplateName}
                        placeholderTextColor="#52525b"
                        placeholder="Give your template a name"
                    />
                </View>

                {/* GPS toggle */}
                <View className="bg-slate-900 rounded-2xl px-4 py-3.5 flex-row items-center gap-3 mb-5">
                    <View className="flex-1">
                        <Text className="text-white text-sm font-medium">
                            GPS validation
                        </Text>
                        <Text className="text-zinc-500 text-xs mt-0.5">
                            Require GPS tags on photo fields
                        </Text>
                    </View>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setGpsValidation((v) => !v)}
                        className={`w-12 h-6 rounded-full ${
                            gpsValidation ? "bg-primary" : "bg-zinc-700"
                        }`}
                    >
                        <View
                            style={{ left: gpsValidation ? 28 : 4 }}
                            className="w-4 h-4 rounded-full bg-white absolute top-1"
                        />
                    </TouchableOpacity>
                </View>

                {/* Sections header */}
                <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">
                        Sections ({sections.length})
                    </Text>
                    <TouchableOpacity activeOpacity={0.7} onPress={addSection}>
                        <Text className="text-primary text-sm font-semibold">
                            + Add
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Sections list */}
                <View className="gap-2 mb-3">
                    {sections.map((section, index) => (
                        <View
                            key={section.id}
                            className="bg-slate-900 rounded-2xl px-3 py-2.5 flex-row items-center gap-2"
                        >
                            {/* Number badge */}
                            <View className="w-7 h-7 rounded-lg bg-zinc-800 items-center justify-center shrink-0">
                                <Text className="text-zinc-400 text-xs font-bold">
                                    {String(index + 1).padStart(2, "0")}
                                </Text>
                            </View>

                            {/* Editable name */}
                            <TextInput
                                className="flex-1 text-white text-sm py-1.5"
                                value={section.name}
                                onChangeText={(name) =>
                                    renameSection(section.id, name)
                                }
                                placeholderTextColor="#52525b"
                                placeholder="Section name"
                            />

                            {/* Field count */}
                            <View className="bg-zinc-800 px-2 py-0.5 rounded-full shrink-0">
                                <Text className="text-zinc-500 text-xs">
                                    {section.fields.length}f
                                </Text>
                            </View>

                            {/* Move up */}
                            <TouchableOpacity
                                activeOpacity={0.6}
                                onPress={() =>
                                    moveSection(section.id, "up")
                                }
                                disabled={index === 0}
                                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                            >
                                <Ionicons
                                    name="chevron-up"
                                    size={18}
                                    color={index === 0 ? "#3f3f46" : "#71717a"}
                                />
                            </TouchableOpacity>

                            {/* Move down */}
                            <TouchableOpacity
                                activeOpacity={0.6}
                                onPress={() =>
                                    moveSection(section.id, "down")
                                }
                                disabled={index === sections.length - 1}
                                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                            >
                                <Ionicons
                                    name="chevron-down"
                                    size={18}
                                    color={
                                        index === sections.length - 1
                                            ? "#3f3f46"
                                            : "#71717a"
                                    }
                                />
                            </TouchableOpacity>

                            {/* Delete */}
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => removeSection(section.id)}
                                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                            >
                                <Ionicons
                                    name="close-circle"
                                    size={20}
                                    color="#ef444460"
                                />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Add section */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={addSection}
                    className="border border-dashed border-zinc-700 rounded-2xl py-3.5 items-center mb-6"
                >
                    <Text className="text-zinc-500 text-sm">+ Add section</Text>
                </TouchableOpacity>

                {/* Save */}
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleSave}
                    disabled={saving}
                    className="bg-primary rounded-2xl py-4 items-center"
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white font-bold text-base">
                            Save to my library
                        </Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function TemplateBuilderScreen({ onNavigate }: Props) {
    const [step, setStep] = useState<1 | 2>(1);
    const [baseTemplate, setBaseTemplate] = useState<SystemTemplate | null>(
        null,
    );

    const handleBack = () => {
        if (step === 2) setStep(1);
        else onNavigate("templateLibrary");
    };

    return (
        <View className="flex-1 bg-background">
            {/* Top bar */}
            <View className="flex-row items-center gap-3 px-5 pt-16 pb-2">
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleBack}
                    className="w-9 h-9 items-center justify-center rounded-full bg-slate-800"
                >
                    <Ionicons name="arrow-back" size={18} color="#ffffff" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-white text-lg font-bold">
                        Template builder
                    </Text>
                    <Text className="text-zinc-500 text-xs">
                        Step {step} of 2 —{" "}
                        {step === 1
                            ? "Choose type"
                            : "Customise sections"}
                    </Text>
                </View>
                {/* Progress dots */}
                <View className="flex-row gap-1.5 items-center">
                    {([1, 2] as const).map((s) => (
                        <View
                            key={s}
                            className="h-2 rounded-full"
                            style={{
                                width: step === s ? 18 : 8,
                                backgroundColor:
                                    step === s ? "#f2a72f" : "#3f3f46",
                            }}
                        />
                    ))}
                </View>
            </View>

            {step === 1 ? (
                <TypePicker
                    onSelect={(t) => {
                        setBaseTemplate(t);
                        setStep(2);
                    }}
                />
            ) : (
                baseTemplate && (
                    <SectionsEditor
                        baseTemplate={baseTemplate}
                        onSaved={() => onNavigate("templateLibrary")}
                    />
                )
            )}
        </View>
    );
}
