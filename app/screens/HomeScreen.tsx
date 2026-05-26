import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";

import BottomNavBar, { AppScreen } from "@/components/BottomNavBar";
import AppHeader from "@/components/Header";

import { useReports } from "@/hooks/useReports";
import { STATUS_CFG } from "@/lib/constants/reportStatus";
import { getTemplate } from "@/lib/db/templates";
import { auth } from "@/lib/firebase";
import { store } from "@/lib/store";
import { templateColor } from "@/lib/utils/color";
import { timeAgo, toMs } from "@/lib/utils/time";

interface Props {
    onNavigate: (screen: AppScreen) => void;
    onOpenSidebar: () => void;
    hasOrganisation?: boolean;
}

function getInitials(name: string | null | undefined): string {
    if (!name) return "?";
    return name
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen({
    onNavigate,
    onOpenSidebar,
    hasOrganisation = false,
}: Props) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const user = auth.currentUser;
    const { reports, loading } = useReports(user?.uid);

    const firstName =
        user?.displayName?.split(" ")[0] ??
        user?.email?.split("@")[0] ??
        "there";

    const initials = getInitials(user?.displayName ?? user?.email);

    // ─── Stats ────────────────────────────────────────────────────────────────

    const now = new Date();

    const thisMonthMs = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
    ).getTime();

    const reportsThisMonth = reports.filter(
        (r) => toMs(r.createdAt) >= thisMonthMs,
    ).length;

    const inProgressCount = reports.filter(
        (r) => r.status === "inprogress",
    ).length;

    const recent = reports.slice(0, 5);

    return (
        <View className="flex-1 bg-background dark:bg-[#1e2529]">
            <AppHeader
                onOpenSidebar={onOpenSidebar}
                onNavigate={onNavigate}
                profileInitials={initials}
                active="home"
            />

            {/* Greeting */}
            <View className="flex-row items-center px-5 pt-5 pb-5">
                <View>
                    <Text className="text-slate-900 dark:text-white text-2xl font-bold">
                        Hello, {firstName}
                    </Text>

                    <Text className="text-slate-500 dark:text-zinc-400 text-sm mt-0.5">
                        {inProgressCount > 0
                            ? `${inProgressCount} report${
                                  inProgressCount !== 1 ? "s" : ""
                              } in progress`
                            : "No reports in progress"}
                    </Text>
                </View>
            </View>

            {/* Stats */}
            <View className="flex-row mx-5 gap-3 mb-4">
                <View className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-4">
                    <Text className="text-slate-900 dark:text-white text-2xl font-bold">
                        {loading ? "—" : reportsThisMonth}
                    </Text>

                    <Text className="text-slate-400 dark:text-zinc-500 text-xs mt-0.5">
                        Reports this month
                    </Text>
                </View>

                <View className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-4">
                    <Text className="text-slate-900 dark:text-white text-2xl font-bold">
                        {loading ? "—" : inProgressCount}
                    </Text>

                    <Text className="text-slate-400 dark:text-zinc-500 text-xs mt-0.5">
                        In progress
                    </Text>
                </View>
            </View>

            {/* CTA */}
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onNavigate("reportSetup")}
                className="bg-primary mx-5 rounded-2xl py-4 items-center mb-6"
            >
                <Text className="text-slate-900 dark:text-white font-bold text-base">
                    + New report
                </Text>
            </TouchableOpacity>

            {/* Label */}
            <Text className="text-slate-400 dark:text-zinc-500 text-xs font-semibold uppercase tracking-widest mx-5 mb-3">
                Recent Reports
            </Text>

            {/* Reports */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingBottom: 100,
                }}
            >
                {loading ? (
                    <View className="items-center py-10">
                        <ActivityIndicator color="#f2a72f" />
                    </View>
                ) : recent.length === 0 ? (
                    <View className="items-center py-10 gap-2">
                        <Ionicons
                            name="document-text-outline"
                            size={36}
                            color={isDark ? "#3f3f46" : "#cbd5e1"}
                        />

                        <Text className="text-slate-400 dark:text-zinc-500 text-sm">
                            No reports yet
                        </Text>

                        <TouchableOpacity
                            onPress={() => onNavigate("reportSetup")}
                            className="mt-1"
                        >
                            <Text className="text-primary text-sm font-semibold">
                                Create your first report
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="gap-3">
                        {recent.map((report) => {
                            const color = templateColor(report.templateName);

                            const cfg =
                                STATUS_CFG[report.status] ?? STATUS_CFG.draft;

                            return (
                                <TouchableOpacity
                                    key={report.id}
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        if (report.status === "draft") {
                                            store.clearReport();
                                            store.setDraftReportId(report.id);
                                            store.setSelectedTemplate(
                                                report.templateId,
                                            );
                                            store.setResumeSetup({
                                                title: report.title,
                                                description:
                                                    report.description ?? "",
                                                inspectorName:
                                                    report.inspectorName,
                                                date: new Date().toLocaleDateString(
                                                    "en-AU",
                                                    {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    },
                                                ),
                                                gpsEnabled: false,
                                                templateId: report.templateId,
                                            });
                                            if (
                                                report.templateId.startsWith(
                                                    "user_",
                                                )
                                            ) {
                                                getTemplate(report.templateId)
                                                    .then((t) => {
                                                        if (t)
                                                            store.setSelectedUserTemplate(
                                                                t,
                                                            );
                                                    })
                                                    .catch(() => {});
                                            }
                                            onNavigate("reportSetup");
                                        } else if (
                                            report.status === "inprogress"
                                        ) {
                                            store.clearReport();
                                            store.setDraftReportId(report.id);
                                            store.setSelectedTemplate(
                                                report.templateId,
                                            );
                                            store.setEditorBackScreen("home");
                                            store.setReportSetup({
                                                title: report.title,
                                                description:
                                                    report.description ?? "",
                                                inspectorName:
                                                    report.inspectorName,
                                                date: new Date().toLocaleDateString(
                                                    "en-AU",
                                                    {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    },
                                                ),
                                                gpsEnabled: false,
                                            });
                                            for (const sec of report.sections) {
                                                store.setSectionStatus(
                                                    sec.id,
                                                    sec.status,
                                                );
                                                store.setFieldValues(
                                                    sec.id,
                                                    sec.fieldValues,
                                                );
                                            }
                                            if (
                                                report.templateId.startsWith(
                                                    "user_",
                                                )
                                            ) {
                                                getTemplate(report.templateId)
                                                    .then((t) => {
                                                        if (t)
                                                            store.setSelectedUserTemplate(
                                                                t,
                                                            );
                                                    })
                                                    .catch(() => {});
                                            }
                                            onNavigate("reportEditor");
                                        } else {
                                            store.setSelectedReport(report);
                                            onNavigate("reportDetail");
                                        }
                                    }}
                                    className="flex-row items-center bg-white dark:bg-slate-900 rounded-2xl overflow-hidden"
                                >
                                    {/* Left Color Strip */}
                                    <View
                                        style={{
                                            width: 4,
                                            alignSelf: "stretch",
                                            backgroundColor: color,
                                        }}
                                    />

                                    {/* Icon */}
                                    <View
                                        className="w-10 h-10 rounded-xl m-3 items-center justify-center"
                                        style={{
                                            backgroundColor: color + "33",
                                        }}
                                    >
                                        <Ionicons
                                            name="document-text"
                                            size={18}
                                            color={color}
                                        />
                                    </View>

                                    {/* Text */}
                                    <View className="flex-1 py-3 pr-2">
                                        <Text
                                            className="text-slate-900 dark:text-white font-semibold text-sm"
                                            numberOfLines={1}
                                        >
                                            {report.title}
                                        </Text>

                                        <Text className="text-slate-400 dark:text-zinc-500 text-xs mt-0.5">
                                            {report.templateName} ·{" "}
                                            {timeAgo(report.updatedAt)}
                                        </Text>
                                    </View>

                                    {/* Status */}
                                    <View
                                        className="mx-3 px-2.5 py-1 rounded-full"
                                        style={{
                                            backgroundColor: cfg.bg,
                                        }}
                                    >
                                        <Text
                                            className="text-xs font-semibold"
                                            style={{
                                                color: cfg.text,
                                            }}
                                        >
                                            {cfg.label}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </ScrollView>

            {/* Bottom Nav */}
            <BottomNavBar
                active="home"
                onNavigate={onNavigate}
                hasOrganisation={hasOrganisation}
            />
        </View>
    );
}
