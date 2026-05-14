import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { AppScreen } from "@/components/BottomNavBar";

interface Props {
    onNavigate: (screen: AppScreen) => void;
}

type DiffType = "better" | "worse" | "same";

const REPORT_A = {
    title: "42 Maple Ave — Outbound",
    date: "14 May 2026",
    score: 87,
    color: "#f2a72f",
};
const REPORT_B = {
    title: "42 Maple Ave — Inbound",
    date: "2 Feb 2026",
    score: 74,
    color: "#8b5cf6",
};

const COMPARISON_ROWS: {
    label: string;
    a: string;
    b: string;
    diff: DiffType;
}[] = [
    { label: "Exterior", a: "Good", b: "Fair", diff: "better" },
    { label: "Lounge / dining", a: "Good", b: "Good", diff: "same" },
    { label: "Kitchen", a: "Fair", b: "Poor", diff: "better" },
    { label: "Bedrooms", a: "Excellent", b: "Good", diff: "better" },
    { label: "Bathroom", a: "Fair", b: "Fair", diff: "same" },
    { label: "Garage", a: "—", b: "Good", diff: "worse" },
];

const DIFF_STYLE: Record<DiffType, { color: string; icon: string }> = {
    better: { color: "#22c55e", icon: "arrow-up" },
    worse: { color: "#ef4444", icon: "arrow-down" },
    same: { color: "#52525b", icon: "remove" },
};

export default function ReportComparisonScreen({ onNavigate }: Props) {
    const [activeTab, setActiveTab] = useState<"sections" | "summary">(
        "sections",
    );

    const improved = COMPARISON_ROWS.filter((r) => r.diff === "better").length;
    const declined = COMPARISON_ROWS.filter((r) => r.diff === "worse").length;
    const scoreDelta = REPORT_A.score - REPORT_B.score;

    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <View className="flex-row items-center gap-3 px-5 pt-16 pb-4">
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onNavigate("reports")}
                    className="w-9 h-9 items-center justify-center rounded-full bg-slate-800"
                >
                    <Ionicons name="arrow-back" size={18} color="#ffffff" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold">
                    Compare Reports
                </Text>
            </View>

            {/* Report Header Cards */}
            <View className="flex-row mx-5 gap-2 mb-4">
                {[REPORT_A, REPORT_B].map((rep, i) => (
                    <View
                        key={i}
                        style={{
                            flex: 1,
                            backgroundColor: "#1e293b",
                            borderRadius: 16,
                            padding: 12,
                            borderTopWidth: 3,
                            borderTopColor: rep.color,
                        }}
                    >
                        <Text
                            className="text-white text-xs font-bold"
                            numberOfLines={1}
                        >
                            {rep.title}
                        </Text>
                        <Text className="text-zinc-500 text-xs mt-0.5">{rep.date}</Text>
                        <View className="flex-row items-baseline gap-0.5 mt-1">
                            <Text
                                style={{ color: rep.color, fontSize: 22, fontWeight: "800" }}
                            >
                                {rep.score}
                            </Text>
                            <Text className="text-zinc-500 text-xs">/100</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Tab Toggle */}
            <View className="flex-row bg-slate-900 rounded-2xl mx-5 p-1 mb-4">
                {(["sections", "summary"] as const).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        activeOpacity={0.7}
                        onPress={() => setActiveTab(tab)}
                        className={`flex-1 py-2 rounded-xl items-center ${activeTab === tab ? "bg-zinc-700" : ""}`}
                    >
                        <Text
                            className={`text-sm font-medium capitalize ${activeTab === tab ? "text-white" : "text-zinc-500"}`}
                        >
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {activeTab === "sections" ? (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
                >
                    {/* Column headers */}
                    <View className="flex-row mb-2 px-1">
                        <Text className="text-zinc-600 text-xs flex-1">Section</Text>
                        <Text className="text-zinc-600 text-xs w-20 text-center">
                            Outbound
                        </Text>
                        <Text className="text-zinc-600 text-xs w-6" />
                        <Text className="text-zinc-600 text-xs w-20 text-center">
                            Inbound
                        </Text>
                    </View>

                    <View className="bg-slate-900 rounded-2xl overflow-hidden">
                        {COMPARISON_ROWS.map((row, i) => {
                            const ds = DIFF_STYLE[row.diff];
                            return (
                                <View
                                    key={row.label}
                                    className={`flex-row items-center px-4 py-3 ${i < COMPARISON_ROWS.length - 1 ? "border-b border-zinc-800" : ""}`}
                                >
                                    <Text className="text-white text-sm flex-1">
                                        {row.label}
                                    </Text>
                                    <Text className="text-zinc-400 text-sm w-20 text-center">
                                        {row.a}
                                    </Text>
                                    <View className="w-6 items-center">
                                        <Ionicons
                                            name={ds.icon as any}
                                            size={12}
                                            color={ds.color}
                                        />
                                    </View>
                                    <Text className="text-zinc-400 text-sm w-20 text-center">
                                        {row.b}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
                >
                    {/* Improved / Declined tiles */}
                    <View className="flex-row gap-2 mb-4">
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: "#22c55e18",
                                borderRadius: 16,
                                padding: 14,
                                borderWidth: 1,
                                borderColor: "#22c55e30",
                            }}
                        >
                            <Text
                                style={{ color: "#22c55e" }}
                                className="text-2xl font-bold"
                            >
                                {improved}
                            </Text>
                            <Text style={{ color: "#22c55e" }} className="text-xs mt-0.5">
                                Sections improved
                            </Text>
                        </View>
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: "#ef444418",
                                borderRadius: 16,
                                padding: 14,
                                borderWidth: 1,
                                borderColor: "#ef444430",
                            }}
                        >
                            <Text
                                style={{ color: "#ef4444" }}
                                className="text-2xl font-bold"
                            >
                                {declined}
                            </Text>
                            <Text style={{ color: "#ef4444" }} className="text-xs mt-0.5">
                                Sections declined
                            </Text>
                        </View>
                    </View>

                    {/* Score delta card */}
                    <View className="bg-slate-900 rounded-2xl p-4 mb-4">
                        <Text className="text-zinc-400 text-xs uppercase tracking-widest font-semibold mb-4">
                            Score change
                        </Text>
                        <View className="flex-row items-center justify-between">
                            <View className="items-center">
                                <Text className="text-zinc-500 text-xs mb-1">Inbound</Text>
                                <Text className="text-white text-3xl font-bold">
                                    {REPORT_B.score}
                                </Text>
                            </View>
                            <View className="items-center gap-1">
                                <Ionicons
                                    name="arrow-forward"
                                    size={20}
                                    color="#f2a72f"
                                />
                                <View
                                    style={{
                                        backgroundColor: "#22c55e20",
                                        borderRadius: 20,
                                        paddingHorizontal: 10,
                                        paddingVertical: 3,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: "#22c55e",
                                            fontWeight: "700",
                                            fontSize: 13,
                                        }}
                                    >
                                        +{scoreDelta}
                                    </Text>
                                </View>
                            </View>
                            <View className="items-center">
                                <Text className="text-zinc-500 text-xs mb-1">
                                    Outbound
                                </Text>
                                <Text className="text-white text-3xl font-bold">
                                    {REPORT_A.score}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Key changes */}
                    <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2">
                        Key changes
                    </Text>
                    <View className="bg-slate-900 rounded-2xl overflow-hidden">
                        {[
                            {
                                icon: "arrow-up-circle",
                                color: "#22c55e",
                                text: "Kitchen improved from Poor → Fair",
                            },
                            {
                                icon: "arrow-up-circle",
                                color: "#22c55e",
                                text: "Exterior improved from Fair → Good",
                            },
                            {
                                icon: "arrow-down-circle",
                                color: "#ef4444",
                                text: "Garage no longer inspected",
                            },
                        ].map((item, i, arr) => (
                            <View
                                key={i}
                                className={`flex-row items-center gap-3 px-4 py-3.5 ${i < arr.length - 1 ? "border-b border-zinc-800" : ""}`}
                            >
                                <Ionicons
                                    name={item.icon as any}
                                    size={18}
                                    color={item.color}
                                />
                                <Text className="text-white text-sm flex-1">
                                    {item.text}
                                </Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            )}
        </View>
    );
}
