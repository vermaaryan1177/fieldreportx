import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import BottomNavBar, { AppScreen } from "@/components/BottomNavBar";

interface Props {
    onNavigate: (screen: AppScreen) => void;
}

type ReportStatus = "Draft" | "Done" | "In Progress";

const RECENT_REPORTS: {
    id: string;
    title: string;
    type: string;
    time: string;
    status: ReportStatus;
    color: string;
}[] = [
    {
        id: "1",
        title: "12 Oak St — Inbound",
        type: "Rental Inspection",
        time: "2h ago",
        status: "Draft",
        color: "#8b5cf6",
    },
    {
        id: "2",
        title: "Elec. compliance #441",
        type: "Trades",
        time: "Yesterday",
        status: "Done",
        color: "#22c55e",
    },
    {
        id: "3",
        title: "Driver eval — Sam K.",
        type: "Driving",
        time: "3 days ago",
        status: "Done",
        color: "#f59e0b",
    },
    {
        id: "4",
        title: "Patient rehab — J. Torres",
        type: "Rehabilitation",
        time: "5 days ago",
        status: "In Progress",
        color: "#3b82f6",
    },
];

const STATUS_STYLE: Record<
    ReportStatus,
    { bg: string; text: string }
> = {
    Draft: { bg: "#ffff5b25", text: "#ffff5b" },
    Done: { bg: "#44ff0025", text: "#44ff00" },
    "In Progress": { bg: "#44d2f925", text: "#44d2f9" },
};

export default function HomeScreen({ onNavigate }: Props) {
    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-16 pb-5">
                <View>
                    <Text className="text-white text-2xl font-bold">
                        Hello, Arn
                    </Text>
                    <Text className="text-zinc-400 text-sm mt-0.5">
                        3 reports due this week
                    </Text>
                </View>
                <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                        activeOpacity={0.7}
                        className="w-9 h-9 items-center justify-center rounded-full bg-slate-800"
                    >
                        <Ionicons
                            name="notifications-outline"
                            size={20}
                            color="#f2a72f"
                        />
                    </TouchableOpacity>
                    <View className="w-10 h-10 rounded-full bg-primary items-center justify-center">
                        <Text className="text-white font-bold text-sm">AK</Text>
                    </View>
                </View>
            </View>

            {/* Stats Row */}
            <View className="flex-row mx-5 gap-3 mb-4">
                <View className="flex-1 bg-slate-900 rounded-2xl p-4">
                    <Text className="text-white text-2xl font-bold">12</Text>
                    <Text className="text-zinc-500 text-xs mt-0.5">
                        Reports this month
                    </Text>
                </View>
                <View className="flex-1 bg-slate-900 rounded-2xl p-4">
                    <Text className="text-white text-2xl font-bold">3</Text>
                    <Text className="text-zinc-500 text-xs mt-0.5">
                        In progress
                    </Text>
                </View>
            </View>

            {/* New Report CTA */}
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onNavigate("reportSetup")}
                className="bg-primary mx-5 rounded-2xl py-4 items-center mb-6"
            >
                <Text className="text-white font-bold text-base">
                    + New report
                </Text>
            </TouchableOpacity>

            {/* Section Label */}
            <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mx-5 mb-3">
                Recent Reports
            </Text>

            {/* Report List */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
            >
                <View className="gap-3">
                    {RECENT_REPORTS.map((report) => {
                        const style = STATUS_STYLE[report.status];
                        return (
                            <TouchableOpacity
                                key={report.id}
                                activeOpacity={0.7}
                                className="flex-row items-center bg-slate-900 rounded-2xl overflow-hidden"
                            >
                                {/* Left color strip */}
                                <View
                                    style={{
                                        width: 4,
                                        alignSelf: "stretch",
                                        backgroundColor: report.color,
                                    }}
                                />
                                {/* Thumbnail */}
                                <View
                                    className="w-10 h-10 rounded-xl m-3 items-center justify-center"
                                    style={{
                                        backgroundColor: report.color + "33",
                                    }}
                                >
                                    <View
                                        className="w-5 h-5 rounded"
                                        style={{ backgroundColor: report.color }}
                                    />
                                </View>
                                {/* Text */}
                                <View className="flex-1 py-3 pr-2">
                                    <Text
                                        className="text-white font-semibold text-sm"
                                        numberOfLines={1}
                                    >
                                        {report.title}
                                    </Text>
                                    <Text className="text-zinc-500 text-xs mt-0.5">
                                        {report.type} · {report.time}
                                    </Text>
                                </View>
                                {/* Status Badge */}
                                <View
                                    className="mx-3 px-2.5 py-1 rounded-full"
                                    style={{ backgroundColor: style.bg }}
                                >
                                    <Text
                                        className="text-xs font-semibold"
                                        style={{ color: style.text }}
                                    >
                                        {report.status}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            <BottomNavBar active="home" onNavigate={onNavigate} />
        </View>
    );
}
