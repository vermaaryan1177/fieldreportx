import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { createTemplate } from "@/lib/db/templates";
import { auth } from "@/lib/firebase";
import { useTemplateAd } from "@/hooks/useTemplateAd";
import { store } from "@/lib/store";
import { parseImportText, ParsedImport } from "@/lib/importTemplate";

interface Props {
    visible: boolean;
    onClose: () => void;
    onSaved: () => void;
}

const SCHEMA_HINT = `name: My Template
category: inspection
gpsValidation: false
sections:
  - name: Site Details
    fields:
      - label: Site Name
        type: text
        required: true
      - label: Photos
        type: photo
  - name: Findings
    fields:
      - label: Observations
        type: text
      - label: Severity
        type: select
        options: [Low, Medium, High]`;

export default function ImportModal({ visible, onClose, onSaved }: Props) {
    const [text, setText] = useState("");
    const [preview, setPreview] = useState<ParsedImport | null>(null);
    const [parseError, setParseError] = useState<string | null>(null);
    const [templateName, setTemplateName] = useState("");
    const [saving, setSaving] = useState(false);
    const [picking, setPicking] = useState(false);
    const { showAd } = useTemplateAd(onSaved);

    const reset = () => {
        setText("");
        setPreview(null);
        setParseError(null);
        setTemplateName("");
    };

    const handleClose = () => { reset(); onClose(); };

    const pickFile = async () => {
        setPicking(true);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/json", "text/yaml", "text/plain", "*/*"],
                copyToCacheDirectory: true,
            });
            if (result.canceled) return;
            const uri = result.assets[0].uri;
            const contents = await FileSystem.readAsStringAsync(uri);
            setText(contents);
            setPreview(null);
            setParseError(null);
        } catch (e: any) {
            Alert.alert("Could not read file", e?.message ?? "Unknown error");
        } finally {
            setPicking(false);
        }
    };

    const handleParse = () => {
        setParseError(null);
        setPreview(null);
        try {
            const result = parseImportText(text);
            setPreview(result);
            setTemplateName(result.name);
        } catch (e: any) {
            setParseError(e?.message ?? "Parse failed.");
        }
    };

    const handleSave = async () => {
        if (!preview) return;
        const name = templateName.trim();
        if (!name) {
            Alert.alert("Name required", "Please enter a template name.");
            return;
        }
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        setSaving(true);
        try {
            await createTemplate(uid, {
                name,
                category: preview.category,
                sections: preview.sections,
                gpsValidation: preview.gpsValidation,
                organisationId: store.orgTemplateMode ? (store.currentOrgId ?? null) : null,
            });
            Alert.alert(
                "Template imported",
                `"${name}" has been added to your library.`,
                [{ text: "OK", onPress: () => { reset(); showAd(); } }],
            );
        } catch (e: any) {
            Alert.alert("Save failed", e?.message ?? "Something went wrong.");
        } finally {
            setSaving(false);
        }
    };

    const totalFields = preview?.sections.reduce((n, s) => n + s.fields.length, 0) ?? 0;

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View style={{ flex: 1, backgroundColor: "#0f172a" }}>
                    {/* Header */}
                    <View style={{
                        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                        paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
                        borderBottomWidth: 1, borderBottomColor: "#1e293b",
                    }}>
                        <TouchableOpacity
                            onPress={handleClose}
                            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#1e293b", alignItems: "center", justifyContent: "center" }}
                        >
                            <Ionicons name="close" size={18} color="#fff" />
                        </TouchableOpacity>
                        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Import Template</Text>
                        <TouchableOpacity
                            onPress={pickFile}
                            disabled={picking}
                            style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#1e293b", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12 }}
                        >
                            {picking
                                ? <ActivityIndicator size="small" color="#f2a72f" />
                                : <Ionicons name="folder-open-outline" size={15} color="#f2a72f" />
                            }
                            <Text style={{ color: "#f2a72f", fontSize: 13, fontWeight: "600" }}>Pick file</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
                    >
                        {/* Paste area */}
                        <Text style={{ color: "#71717a", fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                            Paste JSON or YAML
                        </Text>
                        <View style={{ backgroundColor: "#1e293b", borderRadius: 14, borderWidth: 1, borderColor: parseError ? "#ef4444" : preview ? "#22c55e" : "#334155", marginBottom: 4 }}>
                            <TextInput
                                value={text}
                                onChangeText={(t) => { setText(t); setPreview(null); setParseError(null); }}
                                placeholder={SCHEMA_HINT}
                                placeholderTextColor="#334155"
                                multiline
                                autoCorrect={false}
                                autoCapitalize="none"
                                style={{
                                    color: "#e2e8f0",
                                    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
                                    fontSize: 12,
                                    lineHeight: 18,
                                    padding: 14,
                                    minHeight: 200,
                                    textAlignVertical: "top",
                                }}
                            />
                        </View>

                        <Text style={{ color: "#3f3f46", fontSize: 11, marginBottom: 16 }}>
                            Field types: text · number · checkbox · select · photo · signature · route · accelerometer · timer · stopwatch · joint_angle
                        </Text>

                        {parseError && (
                            <View style={{ backgroundColor: "#7f1d1d", borderRadius: 12, padding: 12, marginBottom: 16, flexDirection: "row", gap: 8 }}>
                                <Ionicons name="alert-circle" size={16} color="#fca5a5" />
                                <Text style={{ color: "#fca5a5", fontSize: 13, flex: 1, lineHeight: 18 }}>{parseError}</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handleParse}
                            disabled={!text.trim()}
                            style={{
                                backgroundColor: text.trim() ? "#f2a72f" : "#27272a",
                                borderRadius: 14,
                                paddingVertical: 14,
                                alignItems: "center",
                                marginBottom: 24,
                            }}
                        >
                            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
                                Parse &amp; Preview
                            </Text>
                        </TouchableOpacity>

                        {preview && (
                            <View>
                                <View style={{ backgroundColor: "#14532d", borderRadius: 12, padding: 12, marginBottom: 20, flexDirection: "row", alignItems: "center", gap: 8 }}>
                                    <Ionicons name="checkmark-circle" size={18} color="#4ade80" />
                                    <Text style={{ color: "#4ade80", fontSize: 13, fontWeight: "600" }}>
                                        Parsed successfully — {preview.sections.length} section{preview.sections.length !== 1 ? "s" : ""}, {totalFields} field{totalFields !== 1 ? "s" : ""}
                                    </Text>
                                </View>

                                <View style={{ backgroundColor: "#1e293b", borderRadius: 14, padding: 14, marginBottom: 20, gap: 8 }}>
                                    {preview.sections.map((sec, i) => (
                                        <View key={sec.id} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                                <View style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: "#334155", alignItems: "center", justifyContent: "center" }}>
                                                    <Text style={{ color: "#94a3b8", fontSize: 10, fontWeight: "700" }}>{i + 1}</Text>
                                                </View>
                                                <Text style={{ color: "#e2e8f0", fontSize: 13, fontWeight: "500" }}>{sec.name}</Text>
                                            </View>
                                            <Text style={{ color: "#52525b", fontSize: 12 }}>{sec.fields.length} field{sec.fields.length !== 1 ? "s" : ""}</Text>
                                        </View>
                                    ))}
                                    {preview.gpsValidation && (
                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, borderTopWidth: 1, borderTopColor: "#334155", paddingTop: 8, marginTop: 2 }}>
                                            <Ionicons name="location" size={12} color="#f2a72f" />
                                            <Text style={{ color: "#71717a", fontSize: 11 }}>GPS validation enabled</Text>
                                        </View>
                                    )}
                                </View>

                                <Text style={{ color: "#71717a", fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                                    Template name
                                </Text>
                                <View style={{ backgroundColor: "#1e293b", borderRadius: 14, paddingHorizontal: 16, height: 48, justifyContent: "center", marginBottom: 20 }}>
                                    <TextInput
                                        value={templateName}
                                        onChangeText={setTemplateName}
                                        placeholder="Template name"
                                        placeholderTextColor="#52525b"
                                        style={{ color: "#fff", fontSize: 14 }}
                                    />
                                </View>

                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    onPress={handleSave}
                                    disabled={saving || !templateName.trim()}
                                    style={{
                                        backgroundColor: templateName.trim() ? "#f2a72f" : "#27272a",
                                        borderRadius: 14,
                                        paddingVertical: 15,
                                        alignItems: "center",
                                        opacity: saving ? 0.6 : 1,
                                    }}
                                >
                                    {saving
                                        ? <ActivityIndicator color="#fff" />
                                        : <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Save to my library</Text>
                                    }
                                </TouchableOpacity>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
