import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
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
import { store } from "@/lib/store";
import { SYSTEM_TEMPLATES } from "@/lib/templates/systemTemplates";
import { SectionStatus, TemplateField, TemplateSection } from "@/lib/types";

interface Props {
    onNavigate: (screen: AppScreen) => void;
}

type FieldValues = Record<string, string | boolean | number>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MULTILINE_KEYWORDS = [
    "notes", "description", "statement", "content", "observations",
    "comments", "recommendations", "actions", "feedback", "goals",
    "reason", "transcript", "items", "findings", "summary",
];

function isMultiline(label: string) {
    const l = label.toLowerCase();
    return MULTILINE_KEYWORDS.some((kw) => l.includes(kw));
}

function statusColor(status: SectionStatus) {
    if (status === "completed") return "#22c55e";
    if (status === "inprogress") return "#f2a72f";
    return "#3f3f46";
}

function statusDetail(status: SectionStatus) {
    if (status === "completed") return "Completed — tap to edit";
    if (status === "inprogress") return "In progress — tap to continue";
    return "Not started";
}

// ─── Field renderer inside section modal ─────────────────────────────────────

interface FieldRowProps {
    field: TemplateField;
    value: string | boolean | number | undefined;
    onChange: (value: string | boolean | number) => void;
    openSelect: string | null;
    setOpenSelect: (id: string | null) => void;
}

function FieldRow({ field, value, onChange, openSelect, setOpenSelect }: FieldRowProps) {
    const isSelectOpen = openSelect === field.id;

    return (
        <View className="mb-4">
            <View className="flex-row items-center mb-1.5 gap-1">
                <Text className="text-zinc-400 text-xs font-medium">
                    {field.label}
                </Text>
                {field.required && (
                    <Text className="text-alert text-xs">*</Text>
                )}
            </View>

            {/* TEXT */}
            {field.type === "text" && (
                <View
                    className={`bg-slate-800 rounded-xl px-3 ${
                        isMultiline(field.label) ? "py-3" : "h-11 justify-center"
                    }`}
                >
                    <TextInput
                        className="text-white text-sm"
                        value={String(value ?? "")}
                        onChangeText={onChange}
                        placeholderTextColor="#52525b"
                        placeholder="Type here…"
                        multiline={isMultiline(field.label)}
                        numberOfLines={isMultiline(field.label) ? 4 : 1}
                        textAlignVertical={isMultiline(field.label) ? "top" : "center"}
                        style={isMultiline(field.label) ? { minHeight: 88 } : undefined}
                    />
                </View>
            )}

            {/* NUMBER */}
            {field.type === "number" && (
                <View className="bg-slate-800 rounded-xl px-3 h-11 justify-center">
                    <TextInput
                        className="text-white text-sm"
                        value={value !== undefined && value !== "" ? String(value) : ""}
                        onChangeText={(v) => {
                            if (v === "" || v === "-") { onChange(v); return; }
                            const n = parseFloat(v);
                            if (!isNaN(n)) onChange(n);
                        }}
                        keyboardType="numeric"
                        placeholderTextColor="#52525b"
                        placeholder="0"
                    />
                </View>
            )}

            {/* CHECKBOX */}
            {field.type === "checkbox" && (
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onChange(!(value === true))}
                    className="flex-row items-center gap-3 bg-slate-800 rounded-xl px-3 h-11"
                >
                    <View
                        className={`w-5 h-5 rounded-md border-2 items-center justify-center ${
                            value === true
                                ? "bg-primary border-primary"
                                : "border-zinc-600"
                        }`}
                    >
                        {value === true && (
                            <Ionicons name="checkmark" size={13} color="#fff" />
                        )}
                    </View>
                    <Text className="text-zinc-400 text-sm">
                        {value === true ? "Yes" : "No"}
                    </Text>
                </TouchableOpacity>
            )}

            {/* SELECT */}
            {field.type === "select" && (
                <View>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() =>
                            setOpenSelect(isSelectOpen ? null : field.id)
                        }
                        className="bg-slate-800 rounded-xl px-3 h-11 flex-row items-center justify-between"
                    >
                        <Text
                            className={`text-sm ${value ? "text-white" : "text-zinc-600"}`}
                        >
                            {String(value ?? "Select…")}
                        </Text>
                        <Ionicons
                            name={isSelectOpen ? "chevron-up" : "chevron-down"}
                            size={15}
                            color="#52525b"
                        />
                    </TouchableOpacity>
                    {isSelectOpen && (
                        <View className="bg-slate-800 rounded-xl overflow-hidden mt-1 border border-zinc-700">
                            {field.options?.map((opt, i) => (
                                <TouchableOpacity
                                    key={opt}
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        onChange(opt);
                                        setOpenSelect(null);
                                    }}
                                    className={`px-4 py-3 flex-row items-center justify-between ${
                                        i < (field.options?.length ?? 0) - 1
                                            ? "border-b border-zinc-700"
                                            : ""
                                    }`}
                                >
                                    <Text
                                        className={`text-sm ${
                                            value === opt
                                                ? "text-primary font-semibold"
                                                : "text-white"
                                        }`}
                                    >
                                        {opt}
                                    </Text>
                                    {value === opt && (
                                        <Ionicons
                                            name="checkmark"
                                            size={16}
                                            color="#f2a72f"
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            )}

            {/* PHOTO */}
            {field.type === "photo" && (
                <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => onChange(value ? "" : "captured")}
                    className={`rounded-xl h-11 flex-row items-center justify-center gap-2 border ${
                        value
                            ? "bg-green-500/10 border-green-500/30"
                            : "bg-slate-800 border-zinc-700"
                    }`}
                >
                    <Ionicons
                        name={value ? "checkmark-circle" : "camera-outline"}
                        size={18}
                        color={value ? "#22c55e" : "#71717a"}
                    />
                    <Text
                        className={`text-sm font-medium ${value ? "text-green-400" : "text-zinc-500"}`}
                    >
                        {value ? "Photo captured" : "Add photo"}
                    </Text>
                </TouchableOpacity>
            )}

            {/* SIGNATURE */}
            {field.type === "signature" && (
                <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => onChange(value ? "" : "signed")}
                    className={`rounded-xl h-11 flex-row items-center justify-center gap-2 border ${
                        value
                            ? "bg-primary/10 border-primary/30"
                            : "bg-slate-800 border-zinc-700"
                    }`}
                >
                    <Ionicons
                        name={value ? "checkmark-circle" : "pencil-outline"}
                        size={18}
                        color={value ? "#f2a72f" : "#71717a"}
                    />
                    <Text
                        className={`text-sm font-medium ${value ? "text-primary" : "text-zinc-500"}`}
                    >
                        {value ? "Signed" : "Add signature"}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

// ─── Section editor modal ─────────────────────────────────────────────────────

interface SectionEditorProps {
    section: TemplateSection;
    initialValues: FieldValues;
    onSave: (values: FieldValues) => void;
    onClose: () => void;
}

function SectionEditor({ section, initialValues, onSave, onClose }: SectionEditorProps) {
    const [values, setValues] = useState<FieldValues>(initialValues);
    const [openSelect, setOpenSelect] = useState<string | null>(null);

    const setValue = (fieldId: string, value: string | boolean | number) => {
        setValues((prev) => ({ ...prev, [fieldId]: value }));
    };

    const requiredFilled = section.fields
        .filter((f) => f.required)
        .every((f) => {
            const v = values[f.id];
            return v !== undefined && v !== "" && v !== false;
        });

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1 bg-background"
        >
            {/* Header */}
            <View className="flex-row items-center gap-3 px-5 pt-14 pb-4 border-b border-zinc-800">
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={onClose}
                    className="w-9 h-9 rounded-full bg-slate-800 items-center justify-center"
                >
                    <Ionicons name="close" size={18} color="#ffffff" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-white font-bold text-base">
                        {section.name}
                    </Text>
                    <Text className="text-zinc-500 text-xs mt-0.5">
                        {section.fields.length} field
                        {section.fields.length !== 1 ? "s" : ""}
                        {section.fields.some((f) => f.required) && " · * required"}
                    </Text>
                </View>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => onSave(values)}
                    className={`px-4 py-2 rounded-xl ${requiredFilled ? "bg-primary" : "bg-slate-700"}`}
                >
                    <Text className="text-white font-semibold text-sm">Done</Text>
                </TouchableOpacity>
            </View>

            {/* Fields */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            >
                {section.fields.map((field) => (
                    <FieldRow
                        key={field.id}
                        field={field}
                        value={values[field.id]}
                        onChange={(v) => setValue(field.id, v)}
                        openSelect={openSelect}
                        setOpenSelect={setOpenSelect}
                    />
                ))}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function ReportEditorScreen({ onNavigate }: Props) {
    const template = SYSTEM_TEMPLATES.find(
        (t) => t.id === store.selectedTemplateId,
    );
    const setup = store.reportSetup;

    const [sectionStatuses, setSectionStatuses] = useState<Record<string, SectionStatus>>(() => {
        const result: Record<string, SectionStatus> = {};
        template?.sections.forEach((s) => {
            result[s.id] = store.getSectionStatus(s.id);
        });
        return result;
    });

    const [allFieldValues, setAllFieldValues] = useState<Record<string, FieldValues>>(() => {
        const result: Record<string, FieldValues> = {};
        template?.sections.forEach((s) => {
            result[s.id] = store.getFieldValues(s.id);
        });
        return result;
    });

    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

    if (!template) {
        return (
            <View className="flex-1 bg-background items-center justify-center px-8">
                <Ionicons name="alert-circle-outline" size={40} color="#52525b" />
                <Text className="text-zinc-400 text-sm mt-3 text-center">
                    No template selected. Go back and choose one.
                </Text>
                <TouchableOpacity
                    onPress={() => onNavigate("templateLibrary")}
                    className="mt-5 bg-primary px-6 py-3 rounded-xl"
                >
                    <Text className="text-white font-semibold text-sm">
                        Pick a template
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    const sections = template.sections;
    const completed = Object.values(sectionStatuses).filter(
        (s) => s === "completed",
    ).length;
    const total = sections.length;
    const progress = total > 0 ? completed / total : 0;

    const openSection = (sectionId: string) => {
        if (sectionStatuses[sectionId] !== "completed") {
            setSectionStatuses((prev) => ({ ...prev, [sectionId]: "inprogress" }));
            store.setSectionStatus(sectionId, "inprogress");
        }
        setActiveSectionId(sectionId);
    };

    const handleSaveSection = (sectionId: string, values: FieldValues) => {
        setAllFieldValues((prev) => ({ ...prev, [sectionId]: values }));
        setSectionStatuses((prev) => ({ ...prev, [sectionId]: "completed" }));
        store.setFieldValues(sectionId, values);
        store.setSectionStatus(sectionId, "completed");
        setActiveSectionId(null);
    };

    const activeSection = sections.find((s) => s.id === activeSectionId);

    return (
        <View className="flex-1 bg-background">
            {/* Top Bar */}
            <View className="flex-row items-center gap-2 px-5 pt-16 pb-3">
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onNavigate("reportSetup")}
                    className="w-9 h-9 items-center justify-center rounded-full bg-slate-800"
                >
                    <Ionicons name="arrow-back" size={18} color="#ffffff" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text
                        className="text-white text-base font-bold"
                        numberOfLines={1}
                    >
                        {setup?.title ?? template.name}
                    </Text>
                    <Text className="text-zinc-500 text-xs" numberOfLines={1}>
                        {template.name}
                        {setup?.inspectorName ? ` · ${setup.inspectorName}` : ""}
                    </Text>
                </View>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onNavigate("mediaHandler")}
                    className="w-9 h-9 items-center justify-center rounded-full bg-slate-800"
                >
                    <Ionicons name="camera-outline" size={18} color="#f2a72f" />
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onNavigate("mapsRoutes")}
                    className="w-9 h-9 items-center justify-center rounded-full bg-slate-800"
                >
                    <Ionicons name="map-outline" size={18} color="#f2a72f" />
                </TouchableOpacity>
                <View className="px-2.5 py-1 rounded-full bg-tagInprogress/20">
                    <Text className="text-tagInprogress text-xs font-semibold">
                        In Progress
                    </Text>
                </View>
            </View>

            {/* Progress */}
            <View className="px-5 pb-4">
                <Text className="text-zinc-400 text-xs mb-2">
                    {completed} of {total} section
                    {total !== 1 ? "s" : ""} complete
                </Text>
                <View className="h-1.5 bg-zinc-800 rounded-full">
                    <View
                        className="h-1.5 bg-primary rounded-full"
                        style={{ width: `${progress * 100}%` }}
                    />
                </View>
            </View>

            {/* Section list */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
            >
                <View className="gap-2">
                    {sections.map((section, index) => {
                        const status = sectionStatuses[section.id] ?? "notstarted";
                        const isCompleted = status === "completed";
                        const isInProgress = status === "inprogress";

                        return (
                            <TouchableOpacity
                                key={section.id}
                                activeOpacity={0.75}
                                onPress={() => openSection(section.id)}
                                className={`flex-row items-center rounded-2xl px-4 py-3.5 ${
                                    isInProgress
                                        ? "bg-primary/10 border border-primary/30"
                                        : "bg-slate-900"
                                }`}
                            >
                                {/* Status indicator */}
                                {isCompleted ? (
                                    <View className="w-8 h-8 rounded-full bg-green-500/20 items-center justify-center">
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={22}
                                            color="#22c55e"
                                        />
                                    </View>
                                ) : (
                                    <View
                                        className="w-8 h-8 rounded-full border-2 items-center justify-center"
                                        style={{
                                            borderColor: statusColor(status),
                                            backgroundColor: isInProgress
                                                ? "#f2a72f20"
                                                : "transparent",
                                        }}
                                    >
                                        <Text
                                            className="text-xs font-bold"
                                            style={{ color: statusColor(status) }}
                                        >
                                            {index + 1}
                                        </Text>
                                    </View>
                                )}

                                {/* Text */}
                                <View className="flex-1 ml-3">
                                    <Text
                                        className={`text-sm font-semibold ${
                                            status === "notstarted"
                                                ? "text-zinc-500"
                                                : "text-white"
                                        }`}
                                    >
                                        {section.name}
                                    </Text>
                                    <Text
                                        className={`text-xs mt-0.5 ${
                                            isInProgress
                                                ? "text-primary"
                                                : isCompleted
                                                  ? "text-green-500"
                                                  : "text-zinc-600"
                                        }`}
                                    >
                                        {statusDetail(status)}
                                    </Text>
                                </View>

                                {/* Right chevron / edit */}
                                <Ionicons
                                    name={
                                        isCompleted
                                            ? "create-outline"
                                            : "chevron-forward"
                                    }
                                    size={16}
                                    color={
                                        isInProgress ? "#f2a72f" : "#3f3f46"
                                    }
                                />
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Footer */}
            <View className="flex-row gap-3 px-5 pb-10 pt-3 bg-background border-t border-zinc-800">
                <TouchableOpacity
                    activeOpacity={0.7}
                    className="flex-1 bg-slate-900 border border-zinc-700 rounded-2xl py-4 items-center"
                >
                    <Text className="text-white font-semibold text-sm">
                        Save draft
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => onNavigate("reportPreview")}
                    className="flex-1 bg-primary rounded-2xl py-4 items-center"
                >
                    <Text className="text-white font-bold text-sm">
                        Continue →
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Section editor modal */}
            <Modal
                visible={activeSectionId !== null}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setActiveSectionId(null)}
            >
                {activeSection && (
                    <SectionEditor
                        section={activeSection}
                        initialValues={allFieldValues[activeSectionId!] ?? {}}
                        onSave={(values) =>
                            handleSaveSection(activeSectionId!, values)
                        }
                        onClose={() => setActiveSectionId(null)}
                    />
                )}
            </Modal>
        </View>
    );
}
