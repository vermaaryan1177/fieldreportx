import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import AppHeader from "@/components/Header";
import BottomNavBar, { AppScreen } from "@/components/BottomNavBar";
import { useAuth } from "@/hooks/useAuth";
import { useReports } from "@/hooks/useReports";
import { getTemplate } from "@/lib/db/templates";
import { store } from "@/lib/store";
import { STATUS_CFG } from "@/lib/constants/reportStatus";
import { templateColor } from "@/lib/utils/color";
import { timeAgo, toMs } from "@/lib/utils/time";

interface Props {
    onNavigate: (screen: AppScreen) => void;
    onOpenSidebar: () => void;
    hasOrganisation: boolean;
}

function getInitials(name: string | null | undefined): string {
    if (!name) return "?";
    return name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

type FilterTab = "All" | "Completed" | "In Progress" | "Draft" | "Archived";
const FILTERS: FilterTab[] = ["All", "Completed", "In Progress", "Draft", "Archived"];

const FILTER_TO_STATUS: Record<FilterTab, string | null> = {
    "All":         null,
    "Completed":   "completed",
    "In Progress": "inprogress",
    "Draft":       "draft",
    "Archived":    "archived",
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ReportListScreen({ onNavigate, onOpenSidebar,hasOrganisation }: Props) {
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
    const [comparing, setComparing] = useState<string[]>([]);

    const { user } = useAuth();
    const { reports, loading } = useReports(user?.uid);
    const initials = getInitials(user?.displayName ?? user?.email);

    const filtered = reports.filter((r) => {
        const statusFilter = FILTER_TO_STATUS[activeFilter];
        const matchFilter = statusFilter === null || r.status === statusFilter;
        const q = search.toLowerCase();
        const matchSearch =
            r.title.toLowerCase().includes(q) ||
            r.templateName.toLowerCase().includes(q);
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

    const handleCompare = () => {
        const a = reports.find((r) => r.id === comparing[0]);
        const b = reports.find((r) => r.id === comparing[1]);
        if (!a || !b) return;
        store.setComparisonReports([a, b]);
        onNavigate("reportComparison");
    };

    return (
        <View className="flex-1 bg-background">
            <AppHeader onOpenSidebar={onOpenSidebar} onNavigate={onNavigate} profileInitials={initials} active="reports" />

            <View className="px-5 pt-5 pb-4">
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-white text-2xl font-bold">Reports</Text>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => onNavigate("reportSetup")}
                        className="bg-primary rounded-2xl px-4 py-2"
                    >
                        <Text className="text-white font-bold text-sm">+ New</Text>
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
                            <Ionicons name="close-circle" size={16} color="#52525b" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Filter Tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexGrow: 0 }}
                contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 12, alignItems: "center" }}
            >
                {FILTERS.map((f) => (
                    <TouchableOpacity
                        key={f}
                        activeOpacity={0.7}
                        onPress={() => setActiveFilter(f)}
                        className={`py-1.5 rounded-xl items-center ${activeFilter === f ? "bg-primary" : "bg-slate-900"}`}
                        style={{ minWidth: 82 }}
                    >
                        <Text className={`text-sm font-medium ${activeFilter === f ? "text-white" : "text-zinc-400"}`}>
                            {f}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Compare mode banner */}
            {comparing.length > 0 && (
                <View className="mx-5 mb-3 bg-slate-800 rounded-2xl px-4 py-3 flex-row items-center justify-between">
                    <Text className="text-white text-sm font-semibold">
                        {comparing.length === 1 ? "1 selected — pick one more" : "2 selected"}
                    </Text>
                    <TouchableOpacity onPress={() => setComparing([])}>
                        <Text className="text-primary text-sm font-semibold">Cancel</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Report List */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
            >
                {loading ? (
                    <View className="items-center mt-16">
                        <ActivityIndicator color="#f2a72f" />
                    </View>
                ) : filtered.length === 0 ? (
                    <View className="items-center mt-16 gap-3">
                        <Ionicons name="document-text-outline" size={48} color="#3f3f46" />
                        <Text className="text-zinc-500 text-sm">
                            {reports.length === 0 ? "No reports yet" : "No reports match your search"}
                        </Text>
                        {reports.length === 0 && (
                            <TouchableOpacity onPress={() => onNavigate("reportSetup")} className="mt-1">
                                <Text className="text-primary text-sm font-semibold">Create your first report</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <View className="gap-3">
                        {filtered.map((report) => {
                            const color = templateColor(report.templateName);
                            const cfg = STATUS_CFG[report.status] ?? STATUS_CFG.draft;
                            const isSelected = comparing.includes(report.id);

                            return (
                                <TouchableOpacity
                                    key={report.id}
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        if (comparing.length > 0) {
                                            toggleCompare(report.id);
                                        } else if (report.status === "draft") {
                                            store.clearReport();
                                            store.setDraftReportId(report.id);
                                            store.setSelectedTemplate(report.templateId);
                                            store.setResumeSetup({
                                                title: report.title,
                                                description: report.description ?? "",
                                                inspectorName: report.inspectorName,
                                                date: new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }),
                                                gpsEnabled: false,
                                                templateId: report.templateId,
                                            });
                                            if (report.templateId.startsWith("user_")) {
                                                getTemplate(report.templateId)
                                                    .then((t) => { if (t) store.setSelectedUserTemplate(t); })
                                                    .catch(() => {});
                                            }
                                            onNavigate("reportSetup");
                                        } else if (report.status === "inprogress") {
                                            store.clearReport();
                                            store.setDraftReportId(report.id);
                                            store.setSelectedTemplate(report.templateId);
                                            store.setEditorBackScreen("reports");
                                            store.setReportSetup({
                                                title: report.title,
                                                description: report.description ?? "",
                                                inspectorName: report.inspectorName,
                                                date: new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }),
                                                gpsEnabled: false,
                                            });
                                            for (const sec of report.sections) {
                                                store.setSectionStatus(sec.id, sec.status);
                                                store.setFieldValues(sec.id, sec.fieldValues);
                                            }
                                            if (report.templateId.startsWith("user_")) {
                                                getTemplate(report.templateId)
                                                    .then((t) => { if (t) store.setSelectedUserTemplate(t); })
                                                    .catch(() => {});
                                            }
                                            onNavigate("reportEditor");
                                        } else {
                                            store.setSelectedReport(report);
                                            onNavigate("reportDetail");
                                        }
                                    }}
                                    onLongPress={() => toggleCompare(report.id)}
                                    className={`flex-row items-center bg-slate-900 rounded-2xl overflow-hidden ${isSelected ? "border border-primary" : ""}`}
                                >
                                    {/* Left color strip */}
                                    <View style={{ width: 4, alignSelf: "stretch", backgroundColor: color }} />

                                    {/* Icon */}
                                    <View
                                        className="w-10 h-10 rounded-xl m-3 items-center justify-center"
                                        style={{ backgroundColor: color + "33" }}
                                    >
                                        <Ionicons name="document-text" size={18} color={color} />
                                    </View>

                                    {/* Text */}
                                    <View className="flex-1 py-3 pr-2">
                                        <Text className="text-white font-semibold text-sm" numberOfLines={1}>
                                            {report.title}
                                        </Text>
                                        <Text className="text-zinc-500 text-xs mt-0.5">
                                            {report.templateName} · {timeAgo(report.updatedAt)}
                                        </Text>
                                    </View>

                                    {/* Score */}
                                    {report.score !== null && (
                                        <Text className="text-zinc-400 text-xs mr-2">{report.score}%</Text>
                                    )}

                                    {/* Status Badge */}
                                    <View
                                        className="mx-3 px-2.5 py-1 rounded-full"
                                        style={{ backgroundColor: cfg.bg }}
                                    >
                                        <Text className="text-xs font-semibold" style={{ color: cfg.text }}>
                                            {cfg.label}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {!loading && comparing.length === 0 && filtered.length > 1 && (
                    <Text className="text-zinc-600 text-xs text-center mt-4">
                        Long-press a report to select for comparison
                    </Text>
                )}
            </ScrollView>

            {comparing.length === 2 && (
                <View className="px-5 pb-3 bg-background">
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleCompare}
                        className="bg-primary rounded-2xl py-3.5 flex-row items-center justify-center gap-2"
                    >
                        <Ionicons name="git-compare-outline" size={18} color="#fff" />
                        <Text className="text-white font-bold text-sm">Compare 2 Reports</Text>
                    </TouchableOpacity>
                </View>
            )}

            <BottomNavBar active="reports" onNavigate={onNavigate} hasOrganisation={hasOrganisation} />
        </View>
    );
}
