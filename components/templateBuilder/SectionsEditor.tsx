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

import { createTemplate } from "@/lib/db/templates";
import { auth } from "@/lib/firebase";
import { store } from "@/lib/store";
import { SystemTemplate } from "@/lib/templates/systemTemplates";
import { TemplateField, TemplateSection } from "@/lib/types";
import SectionPickerModal from "./SectionPickerModal";

interface EditableSection {
    id: string;
    name: string;
    fields: TemplateField[];
}

interface Props {
    baseTemplate: SystemTemplate;
    onSaved: () => void;
}

export default function SectionsEditor({ baseTemplate, onSaved }: Props) {
    const [templateName, setTemplateName] = useState(`${baseTemplate.name} (Custom)`);
    const [gpsValidation, setGpsValidation] = useState(baseTemplate.gpsValidation);
    const [saving, setSaving] = useState(false);
    const [pickerVisible, setPickerVisible] = useState(false);
    const [sections, setSections] = useState<EditableSection[]>(() =>
        baseTemplate.sections.map((s) => ({ id: s.id, name: s.name, fields: s.fields })),
    );

    const addSection = () => {
        const id = `custom_${Date.now()}`;
        setSections((prev) => [
            ...prev,
            {
                id,
                name: "New section",
                fields: [
                    { id: `${id}_notes`, label: "Notes", type: "text", required: false },
                    { id: `${id}_photos`, label: "Photos", type: "photo", required: false },
                ] as TemplateField[],
            },
        ]);
    };

    const removeSection = (id: string) => {
        if (sections.length <= 1) {
            Alert.alert("Cannot remove", "A template must have at least one section.");
            return;
        }
        Alert.alert(
            "Remove section",
            `Remove "${sections.find((s) => s.id === id)?.name}"?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Remove", style: "destructive", onPress: () => setSections((prev) => prev.filter((s) => s.id !== id)) },
            ],
        );
    };

    const renameSection = (id: string, name: string) => {
        setSections((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
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

    const addBorrowedSections = (borrowed: TemplateSection[]) => {
        setSections((prev) => [
            ...prev,
            ...borrowed.map((s) => ({ id: s.id, name: s.name, fields: s.fields as TemplateField[] })),
        ]);
        setPickerVisible(false);
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
                sections: sections.map((s) => ({ id: s.id, name: s.name, fields: s.fields })),
                gpsValidation,
                organisationId: store.orgTemplateMode ? (store.currentOrgId ?? null) : null,
            });
            clearTimeout(timer);
            if (!timedOut) {
                Alert.alert(
                    "Template saved",
                    `"${name}" is now in your template library.`,
                    [{ text: "OK", onPress: onSaved }],
                );
            }
        } catch (e) {
            clearTimeout(timer);
            if (!timedOut) {
                const detail = e instanceof Error ? e.message : String(e);
                Alert.alert("Error saving template", detail);
            }
        } finally {
            if (!timedOut) setSaving(false);
        }
    };

    return (
        <View className="flex-1">
            <SectionPickerModal
                visible={pickerVisible}
                baseTemplateId={baseTemplate.id}
                onClose={() => setPickerVisible(false)}
                onAdd={addBorrowedSections}
            />
            <View className="flex-row items-center justify-between px-5 pt-4 pb-4">
                <View>
                    <Text className="text-white text-xl font-bold">Customise sections</Text>
                    <Text className="text-zinc-400 text-sm mt-0.5">
                        Based on{" "}
                        <Text style={{ color: baseTemplate.color }} className="font-semibold">
                            {baseTemplate.name}
                        </Text>
                    </Text>
                </View>
                <View
                    className="w-10 h-10 rounded-xl items-center justify-center"
                    style={{ backgroundColor: baseTemplate.color + "28" }}
                >
                    <Ionicons name={baseTemplate.icon as any} size={20} color={baseTemplate.color} />
                </View>
            </View>

            <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
            >
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

                <View className="bg-slate-900 rounded-2xl px-4 py-3.5 flex-row items-center gap-3 mb-5">
                    <View className="flex-1">
                        <Text className="text-white text-sm font-medium">GPS validation</Text>
                        <Text className="text-zinc-500 text-xs mt-0.5">Require GPS tags on photo fields</Text>
                    </View>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setGpsValidation((v) => !v)}
                        className={`w-12 h-6 rounded-full ${gpsValidation ? "bg-primary" : "bg-zinc-700"}`}
                    >
                        <View
                            style={{ left: gpsValidation ? 28 : 4 }}
                            className="w-4 h-4 rounded-full bg-white absolute top-1"
                        />
                    </TouchableOpacity>
                </View>

                <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">
                        Sections ({sections.length})
                    </Text>
                    <TouchableOpacity activeOpacity={0.7} onPress={addSection}>
                        <Text className="text-primary text-sm font-semibold">+ Add</Text>
                    </TouchableOpacity>
                </View>

                <View className="gap-2 mb-3">
                    {sections.map((section, index) => (
                        <View
                            key={section.id}
                            className="bg-slate-900 rounded-2xl px-3 py-2.5 flex-row items-center gap-2"
                        >
                            <View className="w-7 h-7 rounded-lg bg-zinc-800 items-center justify-center shrink-0">
                                <Text className="text-zinc-400 text-xs font-bold">
                                    {String(index + 1).padStart(2, "0")}
                                </Text>
                            </View>

                            <TextInput
                                className="flex-1 text-white text-sm py-1.5"
                                value={section.name}
                                onChangeText={(name) => renameSection(section.id, name)}
                                placeholderTextColor="#52525b"
                                placeholder="Section name"
                            />

                            <View className="bg-zinc-800 px-2 py-0.5 rounded-full shrink-0">
                                <Text className="text-zinc-500 text-xs">{section.fields.length}f</Text>
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.6}
                                onPress={() => moveSection(section.id, "up")}
                                disabled={index === 0}
                                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                            >
                                <Ionicons name="chevron-up" size={18} color={index === 0 ? "#3f3f46" : "#71717a"} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.6}
                                onPress={() => moveSection(section.id, "down")}
                                disabled={index === sections.length - 1}
                                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                            >
                                <Ionicons
                                    name="chevron-down"
                                    size={18}
                                    color={index === sections.length - 1 ? "#3f3f46" : "#71717a"}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => removeSection(section.id)}
                                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                            >
                                <Ionicons name="close-circle" size={20} color="#ef444460" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={addSection}
                    className="border border-dashed border-zinc-700 rounded-2xl py-3.5 items-center mb-3"
                >
                    <Text className="text-zinc-500 text-sm">+ Add section</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => setPickerVisible(true)}
                    className="border border-dashed border-zinc-700 rounded-2xl py-3.5 flex-row items-center justify-center gap-2 mb-6"
                >
                    <Ionicons name="layers-outline" size={15} color="#f2a72f" />
                    <Text className="text-primary text-sm font-semibold">Browse sections from other templates</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleSave}
                    disabled={saving}
                    className="bg-primary rounded-2xl py-4 items-center"
                >
                    {saving
                        ? <ActivityIndicator color="#fff" />
                        : <Text className="text-white font-bold text-base">Save to my library</Text>
                    }
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
