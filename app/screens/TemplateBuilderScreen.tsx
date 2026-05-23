import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { AppScreen } from "@/components/BottomNavBar";
import ImportModal from "@/components/templateBuilder/ImportModal";
import SectionsEditor from "@/components/templateBuilder/SectionsEditor";
import TypePicker from "@/components/templateBuilder/TypePicker";
import { store } from "@/lib/store";
import { SystemTemplate } from "@/lib/templates/systemTemplates";

interface Props {
    onNavigate: (screen: AppScreen) => void;
    hasOrganisation?: boolean;
}

export default function TemplateBuilderScreen({ onNavigate }: Props) {
    const [step, setStep] = useState<1 | 2>(1);
    const [baseTemplate, setBaseTemplate] = useState<SystemTemplate | null>(null);
    const [importVisible, setImportVisible] = useState(false);

    const handleBack = () => {
        if (step === 2) { setStep(1); return; }
        if (store.orgTemplateMode) {
            store.setOrgTemplateMode(false);
            onNavigate("sharedReports");
        } else {
            onNavigate("templateLibrary");
        }
    };

    const handleSaved = () => {
        const dest = store.orgTemplateMode ? "sharedReports" : "templateLibrary";
        store.setOrgTemplateMode(false);
        onNavigate(dest);
    };

    return (
        <View className="flex-1 bg-background">
            <ImportModal
                visible={importVisible}
                onClose={() => setImportVisible(false)}
                onSaved={() => { setImportVisible(false); handleSaved(); }}
            />

            {/* Top bar */}
            <View className="flex-row items-center gap-3 px-5 pt-16 pb-2">
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleBack}
                    className="w-9 h-9 items-center justify-center rounded-full bg-slate-800"
                >
                    <Ionicons name="arrow-back" size={18} color="#ffffff" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-white text-lg font-bold">Template builder</Text>
                    <Text className="text-zinc-500 text-xs">
                        Step {step} of 2 — {step === 1 ? "Choose type" : "Customise sections"}
                    </Text>
                </View>
                <View className="flex-row gap-1.5 items-center">
                    {([1, 2] as const).map((s) => (
                        <View
                            key={s}
                            className="h-2 rounded-full"
                            style={{
                                width: step === s ? 18 : 8,
                                backgroundColor: step === s ? "#f2a72f" : "#3f3f46",
                            }}
                        />
                    ))}
                </View>
            </View>

            {step === 1 ? (
                <TypePicker
                    onSelect={(t) => { setBaseTemplate(t); setStep(2); }}
                    onImport={() => setImportVisible(true)}
                />
            ) : (
                baseTemplate && (
                    <SectionsEditor baseTemplate={baseTemplate} onSaved={handleSaved} />
                )
            )}
        </View>
    );
}
