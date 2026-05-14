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

interface Props {
    onNavigate: (screen: AppScreen) => void;
}

type Association = "organisation" | "individual";

const ORGANISATIONS = [
    "Field Inspectors Co",
    "Metro Property Group",
    "AusBuilt Services",
];

const INSPECTORS = ["Arn Khatri", "Jane Smith", "Tom Mitchell"];

export default function ReportSetupScreen({ onNavigate }: Props) {
    const [reportTitle, setReportTitle] = useState("");
    const [description, setDescription] = useState("");
    const [association, setAssociation] = useState<Association>("organisation");
    const [org, setOrg] = useState("Field Inspectors Co");
    const [showOrgPicker, setShowOrgPicker] = useState(false);
    const [reportDate, setReportDate] = useState("28 Mar 2026");
    const [inspector, setInspector] = useState("Arn Khatri");
    const [showInspectorPicker, setShowInspectorPicker] = useState(false);
    const [autoGps, setAutoGps] = useState(true);

    return (
        <View className="flex-1 bg-background">
            {/* Top Bar */}
            <View className="flex-row items-center gap-3 px-5 pt-16 pb-4">
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onNavigate("home")}
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
                <View className="bg-slate-900 rounded-2xl px-4 py-3.5 flex-row items-center mb-5">
                    <View className="w-10 h-10 rounded-xl bg-primary/20 items-center justify-center mr-3">
                        <Ionicons name="layers" size={18} color="#f2a72f" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-primary font-bold text-sm">
                            Rental inspection v1.0
                        </Text>
                        <Text className="text-zinc-500 text-xs mt-0.5">
                            8 sections
                        </Text>
                    </View>
                    <TouchableOpacity activeOpacity={0.7}>
                        <Text className="text-primary font-semibold text-sm">
                            Change
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Report Title */}
                <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2">
                    Report Title
                </Text>
                <View className="bg-slate-900 rounded-2xl px-4 h-12 justify-center mb-5">
                    <TextInput
                        className="text-white text-sm"
                        placeholder="e.g. 42 Maple Ave — Outbound"
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
                    Associate With
                </Text>
                <View className="flex-row bg-slate-900 rounded-2xl p-1 mb-3">
                    {(["organisation", "individual"] as Association[]).map(
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

                {/* Organisation Dropdown */}
                {association === "organisation" && (
                    <View className="mb-5">
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => setShowOrgPicker((v) => !v)}
                            className="bg-slate-900 rounded-2xl px-4 h-12 flex-row items-center justify-between"
                        >
                            <Text className="text-white text-sm">{org}</Text>
                            <Ionicons
                                name={
                                    showOrgPicker
                                        ? "chevron-up"
                                        : "chevron-down"
                                }
                                size={16}
                                color="#52525b"
                            />
                        </TouchableOpacity>
                        {showOrgPicker && (
                            <View className="bg-slate-900 rounded-2xl overflow-hidden mt-1 border border-zinc-800">
                                {ORGANISATIONS.map((o, i) => (
                                    <TouchableOpacity
                                        key={o}
                                        activeOpacity={0.7}
                                        onPress={() => {
                                            setOrg(o);
                                            setShowOrgPicker(false);
                                        }}
                                        className={`px-4 py-3 ${i < ORGANISATIONS.length - 1 ? "border-b border-zinc-800" : ""}`}
                                    >
                                        <Text
                                            className={`text-sm ${o === org ? "text-primary font-semibold" : "text-white"}`}
                                        >
                                            {o}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {/* Report Date */}
                <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2">
                    Report Date
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

                {/* Assigned Inspector */}
                <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2">
                    Assigned Inspector
                </Text>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setShowInspectorPicker((v) => !v)}
                    className="bg-slate-900 rounded-2xl px-4 h-12 flex-row items-center justify-between mb-2"
                >
                    <Text className="text-primary text-sm font-medium">
                        {inspector}
                    </Text>
                    <Ionicons
                        name={
                            showInspectorPicker ? "chevron-up" : "chevron-down"
                        }
                        size={16}
                        color="#52525b"
                    />
                </TouchableOpacity>
                {showInspectorPicker && (
                    <View className="bg-slate-900 rounded-2xl overflow-hidden mb-4 border border-zinc-800">
                        {INSPECTORS.map((name, i) => (
                            <TouchableOpacity
                                key={name}
                                activeOpacity={0.7}
                                onPress={() => {
                                    setInspector(name);
                                    setShowInspectorPicker(false);
                                }}
                                className={`px-4 py-3 ${i < INSPECTORS.length - 1 ? "border-b border-zinc-800" : ""}`}
                            >
                                <Text
                                    className={`text-sm ${name === inspector ? "text-primary font-semibold" : "text-white"}`}
                                >
                                    {name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Auto-capture GPS */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setAutoGps((v) => !v)}
                    className="flex-row items-center gap-3 mb-8 mt-3"
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

                {/* Begin Report */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => onNavigate("reportEditor")}
                    className="bg-primary rounded-2xl py-4 items-center"
                >
                    <Text className="text-white font-bold text-base">
                        Begin report
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
