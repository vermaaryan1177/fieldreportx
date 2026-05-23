import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";

import AppHeader from "@/components/Header";
import BottomNavBar, { AppScreen } from "@/components/BottomNavBar";
import { listTemplates } from "@/lib/db/templates";
import { store } from "@/lib/store";
import { Template } from "@/lib/types";

interface Props {
    onNavigate: (screen: AppScreen) => void;
    onOpenSidebar: () => void;
    hasOrganisation?: boolean;
}

const PALETTE = ["#8b5cf6", "#22c55e", "#f59e0b", "#3b82f6", "#ef4444", "#f2a72f", "#06b6d4"];
function templateColor(name: string): string {
    let h = 0;
    for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
    return PALETTE[Math.abs(h) % PALETTE.length];
}

export default function SharedTemplatesScreen({ onNavigate, onOpenSidebar, hasOrganisation }: Props) {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const orgId = store.currentOrgId;

    useEffect(() => {
        if (!orgId) { setLoading(false); return; }
        setLoading(true);
        // listTemplates with null uid + orgId returns org-shared templates
        listTemplates("", orgId)
            .then(setTemplates)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [orgId]);

    return (
        <View className="flex-1 bg-background">
            <AppHeader onOpenSidebar={onOpenSidebar} onNavigate={onNavigate} />

            <View className="px-5 pt-5 pb-4">
                <Text className="text-white text-2xl font-bold">Org Templates</Text>
                <Text className="text-zinc-500 text-sm mt-1">Templates shared with your organisation</Text>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
                {loading ? (
                    <View className="items-center mt-16">
                        <ActivityIndicator color="#f2a72f" />
                    </View>
                ) : !orgId ? (
                    <View className="items-center mt-16 gap-3">
                        <Ionicons name="business-outline" size={48} color="#3f3f46" />
                        <Text className="text-zinc-500 text-sm">No organisation selected</Text>
                    </View>
                ) : templates.length === 0 ? (
                    <View className="items-center mt-16 gap-3">
                        <Ionicons name="albums-outline" size={48} color="#3f3f46" />
                        <Text className="text-zinc-500 text-sm">No shared templates yet</Text>
                        <Text className="text-zinc-600 text-xs text-center">
                            When you submit a report, you can share its template with the org.
                        </Text>
                    </View>
                ) : (
                    <View className="gap-3">
                        {templates.map((t) => {
                            const color = templateColor(t.name);
                            return (
                                <TouchableOpacity
                                    key={t.id}
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        store.setSelectedUserTemplate(t);
                                        store.setSelectedTemplate(`user_${t.id}`);
                                        onNavigate("reportSetup");
                                    }}
                                    className="flex-row items-center bg-slate-900 rounded-2xl overflow-hidden"
                                >
                                    <View style={{ width: 4, alignSelf: "stretch", backgroundColor: color }} />
                                    <View className="w-10 h-10 rounded-xl m-3 items-center justify-center" style={{ backgroundColor: color + "33" }}>
                                        <Ionicons name="layers" size={18} color={color} />
                                    </View>
                                    <View className="flex-1 py-3 pr-2">
                                        <Text className="text-white font-semibold text-sm" numberOfLines={1}>{t.name}</Text>
                                        <Text className="text-zinc-500 text-xs mt-0.5">
                                            {t.category} · v{t.version} · {t.sections.length} sections
                                        </Text>
                                    </View>
                                    <View className="mr-3 px-2.5 py-1 rounded-full bg-primary/10">
                                        <Text className="text-primary text-xs font-semibold">Use</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </ScrollView>

            <BottomNavBar active="sharedTemplates" onNavigate={onNavigate} hasOrganisation={hasOrganisation} />
        </View>
    );
}
