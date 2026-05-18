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
import { auth } from "@/lib/firebase";
import { store } from "@/lib/store";
import { SYSTEM_TEMPLATES } from "@/lib/templates/systemTemplates";

interface Props {
    onNavigate: (screen: AppScreen) => void;
}

type Association = "organisation" | "individual";

function todayLabel() {
    return new Date().toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export default function ReportSetupScreen({ onNavigate }: Props) {
    const template = SYSTEM_TEMPLATES.find(
        (t) => t.id === store.selectedTemplateId,
    );

    const [reportTitle, setReportTitle] = useState("");
    const [description, setDescription] = useState("");
    const [association, setAssociation] = useState<Association>("individual");
    const [reportDate, setReportDate] = useState(todayLabel);
    const [inspectorName, setInspectorName] = useState(
        auth.currentUser?.displayName ?? "",
    );
    const [autoGps, setAutoGps] = useState(template?.gpsValidation ?? false);

    const handleBegin = () => {
        store.setReportSetup({
            title: reportTitle.trim() || (template?.name ?? "Untitled report"),
            description: description.trim(),
            inspectorName: inspectorName.trim(),
            date: reportDate,
            gpsEnabled: autoGps,
        });
        onNavigate("reportEditor");
    };

    return (
        <View className="flex-1 bg-background">
            {/* Top Bar */}
            <View className="flex-row items-center gap-3 px-5 pt-16 pb-4">
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onNavigate("templateLibrary")}
                    className="w-9 h-9 items-center justify-center rounded-full bg-slate-800"
                >
                    <Ionicons name="arrow-back" size={18} color="#ffffff" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold">
                    Report setup
                </Text>
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
                            <Ionicons
                                name={template.icon as any}
                                size={18}
                                color={template.color}
                            />
                        </View>
                        <View className="flex-1">
                            <Text
                                className="font-bold text-sm"
                                style={{ color: template.color }}
                            >
                                {template.name}
                            </Text>
                            <Text className="text-zinc-500 text-xs mt-0.5">
                                {template.sections.length} sections ·{" "}
                                {template.category}
                            </Text>
                        </View>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => onNavigate("templateLibrary")}
                        >
                            <Text
                                className="font-semibold text-sm"
                                style={{ color: template.color }}
                            >
                                Change
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => onNavigate("templateLibrary")}
                        className="bg-slate-900 rounded-2xl px-4 py-3.5 flex-row items-center mb-5 border border-dashed border-zinc-700"
                    >
                        <Ionicons name="add-circle-outline" size={20} color="#52525b" />
                        <Text className="text-zinc-500 text-sm ml-3">
                            Select a template
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Report Title */}
                <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2">
                    Report title
                </Text>
                <View className="bg-slate-900 rounded-2xl px-4 h-12 justify-center mb-5">
                    <TextInput
                        className="text-white text-sm"
                        placeholder={
                            template
                                ? `e.g. ${template.name} — Site A`
                                : "e.g. Site inspection — Batch 4"
                        }
                        placeholderTextColor="#52525b"
                        value={reportTitle}
                        onChangeText={setReportTitle}
                    />
                </View>

                {/* Description */}
                <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2">
                    Description{" "}
                    <Text className="text-zinc-600 normal-case tracking-normal">
                        (optional)
                    </Text>
                </Text>
                <View className="bg-slate-900 rounded-2xl px-4 py-3 mb-5">
                    <TextInput
                        className="text-white text-sm"
                        placeholder="Add notes or context for this report…"
                        placeholderTextColor="#52525b"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                        style={{ minHeight: 72 }}
                    />
                </View>

                {/* Associate With */}
                <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2">
                    Associate with
                </Text>
                <View className="flex-row bg-slate-900 rounded-2xl p-1 mb-5">
                    {(["individual", "organisation"] as Association[]).map(
                        (opt) => (
                            <TouchableOpacity
                                key={opt}
                                activeOpacity={0.7}
                                onPress={() => setAssociation(opt)}
                                className={`flex-1 py-2.5 rounded-xl items-center ${
                                    association === opt ? "bg-primary" : ""
                                }`}
                            >
                                <Text
                                    className={`text-sm font-semibold capitalize ${
                                        association === opt
                                            ? "text-white"
                                            : "text-zinc-500"
                                    }`}
                                >
                                    {opt === "organisation"
                                        ? "Organisation"
                                        : "Individual"}
                                </Text>
                            </TouchableOpacity>
                        ),
                    )}
                </View>

                {/* Inspector Name */}
                <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2">
                    Inspector name
                </Text>
                <View className="bg-slate-900 rounded-2xl px-4 h-12 justify-center mb-5">
                    <TextInput
                        className="text-white text-sm"
                        placeholder="Your name"
                        placeholderTextColor="#52525b"
                        value={inspectorName}
                        onChangeText={setInspectorName}
                    />
                </View>

                {/* Report Date */}
                <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2">
                    Report date
                </Text>
                <View className="bg-slate-900 rounded-2xl px-4 h-12 flex-row items-center justify-between mb-5">
                    <TextInput
                        className="text-white text-sm flex-1"
                        value={reportDate}
                        onChangeText={setReportDate}
                        placeholderTextColor="#52525b"
                    />
                    <Ionicons
                        name="calendar-outline"
                        size={18}
                        color="#52525b"
                    />
                </View>

                {/* Auto GPS */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setAutoGps((v) => !v)}
                    className="flex-row items-center gap-3 mb-8"
                >
                    <View
                        className={`w-5 h-5 rounded-md border-2 items-center justify-center ${
                            autoGps
                                ? "bg-primary border-primary"
                                : "bg-transparent border-zinc-600"
                        }`}
                    >
                        {autoGps && (
                            <Ionicons
                                name="checkmark"
                                size={13}
                                color="#ffffff"
                            />
                        )}
                    </View>
                    <Text className="text-white text-sm">
                        Auto-capture GPS location on start
                    </Text>
                </TouchableOpacity>

                {/* Begin */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleBegin}
                    disabled={!template}
                    className={`rounded-2xl py-4 items-center ${
                        template ? "bg-primary" : "bg-slate-700"
                    }`}
                >
                    <Text className="text-white font-bold text-base">
                        Begin report
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
