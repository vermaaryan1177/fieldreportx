import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { AppScreen } from "@/components/BottomNavBar";
import { createTemplate } from "@/lib/db/templates";
import { auth } from "@/lib/firebase";
import { parseImportText, ParsedImport } from "@/lib/importTemplate";
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

// ─── Import modal ─────────────────────────────────────────────────────────────

const SCHEMA_HINT = `name: My Template
category: inspection
gpsValidation: false
sections:
  - name: Site Details
    fields:
      - label: Site Name
        type: text
        required: true
      - label: Photos
        type: photo
  - name: Findings
    fields:
      - label: Observations
        type: text
      - label: Severity
        type: select
        options: [Low, Medium, High]`;

function ImportModal({
    visible,
    onClose,
    onSaved,
}: {
    visible: boolean;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [text, setText] = useState("");
    const [preview, setPreview] = useState<ParsedImport | null>(null);
    const [parseError, setParseError] = useState<string | null>(null);
    const [templateName, setTemplateName] = useState("");
    const [saving, setSaving] = useState(false);
    const [picking, setPicking] = useState(false);

    const reset = () => {
        setText("");
        setPreview(null);
        setParseError(null);
        setTemplateName("");
    };

    const handleClose = () => { reset(); onClose(); };

    const pickFile = async () => {
        setPicking(true);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/json", "text/yaml", "text/plain", "*/*"],
                copyToCacheDirectory: true,
            });
            if (result.canceled) return;
            const uri = result.assets[0].uri;
            const contents = await FileSystem.readAsStringAsync(uri);
            setText(contents);
            setPreview(null);
            setParseError(null);
        } catch (e: any) {
            Alert.alert("Could not read file", e?.message ?? "Unknown error");
        } finally {
            setPicking(false);
        }
    };

    const handleParse = () => {
        setParseError(null);
        setPreview(null);
        try {
            const result = parseImportText(text);
            setPreview(result);
            setTemplateName(result.name);
        } catch (e: any) {
            setParseError(e?.message ?? "Parse failed.");
        }
    };

    const handleSave = async () => {
        if (!preview) return;
        const name = templateName.trim();
        if (!name) {
            Alert.alert("Name required", "Please enter a template name.");
            return;
        }
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        setSaving(true);
        try {
            await createTemplate(uid, {
                name,
                category: preview.category,
                sections: preview.sections,
                gpsValidation: preview.gpsValidation,
                organisationId: null,
            });
            Alert.alert(
                "Template imported",
                `"${name}" has been added to your library.`,
                [{ text: "OK", onPress: () => { reset(); onSaved(); } }],
            );
        } catch (e: any) {
            Alert.alert("Save failed", e?.message ?? "Something went wrong.");
        } finally {
            setSaving(false);
        }
    };

    const totalFields = preview?.sections.reduce((n, s) => n + s.fields.length, 0) ?? 0;

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View style={{ flex: 1, backgroundColor: "#0f172a" }}>
                    {/* Header */}
                    <View style={{
                        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                        paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
                        borderBottomWidth: 1, borderBottomColor: "#1e293b",
                    }}>
                        <TouchableOpacity
                            onPress={handleClose}
                            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#1e293b", alignItems: "center", justifyContent: "center" }}
                        >
                            <Ionicons name="close" size={18} color="#fff" />
                        </TouchableOpacity>
                        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Import Template</Text>
                        <TouchableOpacity
                            onPress={pickFile}
                            disabled={picking}
                            style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#1e293b", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12 }}
                        >
                            {picking
                                ? <ActivityIndicator size="small" color="#f2a72f" />
                                : <Ionicons name="folder-open-outline" size={15} color="#f2a72f" />
                            }
                            <Text style={{ color: "#f2a72f", fontSize: 13, fontWeight: "600" }}>Pick file</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
                    >
                        {/* Paste area */}
                        <Text style={{ color: "#71717a", fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                            Paste JSON or YAML
                        </Text>
                        <View style={{ backgroundColor: "#1e293b", borderRadius: 14, borderWidth: 1, borderColor: parseError ? "#ef4444" : preview ? "#22c55e" : "#334155", marginBottom: 4 }}>
                            <TextInput
                                value={text}
                                onChangeText={(t) => { setText(t); setPreview(null); setParseError(null); }}
                                placeholder={SCHEMA_HINT}
                                placeholderTextColor="#334155"
                                multiline
                                autoCorrect={false}
                                autoCapitalize="none"
                                style={{
                                    color: "#e2e8f0",
                                    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
                                    fontSize: 12,
                                    lineHeight: 18,
                                    padding: 14,
                                    minHeight: 200,
                                    textAlignVertical: "top",
                                }}
                            />
                        </View>

                        {/* Supported types hint */}
                        <Text style={{ color: "#3f3f46", fontSize: 11, marginBottom: 16 }}>
                            Field types: text · number · checkbox · select · photo · signature · route · accelerometer · timer · stopwatch · joint_angle
                        </Text>

                        {/* Parse error */}
                        {parseError && (
                            <View style={{ backgroundColor: "#7f1d1d", borderRadius: 12, padding: 12, marginBottom: 16, flexDirection: "row", gap: 8 }}>
                                <Ionicons name="alert-circle" size={16} color="#fca5a5" />
                                <Text style={{ color: "#fca5a5", fontSize: 13, flex: 1, lineHeight: 18 }}>{parseError}</Text>
                            </View>
                        )}

                        {/* Parse button */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handleParse}
                            disabled={!text.trim()}
                            style={{
                                backgroundColor: text.trim() ? "#f2a72f" : "#27272a",
                                borderRadius: 14,
                                paddingVertical: 14,
                                alignItems: "center",
                                marginBottom: 24,
                            }}
                        >
                            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
                                Parse &amp; Preview
                            </Text>
                        </TouchableOpacity>

                        {/* Preview */}
                        {preview && (
                            <View>
                                {/* Success banner */}
                                <View style={{ backgroundColor: "#14532d", borderRadius: 12, padding: 12, marginBottom: 20, flexDirection: "row", alignItems: "center", gap: 8 }}>
                                    <Ionicons name="checkmark-circle" size={18} color="#4ade80" />
                                    <Text style={{ color: "#4ade80", fontSize: 13, fontWeight: "600" }}>
                                        Parsed successfully — {preview.sections.length} section{preview.sections.length !== 1 ? "s" : ""}, {totalFields} field{totalFields !== 1 ? "s" : ""}
                                    </Text>
                                </View>

                                {/* Section breakdown */}
                                <View style={{ backgroundColor: "#1e293b", borderRadius: 14, padding: 14, marginBottom: 20, gap: 8 }}>
                                    {preview.sections.map((sec, i) => (
                                        <View key={sec.id} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                                <View style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: "#334155", alignItems: "center", justifyContent: "center" }}>
                                                    <Text style={{ color: "#94a3b8", fontSize: 10, fontWeight: "700" }}>{i + 1}</Text>
                                                </View>
                                                <Text style={{ color: "#e2e8f0", fontSize: 13, fontWeight: "500" }}>{sec.name}</Text>
                                            </View>
                                            <Text style={{ color: "#52525b", fontSize: 12 }}>{sec.fields.length} field{sec.fields.length !== 1 ? "s" : ""}</Text>
                                        </View>
                                    ))}
                                    {preview.gpsValidation && (
                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, borderTopWidth: 1, borderTopColor: "#334155", paddingTop: 8, marginTop: 2 }}>
                                            <Ionicons name="location" size={12} color="#f2a72f" />
                                            <Text style={{ color: "#71717a", fontSize: 11 }}>GPS validation enabled</Text>
                                        </View>
                                    )}
                                </View>

                                {/* Editable name */}
                                <Text style={{ color: "#71717a", fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                                    Template name
                                </Text>
                                <View style={{ backgroundColor: "#1e293b", borderRadius: 14, paddingHorizontal: 16, height: 48, justifyContent: "center", marginBottom: 20 }}>
                                    <TextInput
                                        value={templateName}
                                        onChangeText={setTemplateName}
                                        placeholder="Template name"
                                        placeholderTextColor="#52525b"
                                        style={{ color: "#fff", fontSize: 14 }}
                                    />
                                </View>

                                {/* Save */}
                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    onPress={handleSave}
                                    disabled={saving || !templateName.trim()}
                                    style={{
                                        backgroundColor: templateName.trim() ? "#f2a72f" : "#27272a",
                                        borderRadius: 14,
                                        paddingVertical: 15,
                                        alignItems: "center",
                                        opacity: saving ? 0.6 : 1,
                                    }}
                                >
                                    {saving
                                        ? <ActivityIndicator color="#fff" />
                                        : <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Save to my library</Text>
                                    }
                                </TouchableOpacity>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// ─── Step 1 — type picker ─────────────────────────────────────────────────────

function TypePicker({ onSelect, onImport }: { onSelect: (t: SystemTemplate) => void; onImport: () => void }) {
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

                {/* ── Actions (inside ScrollView so they're never clipped) ── */}
                <View style={{ marginTop: 8, gap: 12 }}>
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
    const [baseTemplate, setBaseTemplate] = useState<SystemTemplate | null>(null);
    const [importVisible, setImportVisible] = useState(false);

    const handleBack = () => {
        if (step === 2) setStep(1);
        else onNavigate("templateLibrary");
    };

    return (
        <View className="flex-1 bg-background">
            <ImportModal
                visible={importVisible}
                onClose={() => setImportVisible(false)}
                onSaved={() => { setImportVisible(false); onNavigate("templateLibrary"); }}
            />

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
                        {step === 1 ? "Choose type" : "Customise sections"}
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
                                backgroundColor: step === s ? "#f2a72f" : "#3f3f46",
                            }}
                        />
                    ))}
                </View>
            </View>

            {step === 1 ? (
                <TypePicker
                    onSelect={(t) => { setBaseTemplate(t); setStep(2); }}
                    onImport={() => setImportVisible(true)}
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
