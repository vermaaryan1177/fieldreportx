import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { AppScreen } from "@/components/BottomNavBar";

interface Props {
    onNavigate: (screen: AppScreen) => void;
}

type SectionStatus = "completed" | "inprogress" | "notstarted";

interface ReportSection {
    id: number;
    name: string;
    status: SectionStatus;
    detail: string;
}

const SECTIONS: ReportSection[] = [
    {
        id: 1,
        name: "Property details",
        status: "completed",
        detail: "Completed · 5 fields",
    },
    {
        id: 2,
        name: "Exterior",
        status: "completed",
        detail: "Completed · 3 photos · GPS",
    },
    {
        id: 3,
        name: "Lounge / dining",
        status: "completed",
        detail: "Completed · 2 photos · notes",
    },
    {
        id: 4,
        name: "Kitchen",
        status: "inprogress",
        detail: "In Progress — Tap to continue",
    },
    {
        id: 5,
        name: "Bedrooms",
        status: "notstarted",
        detail: "Not started",
    },
    {
        id: 6,
        name: "Bathroom",
        status: "notstarted",
        detail: "Not started",
    },
    {
        id: 7,
        name: "Garage",
        status: "notstarted",
        detail: "Not started",
    },
    {
        id: 8,
        name: "Final inspection",
        status: "notstarted",
        detail: "Not started",
    },
];

const TOTAL = SECTIONS.length;
const COMPLETED = SECTIONS.filter((s) => s.status === "completed").length;
const INITIAL_VISIBLE = 6;

function SectionStatusIcon({ status, number }: { status: SectionStatus; number: number }) {
    if (status === "completed") {
        return (
            <View className="w-8 h-8 rounded-full bg-green-500/20 items-center justify-center">
                <Ionicons name="checkmark-circle" size={22} color="#22c55e" />
            </View>
        );
    }
    if (status === "inprogress") {
        return (
            <View className="w-8 h-8 rounded-full bg-primary items-center justify-center">
                <Text className="text-white text-xs font-bold">{number}</Text>
            </View>
        );
    }
    return (
        <View className="w-8 h-8 rounded-full border-2 border-zinc-700 items-center justify-center">
            <Text className="text-zinc-600 text-xs font-bold">{number}</Text>
        </View>
    );
}

export default function ReportEditorScreen({ onNavigate }: Props) {
    const [showAll, setShowAll] = useState(false);

    const visibleSections = showAll
        ? SECTIONS
        : SECTIONS.slice(0, INITIAL_VISIBLE);
    const hiddenCount = SECTIONS.length - INITIAL_VISIBLE;

    return (
        <View className="flex-1 bg-background">
            {/* Top Bar */}
            <View className="flex-row items-center gap-3 px-5 pt-16 pb-3">
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
                        42 Maple Ave — Outbound
                    </Text>
                </View>
                {/* Tool shortcuts */}
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
                {/* In Progress badge */}
                <View className="px-2.5 py-1 rounded-full bg-tagInprogress/20">
                    <Text className="text-tagInprogress text-xs font-semibold">
                        In Progress
                    </Text>
                </View>
            </View>

            {/* Subtitle + Progress */}
            <View className="px-5 pb-4">
                <Text className="text-zinc-400 text-xs mb-2">
                    Rental inspection · {COMPLETED} of {TOTAL} complete
                </Text>
                <View className="h-1.5 bg-zinc-700 rounded-full">
                    <View
                        className="h-1.5 bg-primary rounded-full"
                        style={{ width: `${(COMPLETED / TOTAL) * 100}%` }}
                    />
                </View>
            </View>

            {/* Section Label */}
            <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest px-5 mb-3">
                All Sections
            </Text>

            {/* Section List */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
            >
                <View className="gap-2">
                    {visibleSections.map((section) => {
                        const isInProgress = section.status === "inprogress";
                        const isCompleted = section.status === "completed";

                        return (
                            <TouchableOpacity
                                key={section.id}
                                activeOpacity={isInProgress || isCompleted ? 0.7 : 1}
                                className={`flex-row items-center rounded-2xl px-4 py-3.5 ${
                                    isInProgress
                                        ? "bg-primary/10 border border-primary/30"
                                        : "bg-slate-900"
                                }`}
                            >
                                {/* Status Icon */}
                                <SectionStatusIcon
                                    status={section.status}
                                    number={section.id}
                                />

                                {/* Text */}
                                <View className="flex-1 ml-3">
                                    <Text
                                        className={`text-sm font-semibold ${
                                            section.status === "notstarted"
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
                                                : "text-zinc-500"
                                        }`}
                                    >
                                        {section.detail}
                                    </Text>
                                </View>

                                {/* Right Action */}
                                {isCompleted && (
                                    <TouchableOpacity activeOpacity={0.7}>
                                        <Text className="text-primary text-sm font-semibold">
                                            Edit
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                {isInProgress && (
                                    <Ionicons
                                        name="arrow-forward"
                                        size={18}
                                        color="#f2a72f"
                                    />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Show more / less */}
                {hiddenCount > 0 && (
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setShowAll((v) => !v)}
                        className="bg-slate-900 rounded-2xl py-3.5 items-center mt-2"
                    >
                        <Text className="text-zinc-400 text-sm">
                            {showAll
                                ? "Show less"
                                : `+ ${hiddenCount} more section${hiddenCount > 1 ? "s" : ""}`}
                        </Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            {/* Fixed Bottom Actions */}
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
        </View>
    );
}
