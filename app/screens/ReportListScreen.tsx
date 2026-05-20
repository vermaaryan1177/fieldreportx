import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import AppHeader from "@/components/Header";
import BottomNavBar, { AppScreen } from "@/components/BottomNavBar";

interface Props {
    onNavigate: (screen: AppScreen) => void;
    onOpenSidebar: () => void;
}

type ReportStatus = "Draft" | "Done" | "In Progress";
type FilterTab = "All" | ReportStatus;

const ALL_REPORTS: {
    id: string;
    title: string;
    type: string;
    date: string;
    status: ReportStatus;
    color: string;
    score: number | null;
}[] = [
    {
        id: "1",
        title: "42 Maple Ave — Outbound",
        type: "Rental Inspection",
        date: "Today",
        status: "In Progress",
        color: "#f2a72f",
        score: null,
    },
    {
        id: "2",
        title: "12 Oak St — Inbound",
        type: "Rental Inspection",
        date: "Yesterday",
        status: "Draft",
        color: "#8b5cf6",
        score: null,
    },
    {
        id: "3",
        title: "Elec. compliance #441",
        type: "Trades",
        date: "12 May",
        status: "Done",
        color: "#22c55e",
        score: 91,
    },
    {
        id: "4",
        title: "Driver eval — Sam K.",
        type: "Driving",
        date: "10 May",
        status: "Done",
        color: "#f59e0b",
        score: 87,
    },
    {
        id: "5",
        title: "Patient rehab — J. Torres",
        type: "Rehabilitation",
        date: "9 May",
        status: "In Progress",
        color: "#3b82f6",
        score: null,
    },
    {
        id: "6",
        title: "Site safety #88",
        type: "Safety",
        date: "7 May",
        status: "Done",
        color: "#ef4444",
        score: 74,
    },
];

const STATUS_STYLE: Record<ReportStatus, { bg: string; text: string }> = {
    Draft: { bg: "#ffff5b25", text: "#ffff5b" },
    Done: { bg: "#44ff0025", text: "#44ff00" },
    "In Progress": { bg: "#44d2f925", text: "#44d2f9" },
};

const FILTERS: FilterTab[] = ["All", "In Progress", "Draft", "Done"];

export default function ReportListScreen({ onNavigate, onOpenSidebar }: Props) {
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
    const [comparing, setComparing] = useState<string[]>([]);

    const filtered = ALL_REPORTS.filter((r) => {
        const matchFilter = activeFilter === "All" || r.status === activeFilter;
        const matchSearch =
            r.title.toLowerCase().includes(search.toLowerCase()) ||
            r.type.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const toggleCompare = (id: string) => {
        setComparing((prev) =>
            prev.includes(id)
                ? prev.filter((x) => x !== id)
                : prev.length < 2
                  ? [...prev, id]
                  : prev,
        );
    };

    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <AppHeader onOpenSidebar={onOpenSidebar} onNavigate={onNavigate} profileInitials="AK" />
            <View className="px-5 pt-5 pb-4">
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-white text-2xl font-bold">
                        Reports
                    </Text>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => onNavigate("reportSetup")}
                        className="bg-primary rounded-2xl px-4 py-2"
                    >
                        <Text className="text-white font-bold text-sm">
                            + New
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View className="flex-row items-center bg-slate-900 rounded-2xl px-4 h-11 gap-2">
                    <Ionicons name="search-outline" size={16} color="#71717a" />
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Search reports…"
                        placeholderTextColor="#52525b"
                        className="flex-1 text-white text-sm"
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch("")}>
                            <Ionicons
                                name="close-circle"
                                size={16}
                                color="#52525b"
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Filter Tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexGrow: 0 }}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    gap: 8,
                    paddingBottom: 12,
                    alignItems: "center",
                }}
            >
                {FILTERS.map((f) => (
                    <TouchableOpacity
                        key={f}
                        activeOpacity={0.7}
                        onPress={() => setActiveFilter(f)}
                        className={`py-1.5 rounded-xl items-center ${activeFilter === f ? "bg-primary" : "bg-slate-900"}`}
                        style={{ minWidth: 82 }}
                    >
                        <Text
                            className={`text-sm font-medium ${activeFilter === f ? "text-white" : "text-zinc-400"}`}
                        >
                            {f}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Report List */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingBottom: 16,
                }}
            >
                {filtered.length === 0 ? (
                    <View className="items-center mt-16 gap-3">
                        <Ionicons
                            name="document-text-outline"
                            size={48}
                            color="#3f3f46"
                        />
                        <Text className="text-zinc-500 text-sm">
                            No reports found
                        </Text>
                    </View>
                ) : (
                    <View className="gap-3">
                        {filtered.map((report) => {
                            const style = STATUS_STYLE[report.status];
                            const isSelected = comparing.includes(report.id);
                            return (
                                <TouchableOpacity
                                    key={report.id}
                                    activeOpacity={0.7}
                                    onPress={() =>
                                        comparing.length > 0
                                            ? toggleCompare(report.id)
                                            : onNavigate("reportPreview")
                                    }
                                    onLongPress={() => toggleCompare(report.id)}
                                    className={`flex-row items-center bg-slate-900 rounded-2xl overflow-hidden ${isSelected ? "border border-primary" : ""}`}
                                >
                                    {/* Left color strip */}
                                    <View
                                        style={{
                                            width: 4,
                                            alignSelf: "stretch",
                                            backgroundColor: report.color,
                                        }}
                                    />
                                    {/* Icon */}
                                    <View
                                        className="w-10 h-10 rounded-xl m-3 items-center justify-center"
                                        style={{
                                            backgroundColor:
                                                report.color + "33",
                                        }}
                                    >
                                        <Ionicons
                                            name="document-text"
                                            size={18}
                                            color={report.color}
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
                                            {report.type} · {report.date}
                                        </Text>
                                    </View>
                                    {/* Score */}
                                    {report.score !== null && (
                                        <Text className="text-zinc-400 text-xs mr-2">
                                            {report.score}%
                                        </Text>
                                    )}
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
                )}

                {comparing.length === 0 && filtered.length > 1 && (
                    <Text className="text-zinc-600 text-xs text-center mt-4">
                        Long-press a report to select for comparison
                    </Text>
                )}
            </ScrollView>

            <BottomNavBar active="reports" onNavigate={onNavigate} />
        </View>
    );
}
