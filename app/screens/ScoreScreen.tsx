import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View, useColorScheme } from "react-native";

import { AppScreen } from "@/components/BottomNavBar";

interface Props {
    onNavigate: (screen: AppScreen) => void;
    hasOrganisation?: boolean;
}

const OVERALL = 87;
const GRADE = "B+";
const GRADE_COLOR = "#22c55e";

const SCORE_BREAKDOWN: {
    section: string;
    score: number;
    color: string;
}[] = [
    { section: "Property details", score: 100, color: "#22c55e" },
    { section: "Exterior", score: 80, color: "#22c55e" },
    { section: "Lounge / dining", score: 90, color: "#22c55e" },
    { section: "Kitchen", score: 75, color: "#f2a72f" },
    { section: "Bedrooms", score: 95, color: "#22c55e" },
    { section: "Bathroom", score: 70, color: "#f2a72f" },
    { section: "Garage", score: 0, color: "#52525b" },
];

export default function ScoreScreen({ onNavigate }: Props) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    return (
        <View className="flex-1 bg-background dark:bg-[#1e2529]">
            {/* Header */}
            <View className="flex-row items-center gap-3 px-5 pt-16 pb-4">
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onNavigate("reportPreview")}
                    className="w-9 h-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
                >
                    <Ionicons name="arrow-back" size={18} color={isDark ? "#ffffff" : "#0f172a"} />
                </TouchableOpacity>
                <Text className="text-slate-900 dark:text-white text-lg font-bold">
                    Inspection Score
                </Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 32 }}
            >
                {/* Score Circle */}
                <View className="items-center mt-4 mb-6">
                    <View
                        style={{
                            width: 160,
                            height: 160,
                            borderRadius: 80,
                            borderWidth: 6,
                            borderColor: GRADE_COLOR,
                            backgroundColor: isDark ? "#0f172a" : "#ffffff",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Text
                            style={{
                                color: GRADE_COLOR,
                                fontSize: 52,
                                fontWeight: "800",
                                lineHeight: 56,
                            }}
                        >
                            {OVERALL}
                        </Text>
                        <Text className="text-slate-400 dark:text-zinc-500 text-sm">/ 100</Text>
                    </View>

                    <View className="flex-row items-center gap-2 mt-4">
                        <View
                            style={{
                                backgroundColor: GRADE_COLOR + "25",
                                borderRadius: 20,
                                paddingHorizontal: 16,
                                paddingVertical: 6,
                            }}
                        >
                            <Text
                                style={{
                                    color: GRADE_COLOR,
                                    fontWeight: "700",
                                    fontSize: 18,
                                }}
                            >
                                {GRADE}
                            </Text>
                        </View>
                        <Text className="text-slate-500 dark:text-zinc-400 text-sm">Good condition</Text>
                    </View>
                </View>

                {/* Summary tiles */}
                <View className="flex-row mx-5 gap-2 mb-4">
                    {[
                        { label: "Sections passed", value: "5/6", color: "#22c55e" },
                        { label: "Issues flagged", value: "2", color: "#f2a72f" },
                        { label: "Photos logged", value: "14", color: "#44d2f9" },
                    ].map((s) => (
                        <View
                            key={s.label}
                            className="flex-1 bg-white dark:bg-slate-900 rounded-2xl py-3 items-center"
                        >
                            <Text
                                style={{ color: s.color }}
                                className="text-xl font-bold"
                            >
                                {s.value}
                            </Text>
                            <Text className="text-slate-400 dark:text-zinc-500 text-xs mt-0.5 text-center px-1">
                                {s.label}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Section label */}
                <Text className="text-slate-400 dark:text-zinc-500 text-xs font-semibold uppercase tracking-widest mx-5 mb-3">
                    Section breakdown
                </Text>

                {/* Breakdown bars */}
                <View className="mx-5 bg-white dark:bg-slate-900 rounded-2xl px-4 py-2">
                    {SCORE_BREAKDOWN.map((item, i) => {
                        const isSkipped = item.score === 0;
                        return (
                            <View
                                key={item.section}
                                className={`py-3 ${i < SCORE_BREAKDOWN.length - 1 ? "border-b border-slate-200 dark:border-zinc-800" : ""}`}
                            >
                                <View className="flex-row items-center justify-between mb-2">
                                    <Text
                                        className={`text-sm ${isSkipped ? "text-slate-400 dark:text-zinc-600" : "text-slate-900 dark:text-white"}`}
                                    >
                                        {item.section}
                                    </Text>
                                    <Text
                                        className={`text-sm font-bold`}
                                        style={{ color: isSkipped ? (isDark ? "#52525b" : "#94a3b8") : item.color }}
                                    >
                                        {isSkipped ? "—" : `${item.score}%`}
                                    </Text>
                                </View>
                                <View className="h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <View
                                        style={{
                                            width: `${item.score}%`,
                                            height: "100%",
                                            backgroundColor: item.color,
                                            borderRadius: 3,
                                        }}
                                    />
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Confirm button */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => onNavigate("reportPreview")}
                    className="bg-primary mx-5 mt-5 rounded-2xl py-4 items-center"
                >
                    <Text className="text-slate-900 dark:text-white font-bold text-sm">
                        Confirm &amp; add to report
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
