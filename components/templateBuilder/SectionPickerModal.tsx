import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";

import { SYSTEM_TEMPLATES, SystemTemplate } from "@/lib/templates/systemTemplates";
import { TemplateSection } from "@/lib/types";

interface Props {
    visible: boolean;
    baseTemplateId: string;
    onClose: () => void;
    onAdd: (sections: TemplateSection[]) => void;
}

type CountMap = Record<string, number>; // key: `${templateId}__${sectionId}`

function countKey(templateId: string, sectionId: string) {
    return `${templateId}__${sectionId}`;
}

export default function SectionPickerModal({ visible, baseTemplateId, onClose, onAdd }: Props) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
    const [counts, setCounts] = useState<CountMap>({});

    const templates = SYSTEM_TEMPLATES.filter((t) => t.id !== baseTemplateId);

    const getCount = (templateId: string, sectionId: string) =>
        counts[countKey(templateId, sectionId)] ?? 0;

    const setCount = (templateId: string, sectionId: string, value: number) => {
        const key = countKey(templateId, sectionId);
        setCounts((prev) => {
            if (value <= 0) {
                const next = { ...prev };
                delete next[key];
                return next;
            }
            return { ...prev, [key]: value };
        });
    };

    const totalSections = Object.values(counts).reduce((sum, n) => sum + n, 0);

    const templateSelectedCount = (templateId: string) =>
        Object.entries(counts)
            .filter(([k]) => k.startsWith(`${templateId}__`))
            .reduce((sum, [, n]) => sum + n, 0);

    const handleAdd = () => {
        const stamp = Date.now();
        const picked: TemplateSection[] = [];
        for (const [key, count] of Object.entries(counts)) {
            const [templateId, sectionId] = key.split("__");
            const tmpl = SYSTEM_TEMPLATES.find((t) => t.id === templateId);
            const sec = tmpl?.sections.find((s) => s.id === sectionId);
            if (!sec || count < 1) continue;
            for (let i = 0; i < count; i++) {
                const idx = picked.length;
                picked.push({
                    id: `borrowed_${sectionId}_${stamp}_${idx}`,
                    name: count > 1 ? `${sec.name} ${i + 1}` : sec.name,
                    fields: sec.fields.map((f, fi) => ({
                        ...f,
                        id: `borrowed_${f.id}_${stamp}_${idx}_${fi}`,
                    })),
                });
            }
        }
        onAdd(picked);
        setCounts({});
        setExpandedTemplate(null);
    };

    const handleClose = () => {
        setCounts({});
        setExpandedTemplate(null);
        onClose();
    };

    const bg = isDark ? "#0f172a" : "#f1f5f9";
    const cardBg = isDark ? "#1e293b" : "#ffffff";
    const borderColor = isDark ? "#1e293b" : "#e2e8f0";
    const textPrimary = isDark ? "#ffffff" : "#0f172a";
    const textMuted = isDark ? "#52525b" : "#94a3b8";
    const textHint = isDark ? "#71717a" : "#64748b";
    const disabledAddBg = isDark ? "#27272a" : "#e2e8f0";
    const stepperActiveBg = isDark ? "#334155" : "#e2e8f0";
    const stepperDisabledBg = isDark ? "#1f2937" : "#f1f5f9";
    const stepperDisabledIcon = isDark ? "#374151" : "#cbd5e1";
    const stepperActiveIcon = isDark ? "#e2e8f0" : "#334155";
    const sectionNameInactive = isDark ? "#e2e8f0" : "#1e293b";

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
            <View style={{ flex: 1, backgroundColor: bg }}>
                {/* Header */}
                <View style={{
                    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
                    borderBottomWidth: 1, borderBottomColor: borderColor,
                }}>
                    <TouchableOpacity
                        onPress={handleClose}
                        style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: cardBg, alignItems: "center", justifyContent: "center" }}
                    >
                        <Ionicons name="close" size={18} color={textPrimary} />
                    </TouchableOpacity>
                    <View style={{ alignItems: "center" }}>
                        <Text style={{ color: textPrimary, fontWeight: "700", fontSize: 16 }}>Browse sections</Text>
                        {totalSections > 0 && (
                            <Text style={{ color: "#f2a72f", fontSize: 12, marginTop: 2 }}>
                                {totalSections} section{totalSections !== 1 ? "s" : ""} to add
                            </Text>
                        )}
                    </View>
                    <TouchableOpacity
                        onPress={handleAdd}
                        disabled={totalSections === 0}
                        style={{
                            backgroundColor: totalSections > 0 ? "#f2a72f" : disabledAddBg,
                            paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12,
                        }}
                    >
                        <Text style={{ color: totalSections > 0 ? "#fff" : textMuted, fontSize: 13, fontWeight: "700" }}>
                            Add {totalSections > 0 ? `(${totalSections})` : ""}
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
                >
                    <Text style={{ color: textHint, fontSize: 12, marginBottom: 16, lineHeight: 18 }}>
                        Tap a template to browse its sections. Use + / − to set how many copies of each section to add.
                    </Text>

                    {templates.map((tmpl: SystemTemplate) => {
                        const isExpanded = expandedTemplate === tmpl.id;
                        const selectedCount = templateSelectedCount(tmpl.id);

                        return (
                            <View key={tmpl.id} style={{ marginBottom: 10 }}>
                                {/* Template row */}
                                <TouchableOpacity
                                    activeOpacity={0.75}
                                    onPress={() => setExpandedTemplate(isExpanded ? null : tmpl.id)}
                                    style={{
                                        flexDirection: "row", alignItems: "center", gap: 12,
                                        backgroundColor: cardBg, borderRadius: 14, padding: 14,
                                        borderWidth: 1.5,
                                        borderColor: selectedCount > 0 ? tmpl.color + "80" : borderColor,
                                    }}
                                >
                                    <View style={{
                                        width: 38, height: 38, borderRadius: 10,
                                        backgroundColor: tmpl.color + "28",
                                        alignItems: "center", justifyContent: "center",
                                    }}>
                                        <Ionicons name={tmpl.icon as any} size={18} color={tmpl.color} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: textPrimary, fontWeight: "600", fontSize: 14 }}>{tmpl.name}</Text>
                                        <Text style={{ color: textMuted, fontSize: 12, marginTop: 2 }}>
                                            {tmpl.sections.length} section{tmpl.sections.length !== 1 ? "s" : ""}
                                            {selectedCount > 0 ? ` · ${selectedCount} queued` : ""}
                                        </Text>
                                    </View>
                                    {selectedCount > 0 && (
                                        <View style={{ backgroundColor: tmpl.color, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }}>
                                            <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>{selectedCount}</Text>
                                        </View>
                                    )}
                                    <Ionicons
                                        name={isExpanded ? "chevron-up" : "chevron-down"}
                                        size={16}
                                        color={textMuted}
                                    />
                                </TouchableOpacity>

                                {/* Sections list */}
                                {isExpanded && (
                                    <View style={{ marginTop: 4, gap: 4 }}>
                                        {tmpl.sections.map((sec) => {
                                            const count = getCount(tmpl.id, sec.id);
                                            const active = count > 0;
                                            return (
                                                <View
                                                    key={sec.id}
                                                    style={{
                                                        flexDirection: "row", alignItems: "center", gap: 12,
                                                        backgroundColor: active ? tmpl.color + "18" : cardBg,
                                                        borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
                                                        marginLeft: 12,
                                                        borderWidth: 1.5,
                                                        borderColor: active ? tmpl.color + "60" : borderColor,
                                                    }}
                                                >
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={{ color: active ? textPrimary : sectionNameInactive, fontSize: 13, fontWeight: "500" }}>
                                                            {sec.name}
                                                        </Text>
                                                        <Text style={{ color: textMuted, fontSize: 11, marginTop: 2 }}>
                                                            {sec.fields.length} field{sec.fields.length !== 1 ? "s" : ""}
                                                        </Text>
                                                    </View>

                                                    {/* Stepper */}
                                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 0 }}>
                                                        <TouchableOpacity
                                                            onPress={() => setCount(tmpl.id, sec.id, count - 1)}
                                                            disabled={count === 0}
                                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
                                                            style={{
                                                                width: 28, height: 28, borderRadius: 8,
                                                                backgroundColor: count > 0 ? stepperActiveBg : stepperDisabledBg,
                                                                alignItems: "center", justifyContent: "center",
                                                            }}
                                                        >
                                                            <Ionicons name="remove" size={14} color={count > 0 ? stepperActiveIcon : stepperDisabledIcon} />
                                                        </TouchableOpacity>

                                                        <Text style={{
                                                            color: active ? tmpl.color : textMuted,
                                                            fontWeight: "700", fontSize: 14,
                                                            minWidth: 28, textAlign: "center",
                                                        }}>
                                                            {count}
                                                        </Text>

                                                        <TouchableOpacity
                                                            onPress={() => setCount(tmpl.id, sec.id, count + 1)}
                                                            hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
                                                            style={{
                                                                width: 28, height: 28, borderRadius: 8,
                                                                backgroundColor: active ? tmpl.color : stepperActiveBg,
                                                                alignItems: "center", justifyContent: "center",
                                                            }}
                                                        >
                                                            <Ionicons name="add" size={14} color="#fff" />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </ScrollView>
            </View>
        </Modal>
    );
}
