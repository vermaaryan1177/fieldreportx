import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";

import { AppScreen } from "@/components/BottomNavBar";
import { auth } from "@/lib/firebase";
import { saveDraftReport, markReportInProgress } from "@/lib/db/reports";
import { store } from "@/lib/store";
import { SYSTEM_TEMPLATES } from "@/lib/templates/systemTemplates";

interface Props {
    onNavigate: (screen: AppScreen) => void;
    hasOrganisation?: boolean;
}

type Association = "organisation" | "individual";

function todayLabel() {
    return new Date().toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

interface DisplayTemplate {
    name: string;
    category: string;
    icon: string;
    color: string;
    sections: { id: string; name: string }[];
    gpsValidation: boolean;
}

function resolveTemplate(): DisplayTemplate | null {
    const id = store.selectedTemplateId;
    if (!id) return null;

    if (!id.startsWith("user_")) {
        const sys = SYSTEM_TEMPLATES.find((t) => t.id === id);
        return sys ?? null;
    }

    const user = store.selectedUserTemplate;
    if (!user) return null;
    return {
        name: user.name,
        category: user.category,
        icon: "document-text-outline",
        color: "#94a3b8",
        sections: user.sections,
        gpsValidation: user.gpsValidation,
    };
}

export default function ReportSetupScreen({ onNavigate }: Props) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const template = resolveTemplate();
    const user = auth.currentUser;

    // Pre-fill from a resumed draft if available
    const resume = store.resumeSetup;

    const [reportTitle, setReportTitle] = useState(resume?.title ?? "");
    const [description, setDescription] = useState(resume?.description ?? "");
    const [association, setAssociation] = useState<Association>("individual");
    const reportDate = todayLabel();
    const [inspectorName, setInspectorName] = useState(
        resume?.inspectorName ?? user?.displayName ?? "",
    );
    const [autoGps, setAutoGps] = useState(template?.gpsValidation ?? false);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Save current field values so they survive the unmount/remount when the
    // user navigates to the template library and back.
    const handlePickTemplate = () => {
        store.setResumeSetup({
            title: reportTitle,
            description,
            inspectorName,
            date: reportDate,
            gpsEnabled: autoGps,
            templateId: store.selectedTemplateId ?? "",
        });
        onNavigate("templateLibrary");
    };

    // ── Validation ────────────────────────────────────────────────────────────
    const canProceed =
        !!template &&
        reportTitle.trim().length > 0 &&
        description.trim().length > 0;

    // ── Voice dictation ───────────────────────────────────────────────────────
    const startRecording = async () => {
        try {
            const { granted } = await Audio.requestPermissionsAsync();
            if (!granted) {
                Alert.alert("Permission required", "Microphone access is needed for voice input.");
                return;
            }
            await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
            const { recording: rec } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY,
            );
            setRecording(rec);
        } catch {
            Alert.alert("Error", "Could not start recording.");
        }
    };

    const stopAndTranscribe = async () => {
        if (!recording) return;
        try {
            await recording.stopAndUnloadAsync();
            await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
            const uri = recording.getURI();
            setRecording(null);
            if (!uri) return;

            setIsTranscribing(true);
            const apiKey = (process.env.EXPO_PUBLIC_GROQ_API_KEY ?? "").replace(/^["']|["']$/g, "").trim();
            if (!apiKey) {
                Alert.alert("Setup required", "Add EXPO_PUBLIC_GROQ_API_KEY to your .env file.");
                return;
            }

            const formData = new FormData();
            formData.append("file", { uri, type: "audio/m4a", name: "recording.m4a" } as any);
            formData.append("model", "whisper-large-v3");

            const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
                method: "POST",
                headers: { Authorization: `Bearer ${apiKey}` },
                body: formData,
            });
            if (!res.ok) {
                const body = await res.text();
                throw new Error(`${res.status}: ${body}`);
            }
            const { text } = await res.json();
            if (text?.trim()) {
                const current = description.trim();
                setDescription(current ? `${current} ${text.trim()}` : text.trim());
            }
        } catch (err: any) {
            Alert.alert("Transcription failed", err?.message ?? "Unknown error");
        } finally {
            setIsTranscribing(false);
        }
    };

    // ── Save draft on back press ───────────────────────────────────────────────
    const handleBack = async () => {
        if (!template || !reportTitle.trim() || !description.trim() || !user) {
            // Missing required fields — discard and go back
            store.clearReport();
            onNavigate("home");
            return;
        }

        setSaving(true);
        try {
            const id = await saveDraftReport({
                existingId: store.draftReportId,
                title: reportTitle.trim(),
                description: description.trim(),
                templateId: store.selectedTemplateId ?? template.name,
                templateName: template.name,
                inspectorId: user.uid,
                inspectorName: inspectorName.trim() || user.displayName || user.email || "Unknown",
                sectionStubs: template.sections,
            });
            store.setDraftReportId(id);
        } catch {
            // Save failed silently — still navigate back
        } finally {
            setSaving(false);
        }

        onNavigate("home");
    };

    // ── Begin report (save as inprogress + navigate to editor) ────────────────
    const handleBegin = async () => {
        if (!canProceed || !user) return;

        setSaving(true);
        try {
            // Persist setup to store (editor reads from here)
            store.setReportSetup({
                title: reportTitle.trim(),
                description: description.trim(),
                inspectorName: inspectorName.trim() || user.displayName || user.email || "Unknown",
                date: reportDate,
                gpsEnabled: autoGps,
            });

            // Create or update the Firestore doc as "inprogress"
            if (store.draftReportId) {
                await markReportInProgress(store.draftReportId);
            } else {
                const id = await saveDraftReport({
                    existingId: null,
                    title: reportTitle.trim(),
                    description: description.trim(),
                    templateId: store.selectedTemplateId ?? template!.name,
                    templateName: template!.name,
                    inspectorId: user.uid,
                    inspectorName: inspectorName.trim() || user.displayName || user.email || "Unknown",
                    sectionStubs: template!.sections,
                });
                store.setDraftReportId(id);
                await markReportInProgress(id);
            }
        } catch {
            // Non-blocking — editor still opens even if Firestore write fails
        } finally {
            setSaving(false);
        }

        onNavigate("reportEditor");
    };

    return (
        <View className="flex-1 bg-background dark:bg-[#1e2529]">
            {/* Top Bar */}
            <View className="flex-row items-center gap-3 px-5 pt-16 pb-4">
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleBack}
                    disabled={saving}
                    className="w-9 h-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
                >
                    {saving
                        ? <ActivityIndicator size="small" color="#f2a72f" />
                        : <Ionicons name="arrow-back" size={18} color={isDark ? "#ffffff" : "#0f172a"} />
                    }
                </TouchableOpacity>
                <Text className="text-slate-900 dark:text-white text-lg font-bold">Report setup</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
            >
                {/* Template Card */}
                {template ? (
                    <View
                        className="rounded-2xl px-4 py-3.5 flex-row items-center mb-5"
                        style={{ backgroundColor: template.color + "18" }}
                    >
                        <View
                            className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                            style={{ backgroundColor: template.color + "30" }}
                        >
                            <Ionicons name={template.icon as any} size={18} color={template.color} />
                        </View>
                        <View className="flex-1">
                            <Text className="font-bold text-sm" style={{ color: template.color }}>
                                {template.name}
                            </Text>
                            <Text className="text-slate-400 dark:text-zinc-500 text-xs mt-0.5">
                                {template.sections.length} sections · {template.category}
                            </Text>
                        </View>
                        <TouchableOpacity activeOpacity={0.7} onPress={handlePickTemplate}>
                            <Text className="font-semibold text-sm" style={{ color: template.color }}>
                                Change
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={handlePickTemplate}
                        className="bg-white dark:bg-slate-900 rounded-2xl px-4 py-3.5 flex-row items-center mb-5 border border-dashed border-slate-300 dark:border-zinc-700"
                    >
                        <Ionicons name="add-circle-outline" size={20} color={isDark ? "#52525b" : "#94a3b8"} />
                        <Text className="text-slate-400 dark:text-zinc-500 text-sm ml-3">Select a template</Text>
                    </TouchableOpacity>
                )}

                {/* Report Title */}
                <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-slate-400 dark:text-zinc-500 text-xs font-semibold uppercase tracking-widest">
                        Report title
                    </Text>
                    {reportTitle.trim().length === 0 && (
                        <Text className="text-red-400 text-xs">Required</Text>
                    )}
                </View>
                <View className={`bg-white dark:bg-slate-900 rounded-2xl px-4 h-12 justify-center mb-5 border ${reportTitle.trim().length === 0 ? "border-red-500/30" : "border-transparent"}`}>
                    <TextInput
                        className="text-slate-900 dark:text-white text-sm"
                        placeholder={
                            template
                                ? `e.g. ${template.name} — Site A`
                                : "e.g. Site inspection — Batch 4"
                        }
                        placeholderTextColor={isDark ? "#52525b" : "#94a3b8"}
                        value={reportTitle}
                        onChangeText={setReportTitle}
                    />
                </View>

                {/* Description — required */}
                <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-slate-400 dark:text-zinc-500 text-xs font-semibold uppercase tracking-widest">
                        Description
                    </Text>
                    {description.trim().length === 0 && (
                        <Text className="text-red-400 text-xs">Required</Text>
                    )}
                </View>
                <View className={`bg-white dark:bg-slate-900 rounded-2xl px-4 py-3 mb-5 border ${description.trim().length === 0 ? "border-red-500/30" : "border-transparent"}`}>
                    <TextInput
                        className="text-slate-900 dark:text-white text-sm"
                        placeholder="Add notes or context for this report…"
                        placeholderTextColor={isDark ? "#52525b" : "#94a3b8"}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                        style={{ minHeight: 72 }}
                    />
                    <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#1e293b" }}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={recording ? stopAndTranscribe : startRecording}
                            disabled={isTranscribing}
                            style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#0f172a", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: recording ? "#ef444440" : "#3f3f46" }}
                        >
                            {isTranscribing ? (
                                <>
                                    <ActivityIndicator size="small" color="#f2a72f" />
                                    <Text style={{ color: "#f2a72f", fontSize: 12 }}>Transcribing…</Text>
                                </>
                            ) : recording ? (
                                <>
                                    <Ionicons name="stop-circle" size={14} color="#ef4444" />
                                    <Text style={{ color: "#ef4444", fontSize: 12, fontWeight: "600" }}>Stop recording</Text>
                                </>
                            ) : (
                                <>
                                    <Ionicons name="mic-outline" size={14} color="#94a3b8" />
                                    <Text style={{ color: "#94a3b8", fontSize: 12 }}>Dictate</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Associate With */}
                <Text className="text-slate-400 dark:text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2">
                    Associate with
                </Text>
                <View className="flex-row bg-white dark:bg-slate-900 rounded-2xl p-1 mb-5">
                    {(["individual", "organisation"] as Association[]).map((opt) => (
                        <TouchableOpacity
                            key={opt}
                            activeOpacity={0.7}
                            onPress={() => setAssociation(opt)}
                            className={`flex-1 py-2.5 rounded-xl items-center ${association === opt ? "bg-primary" : ""}`}
                        >
                            <Text className={`text-sm font-semibold capitalize ${association === opt ? "text-white" : "text-slate-400 dark:text-zinc-500"}`}>
                                {opt === "organisation" ? "Organisation" : "Individual"}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Inspector Name */}
                <Text className="text-slate-400 dark:text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2">
                    Inspector name
                </Text>
                <View className="bg-white dark:bg-slate-900 rounded-2xl px-4 h-12 justify-center mb-5">
                    <TextInput
                        className="text-slate-900 dark:text-white text-sm"
                        placeholder="Your name"
                        placeholderTextColor={isDark ? "#52525b" : "#94a3b8"}
                        value={inspectorName}
                        onChangeText={setInspectorName}
                    />
                </View>

                {/* Report Date */}
                <Text className="text-slate-400 dark:text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2">
                    Report date
                </Text>
                <View className="bg-white dark:bg-slate-900 rounded-2xl px-4 h-12 flex-row items-center justify-between mb-5">
                    <Text className="text-slate-500 dark:text-zinc-400 text-sm flex-1">{reportDate}</Text>
                    <Ionicons name="calendar-outline" size={18} color={isDark ? "#3f3f46" : "#cbd5e1"} />
                </View>

                {/* Auto GPS */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setAutoGps((v) => !v)}
                    className="flex-row items-center gap-3 mb-8"
                >
                    <View className={`w-5 h-5 rounded-md border-2 items-center justify-center ${autoGps ? "bg-primary border-primary" : "bg-transparent border-slate-300 dark:border-zinc-600"}`}>
                        {autoGps && <Ionicons name="checkmark" size={13} color="#ffffff" />}
                    </View>
                    <Text className="text-slate-900 dark:text-white text-sm">Auto-capture GPS location on start</Text>
                </TouchableOpacity>

                {/* Validation hint */}
                {!canProceed && (
                    <View className="bg-white dark:bg-slate-900 rounded-2xl px-4 py-3 mb-4 flex-row items-center gap-2">
                        <Ionicons name="information-circle-outline" size={16} color={isDark ? "#52525b" : "#94a3b8"} />
                        <Text className="text-slate-400 dark:text-zinc-500 text-xs flex-1">
                            Select a template, enter a title and description to begin.
                        </Text>
                    </View>
                )}

                {/* Begin */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleBegin}
                    disabled={!canProceed || saving}
                    className={`rounded-2xl py-4 items-center flex-row justify-center gap-2 ${canProceed ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"}`}
                >
                    {saving && <ActivityIndicator size="small" color="#ffffff" />}
                    <Text className="text-slate-900 dark:text-white font-bold text-base">
                        {saving ? "Saving…" : "Begin report"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
