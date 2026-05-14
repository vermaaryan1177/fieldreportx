import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { AppScreen } from "@/components/BottomNavBar";

interface Props {
    onNavigate: (screen: AppScreen) => void;
}

type SectionStatus = "completed" | "skipped";

const PREVIEW_SECTIONS: {
    name: string;
    status: SectionStatus;
    photos: number;
    notes: string;
    fields: number;
}[] = [
    { name: "Property details", status: "completed", photos: 0, notes: "42 Maple Ave, Richmond VIC 3121", fields: 5 },
    { name: "Exterior", status: "completed", photos: 3, notes: "Minor paint chipping on south fence", fields: 4 },
    { name: "Lounge / dining", status: "completed", photos: 2, notes: "Carpet shows minor wear", fields: 3 },
    { name: "Kitchen", status: "completed", photos: 4, notes: "Rangehood filter needs cleaning", fields: 6 },
    { name: "Bedrooms", status: "completed", photos: 3, notes: "", fields: 4 },
    { name: "Bathroom", status: "completed", photos: 2, notes: "Grouting discoloured around bath", fields: 4 },
    { name: "Garage", status: "skipped", photos: 0, notes: "", fields: 0 },
];

const SCORE = 87;
const SCORE_COLOR = "#22c55e";

export default function ReportPreviewScreen({ onNavigate }: Props) {
    const [expanded, setExpanded] = useState<number | null>(null);

    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-16 pb-4">
                <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => onNavigate("reports")}
                        className="w-9 h-9 items-center justify-center rounded-full bg-slate-800"
                    >
                        <Ionicons name="arrow-back" size={18} color="#ffffff" />
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-bold">Preview</Text>
                </View>
                <TouchableOpacity
                    activeOpacity={0.7}
                    className="flex-row items-center gap-1.5 bg-slate-800 rounded-2xl px-3 py-2"
                >
                    <Ionicons name="share-outline" size={16} color="#f2a72f" />
                    <Text className="text-primary text-sm font-semibold">Export</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Report Meta Card */}
                <View className="mx-5 bg-slate-900 rounded-2xl p-4 gap-3">
                    <View className="flex-row items-start justify-between">
                        <View className="flex-1 pr-3">
                            <Text className="text-white text-base font-bold">
                                42 Maple Ave — Outbound
                            </Text>
                            <Text className="text-zinc-500 text-xs mt-0.5">
                                Rental Inspection · 14 May 2026
                            </Text>
                        </View>
                        {/* Score ring — tappable */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => onNavigate("score")}
                            style={{
                                width: 56,
                                height: 56,
                                borderRadius: 28,
                                borderWidth: 2.5,
                                borderColor: SCORE_COLOR,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Text
                                style={{
                                    color: SCORE_COLOR,
                                    fontSize: 16,
                                    fontWeight: "800",
                                    lineHeight: 18,
                                }}
                            >
                                {SCORE}
                            </Text>
                            <Text
                                style={{
                                    color: SCORE_COLOR,
                                    fontSize: 8,
                                    fontWeight: "600",
                                }}
                            >
                                / 100
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {[
                        { label: "Inspector", value: "Arn Malasi" },
                        { label: "Organisation", value: "AusInspect Pty Ltd" },
                        { label: "Template", value: "Rental Inspection v2.1" },
                        { label: "GPS", value: "−37.8136, 144.9631" },
                    ].map((row) => (
                        <View
                            key={row.label}
                            className="flex-row items-center justify-between border-t border-zinc-800 pt-2"
                        >
                            <Text className="text-zinc-500 text-xs">{row.label}</Text>
                            <Text className="text-white text-xs font-medium">
                                {row.value}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Stats row */}
                <View className="flex-row mx-5 mt-3 gap-2">
                    {[
                        { value: "14", label: "Photos" },
                        { value: "6", label: "Sections" },
                        { value: "4", label: "Notes" },
                    ].map((s) => (
                        <View
                            key={s.label}
                            className="flex-1 bg-slate-900 rounded-2xl py-3 items-center"
                        >
                            <Text className="text-white text-xl font-bold">{s.value}</Text>
                            <Text className="text-zinc-500 text-xs mt-0.5">{s.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Sections label */}
                <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mx-5 mt-4 mb-2">
                    Sections
                </Text>

                {/* Section list */}
                <View className="mx-5 gap-2">
                    {PREVIEW_SECTIONS.map((section, i) => {
                        const isExpanded = expanded === i;
                        const isSkipped = section.status === "skipped";
                        return (
                            <TouchableOpacity
                                key={i}
                                activeOpacity={0.7}
                                onPress={() => setExpanded(isExpanded ? null : i)}
                                className="bg-slate-900 rounded-2xl px-4 pt-3.5 pb-3.5"
                            >
                                <View className="flex-row items-center">
                                    <View
                                        className={`w-7 h-7 rounded-full items-center justify-center mr-3 ${isSkipped ? "bg-zinc-800" : "bg-green-500/20"}`}
                                    >
                                        <Ionicons
                                            name={isSkipped ? "remove" : "checkmark"}
                                            size={14}
                                            color={isSkipped ? "#52525b" : "#22c55e"}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text
                                            className={`text-sm font-semibold ${isSkipped ? "text-zinc-500" : "text-white"}`}
                                        >
                                            {section.name}
                                        </Text>
                                        {!isSkipped && (
                                            <Text className="text-zinc-500 text-xs mt-0.5">
                                                {section.fields} fields
                                                {section.photos > 0
                                                    ? ` · ${section.photos} photos`
                                                    : ""}
                                            </Text>
                                        )}
                                    </View>
                                    <Ionicons
                                        name={isExpanded ? "chevron-up" : "chevron-down"}
                                        size={16}
                                        color="#52525b"
                                    />
                                </View>

                                {isExpanded && !isSkipped && section.notes.length > 0 && (
                                    <View className="mt-3 pt-3 border-t border-zinc-800">
                                        <Text className="text-zinc-500 text-xs mb-1">
                                            Notes
                                        </Text>
                                        <Text className="text-zinc-300 text-sm">
                                            {section.notes}
                                        </Text>
                                    </View>
                                )}

                                {isExpanded && section.photos > 0 && (
                                    <View className="flex-row gap-2 mt-3 pt-3 border-t border-zinc-800">
                                        {Array.from({ length: section.photos }).map(
                                            (_, pi) => (
                                                <View
                                                    key={pi}
                                                    className="w-14 h-14 rounded-xl bg-zinc-800 items-center justify-center"
                                                >
                                                    <Ionicons
                                                        name="image-outline"
                                                        size={18}
                                                        color="#52525b"
                                                    />
                                                </View>
                                            ),
                                        )}
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Route preview card */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onNavigate("mapsRoutes")}
                    className="mx-5 mt-3 bg-slate-900 rounded-2xl p-4 flex-row items-center gap-3"
                >
                    <View className="w-12 h-12 rounded-xl bg-primary/20 items-center justify-center">
                        <Ionicons name="map" size={22} color="#f2a72f" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white font-semibold text-sm">
                            Route recorded
                        </Text>
                        <Text className="text-zinc-500 text-xs mt-0.5">
                            4.2 km · 00:12:34 · 3 waypoints
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#52525b" />
                </TouchableOpacity>
            </ScrollView>

            {/* Bottom Actions */}
            <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-zinc-800 px-5 pb-10 pt-3 gap-2">
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => onNavigate("signature")}
                    className="border border-primary rounded-2xl py-3.5 items-center flex-row justify-center gap-2"
                >
                    <Ionicons name="create-outline" size={16} color="#f2a72f" />
                    <Text className="text-primary font-semibold text-sm">
                        Add signature
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.8}
                    className="bg-primary rounded-2xl py-3.5 items-center flex-row justify-center gap-2"
                >
                    <Ionicons name="document-text-outline" size={16} color="#ffffff" />
                    <Text className="text-white font-bold text-sm">Export as PDF</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
