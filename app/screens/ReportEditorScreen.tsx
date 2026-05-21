import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import React, { useRef, useState } from "react";
import {
    ActionSheetIOS,
    Alert,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    PanResponder,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Path, Svg } from "react-native-svg";

import { AppScreen } from "@/components/BottomNavBar";
import { store } from "@/lib/store";
import { SYSTEM_TEMPLATES } from "@/lib/templates/systemTemplates";
import { SectionStatus, TemplateField, TemplateSection } from "@/lib/types";

interface Props {
    onNavigate: (screen: AppScreen) => void;
}

type FieldValues = Record<string, string | boolean | number>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MULTILINE_KEYWORDS = [
    "notes", "description", "statement", "content", "observations",
    "comments", "recommendations", "actions", "feedback", "goals",
    "reason", "transcript", "items", "findings", "summary",
];

const DATE_KEYWORDS = [
    "date", "dob", "birth", "issued", "expiry", "expires",
    "scheduled", "inspection", "visited", "completed",
];

function isMultiline(label: string) {
    const l = label.toLowerCase();
    return MULTILINE_KEYWORDS.some((kw) => l.includes(kw));
}

function isDateField(label: string) {
    const l = label.toLowerCase();
    return DATE_KEYWORDS.some((kw) => l.includes(kw));
}

function statusColor(status: SectionStatus) {
    if (status === "completed") return "#22c55e";
    if (status === "inprogress") return "#f2a72f";
    return "#3f3f46";
}

function statusDetail(status: SectionStatus) {
    if (status === "completed") return "Completed — tap to edit";
    if (status === "inprogress") return "In progress — tap to continue";
    return "Not started";
}

// ─── Signature pad ───────────────────────────────────────────────────────────

function SignaturePad({
    onDone,
    onCancel,
}: {
    onDone: (paths: string) => void;
    onCancel: () => void;
}) {
    const [completedPaths, setCompletedPaths] = useState<string[]>([]);
    const [livePath, setLivePath] = useState("");
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const livePathRef = useRef("");

    const pan = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (e) => {
                const { locationX, locationY } = e.nativeEvent;
                livePathRef.current = `M${locationX.toFixed(1)},${locationY.toFixed(1)}`;
                setLivePath(livePathRef.current);
            },
            onPanResponderMove: (e) => {
                const { locationX, locationY } = e.nativeEvent;
                livePathRef.current += ` L${locationX.toFixed(1)},${locationY.toFixed(1)}`;
                setLivePath(livePathRef.current);
            },
            onPanResponderRelease: () => {
                // Capture BEFORE clearing — the functional updater runs after
                // the synchronous code, so livePathRef.current would be ""
                // by the time React calls the updater otherwise.
                const saved = livePathRef.current;
                livePathRef.current = "";
                setLivePath("");
                if (saved) {
                    setCompletedPaths((prev) => [...prev, saved]);
                }
            },
        }),
    ).current;

    const handleDone = () => {
        if (completedPaths.length === 0) {
            Alert.alert("No signature", "Please draw your signature first.");
            return;
        }
        onDone(completedPaths.join("|"));
    };

    return (
        <View className="flex-1 bg-background">
            <View className="flex-row items-center justify-between px-5 pt-14 pb-4 border-b border-zinc-800">
                <TouchableOpacity
                    onPress={onCancel}
                    className="w-9 h-9 rounded-full bg-slate-800 items-center justify-center"
                >
                    <Ionicons name="close" size={18} color="#fff" />
                </TouchableOpacity>
                <Text className="text-white font-bold text-base">
                    Sign here
                </Text>
                <TouchableOpacity
                    onPress={() => {
                        setCompletedPaths([]);
                        setLivePath("");
                        livePathRef.current = "";
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800"
                >
                    <Text className="text-zinc-400 text-sm">Clear</Text>
                </TouchableOpacity>
            </View>

            <Text className="text-zinc-500 text-xs text-center mt-3 mb-2">
                Draw your signature in the box below
            </Text>

            {/* Drawing surface */}
            <View
                className="mx-5 flex-1 bg-slate-900 rounded-2xl overflow-hidden border border-zinc-700"
                onLayout={(e) =>
                    setCanvasSize({
                        width: e.nativeEvent.layout.width,
                        height: e.nativeEvent.layout.height,
                    })
                }
                {...pan.panHandlers}
            >
                {canvasSize.width > 0 && (
                    <Svg width={canvasSize.width} height={canvasSize.height}>
                        {completedPaths.map((d, i) => (
                            <Path
                                key={i}
                                d={d}
                                stroke="#f2a72f"
                                strokeWidth={2.5}
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        ))}
                        {livePath !== "" && (
                            <Path
                                d={livePath}
                                stroke="#f2a72f"
                                strokeWidth={2.5}
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        )}
                    </Svg>
                )}
                {completedPaths.length === 0 && livePath === "" && (
                    <View className="absolute inset-0 items-center justify-center">
                        <Ionicons
                            name="pencil-outline"
                            size={32}
                            color="#3f3f46"
                        />
                        <Text className="text-zinc-700 text-sm mt-2">
                            Sign above
                        </Text>
                    </View>
                )}
                {/* Baseline */}
                <View
                    className="absolute left-8 right-8 h-px bg-zinc-700"
                    style={{ bottom: 60 }}
                />
            </View>

            <View className="px-5 py-5">
                <TouchableOpacity
                    onPress={handleDone}
                    activeOpacity={0.8}
                    className="bg-primary rounded-2xl py-4 items-center"
                >
                    <Text className="text-white font-bold text-base">
                        Confirm signature
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─── Field renderer ───────────────────────────────────────────────────────────

interface FieldRowProps {
    field: TemplateField;
    value: string | boolean | number | undefined;
    onChange: (value: string | boolean | number) => void;
    openSelect: string | null;
    setOpenSelect: (id: string | null) => void;
    onSignatureRequest: () => void;
}

function FieldRow({
    field,
    value,
    onChange,
    openSelect,
    setOpenSelect,
    onSignatureRequest,
}: FieldRowProps) {
    const isSelectOpen = openSelect === field.id;
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());

    // ── Photo helpers ─────────────────────────────────────────────────────────

    // Photos are stored as a JSON array string so the FieldValues type stays intact.
    const photos: string[] = (() => {
        if (!value || typeof value !== "string") return [];
        try {
            const p = JSON.parse(value);
            return Array.isArray(p) ? p : value ? [value] : [];
        } catch {
            return value ? [value] : [];
        }
    })();

    const commitPhotos = (uris: string[]) =>
        onChange(uris.length > 0 ? JSON.stringify(uris) : "");

    const launchCamera = async () => {
        const { granted } = await ImagePicker.requestCameraPermissionsAsync();
        if (!granted) {
            Alert.alert(
                "Permission required",
                "Camera access is needed to take photos.",
            );
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
        });
        if (!result.canceled)
            commitPhotos([...photos, result.assets[0].uri]);
    };

    const launchGallery = async () => {
        const { granted } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) {
            Alert.alert(
                "Permission required",
                "Photo library access is needed.",
            );
            return;
        }
        // allowsMultipleSelection lets the user pick several at once
        const result = await ImagePicker.launchImageLibraryAsync({
            allowsMultipleSelection: true,
            quality: 0.8,
        });
        if (!result.canceled)
            commitPhotos([...photos, ...result.assets.map((a) => a.uri)]);
    };

    const removePhoto = (index: number) =>
        commitPhotos(photos.filter((_, i) => i !== index));

    const handleAddPhoto = () => {
        if (Platform.OS === "ios") {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ["Take Photo", "Choose from Library", "Cancel"],
                    cancelButtonIndex: 2,
                },
                (idx) => {
                    if (idx === 0) launchCamera();
                    else if (idx === 1) launchGallery();
                },
            );
        } else {
            Alert.alert("Add photo", "Choose an option", [
                { text: "Take Photo", onPress: launchCamera },
                { text: "Choose from Library", onPress: launchGallery },
                { text: "Cancel", style: "cancel" },
            ]);
        }
    };

    // ── Date helpers ──────────────────────────────────────────────────────────

    const confirmDate = () => {
        onChange(
            tempDate.toLocaleDateString("en-AU", {
                day: "numeric",
                month: "short",
                year: "numeric",
            }),
        );
        setShowDatePicker(false);
    };

    return (
        <View className="mb-4">
            {/* Label */}
            <View className="flex-row items-center mb-1.5 gap-1">
                <Text className="text-zinc-400 text-xs font-medium">
                    {field.label}
                </Text>
                {field.required && (
                    <Text className="text-alert text-xs">*</Text>
                )}
            </View>

            {/* TEXT — date detected by label keyword */}
            {field.type === "text" && isDateField(field.label) && (
                <>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                            if (value)
                                setTempDate(
                                    new Date(String(value)) ?? new Date(),
                                );
                            setShowDatePicker(true);
                        }}
                        className="bg-slate-800 rounded-xl px-3 h-11 flex-row items-center justify-between"
                    >
                        <Text
                            className={`text-sm ${value ? "text-white" : "text-zinc-600"}`}
                        >
                            {value ? String(value) : "Select date…"}
                        </Text>
                        <Ionicons
                            name="calendar-outline"
                            size={16}
                            color="#52525b"
                        />
                    </TouchableOpacity>

                    {/* Date picker bottom sheet */}
                    <Modal
                        visible={showDatePicker}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setShowDatePicker(false)}
                    >
                        <View
                            style={{ flex: 1, justifyContent: "flex-end" }}
                        >
                            <View
                                style={{
                                    backgroundColor: "#1e293b",
                                    borderTopLeftRadius: 20,
                                    borderTopRightRadius: 20,
                                    paddingBottom: 32,
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        paddingHorizontal: 20,
                                        paddingVertical: 14,
                                        borderBottomWidth: 1,
                                        borderBottomColor: "#27272a",
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={() =>
                                            setShowDatePicker(false)
                                        }
                                    >
                                        <Text
                                            style={{
                                                color: "#71717a",
                                                fontSize: 15,
                                            }}
                                        >
                                            Cancel
                                        </Text>
                                    </TouchableOpacity>
                                    <Text
                                        style={{
                                            color: "#ffffff",
                                            fontWeight: "bold",
                                            fontSize: 15,
                                        }}
                                    >
                                        Select date
                                    </Text>
                                    <TouchableOpacity onPress={confirmDate}>
                                        <Text
                                            style={{
                                                color: "#f2a72f",
                                                fontWeight: "bold",
                                                fontSize: 15,
                                            }}
                                        >
                                            Done
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <DateTimePicker
                                    value={tempDate}
                                    mode="date"
                                    display="spinner"
                                    themeVariant="dark"
                                    onChange={(_, date) => {
                                        if (date) setTempDate(date);
                                    }}
                                    style={{ height: 200 }}
                                />
                            </View>
                        </View>
                    </Modal>
                </>
            )}

            {/* TEXT — normal multiline or single-line */}
            {field.type === "text" && !isDateField(field.label) && (
                <View
                    className={`bg-slate-800 rounded-xl px-3 ${
                        isMultiline(field.label)
                            ? "py-3"
                            : "h-11 justify-center"
                    }`}
                >
                    <TextInput
                        className="text-white text-sm"
                        value={String(value ?? "")}
                        onChangeText={onChange}
                        placeholderTextColor="#52525b"
                        placeholder="Type here…"
                        multiline={isMultiline(field.label)}
                        numberOfLines={isMultiline(field.label) ? 4 : 1}
                        textAlignVertical={
                            isMultiline(field.label) ? "top" : "center"
                        }
                        style={
                            isMultiline(field.label)
                                ? { minHeight: 88 }
                                : undefined
                        }
                    />
                </View>
            )}

            {/* NUMBER */}
            {field.type === "number" && (
                <View className="bg-slate-800 rounded-xl px-3 h-11 justify-center">
                    <TextInput
                        className="text-white text-sm"
                        value={
                            value !== undefined && value !== ""
                                ? String(value)
                                : ""
                        }
                        onChangeText={(v) => {
                            if (v === "" || v === "-") {
                                onChange(v);
                                return;
                            }
                            const n = parseFloat(v);
                            if (!isNaN(n)) onChange(n);
                        }}
                        keyboardType="numeric"
                        placeholderTextColor="#52525b"
                        placeholder="0"
                    />
                </View>
            )}

            {/* CHECKBOX */}
            {field.type === "checkbox" && (
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onChange(!(value === true))}
                    className="flex-row items-center gap-3 bg-slate-800 rounded-xl px-3 h-11"
                >
                    <View
                        className={`w-5 h-5 rounded-md border-2 items-center justify-center ${
                            value === true
                                ? "bg-primary border-primary"
                                : "border-zinc-600"
                        }`}
                    >
                        {value === true && (
                            <Ionicons
                                name="checkmark"
                                size={13}
                                color="#fff"
                            />
                        )}
                    </View>
                    <Text className="text-zinc-400 text-sm">
                        {value === true ? "Yes" : "No"}
                    </Text>
                </TouchableOpacity>
            )}

            {/* SELECT */}
            {field.type === "select" && (
                <View>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() =>
                            setOpenSelect(isSelectOpen ? null : field.id)
                        }
                        className="bg-slate-800 rounded-xl px-3 h-11 flex-row items-center justify-between"
                    >
                        <Text
                            className={`text-sm ${value ? "text-white" : "text-zinc-600"}`}
                        >
                            {String(value ?? "Select…")}
                        </Text>
                        <Ionicons
                            name={isSelectOpen ? "chevron-up" : "chevron-down"}
                            size={15}
                            color="#52525b"
                        />
                    </TouchableOpacity>
                    {isSelectOpen && (
                        <View className="bg-slate-800 rounded-xl overflow-hidden mt-1 border border-zinc-700">
                            {field.options?.map((opt, i) => (
                                <TouchableOpacity
                                    key={opt}
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        onChange(opt);
                                        setOpenSelect(null);
                                    }}
                                    className={`px-4 py-3 flex-row items-center justify-between ${
                                        i < (field.options?.length ?? 0) - 1
                                            ? "border-b border-zinc-700"
                                            : ""
                                    }`}
                                >
                                    <Text
                                        className={`text-sm ${
                                            value === opt
                                                ? "text-primary font-semibold"
                                                : "text-white"
                                        }`}
                                    >
                                        {opt}
                                    </Text>
                                    {value === opt && (
                                        <Ionicons
                                            name="checkmark"
                                            size={16}
                                            color="#f2a72f"
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            )}

            {/* PHOTO — multi-photo grid */}
            {field.type === "photo" && (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {photos.map((uri, idx) => (
                        <View
                            key={idx}
                            style={{ width: "47.5%", position: "relative" }}
                        >
                            <Image
                                source={{ uri }}
                                style={{
                                    width: "100%",
                                    height: 110,
                                    borderRadius: 10,
                                }}
                                resizeMode="cover"
                            />
                            {/* Delete button */}
                            <TouchableOpacity
                                onPress={() => removePhoto(idx)}
                                activeOpacity={0.8}
                                style={{
                                    position: "absolute",
                                    top: 5,
                                    right: 5,
                                    width: 22,
                                    height: 22,
                                    borderRadius: 11,
                                    backgroundColor: "rgba(0,0,0,0.65)",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Ionicons
                                    name="close"
                                    size={13}
                                    color="#fff"
                                />
                            </TouchableOpacity>
                        </View>
                    ))}

                    {/* Add photo tile — full-width when photos count is even, half-width otherwise */}
                    <TouchableOpacity
                        activeOpacity={0.75}
                        onPress={handleAddPhoto}
                        style={{
                            width: photos.length % 2 === 0 ? "100%" : "47.5%",
                            height: 110,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderStyle: "dashed",
                            borderColor: "#3f3f46",
                            backgroundColor: "#1e293b",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 4,
                        }}
                    >
                        <Ionicons name="camera-outline" size={22} color="#52525b" />
                        <Text style={{ color: "#52525b", fontSize: 12 }}>
                            {photos.length === 0 ? "Add photo" : "Add more"}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* SIGNATURE */}
            {field.type === "signature" && (
                <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={onSignatureRequest}
                    className={`rounded-xl h-11 flex-row items-center justify-center gap-2 border ${
                        value
                            ? "bg-primary/10 border-primary/30"
                            : "bg-slate-800 border-zinc-700"
                    }`}
                >
                    <Ionicons
                        name={value ? "checkmark-circle" : "pencil-outline"}
                        size={18}
                        color={value ? "#f2a72f" : "#71717a"}
                    />
                    <Text
                        className={`text-sm font-medium ${value ? "text-primary" : "text-zinc-500"}`}
                    >
                        {value ? "Signed — tap to redo" : "Add signature"}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

// ─── Section editor modal ─────────────────────────────────────────────────────

interface SectionEditorProps {
    section: TemplateSection;
    initialValues: FieldValues;
    onSave: (values: FieldValues) => void;
    onClose: () => void;
}

function SectionEditor({
    section,
    initialValues,
    onSave,
    onClose,
}: SectionEditorProps) {
    const [values, setValues] = useState<FieldValues>(initialValues);
    const [openSelect, setOpenSelect] = useState<string | null>(null);
    const [signatureFieldId, setSignatureFieldId] = useState<string | null>(
        null,
    );

    const setValue = (fieldId: string, value: string | boolean | number) => {
        setValues((prev) => ({ ...prev, [fieldId]: value }));
    };

    const requiredFilled = section.fields
        .filter((f) => f.required)
        .every((f) => {
            const v = values[f.id];
            return v !== undefined && v !== "" && v !== false;
        });

    return (
        // Outer View holds both the form and the signature modal as siblings,
        // so the modal is never inside KeyboardAvoidingView and can't be shifted by it.
        <View className="flex-1 bg-background">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <View className="flex-row items-center gap-3 px-5 pt-14 pb-4 border-b border-zinc-800">
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={onClose}
                        className="w-9 h-9 rounded-full bg-slate-800 items-center justify-center"
                    >
                        <Ionicons name="close" size={18} color="#ffffff" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-white font-bold text-base">
                            {section.name}
                        </Text>
                        <Text className="text-zinc-500 text-xs mt-0.5">
                            {section.fields.length} field
                            {section.fields.length !== 1 ? "s" : ""}
                            {section.fields.some((f) => f.required) &&
                                " · * required"}
                        </Text>
                    </View>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => onSave(values)}
                        className={`px-4 py-2 rounded-xl ${requiredFilled ? "bg-primary" : "bg-slate-700"}`}
                    >
                        <Text className="text-white font-semibold text-sm">
                            Done
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Fields */}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                >
                    {section.fields.map((field) => (
                        <FieldRow
                            key={field.id}
                            field={field}
                            value={values[field.id]}
                            onChange={(v) => setValue(field.id, v)}
                            openSelect={openSelect}
                            setOpenSelect={setOpenSelect}
                            onSignatureRequest={() => {
                                Keyboard.dismiss();
                                setSignatureFieldId(field.id);
                            }}
                        />
                    ))}
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Signature modal is a sibling of KeyboardAvoidingView — keyboard
                layout changes can never shift it */}
            <Modal
                visible={signatureFieldId !== null}
                animationType="slide"
                presentationStyle="fullScreen"
                onRequestClose={() => setSignatureFieldId(null)}
            >
                <SignaturePad
                    onDone={(svgPaths) => {
                        if (signatureFieldId)
                            setValue(signatureFieldId, svgPaths);
                        setSignatureFieldId(null);
                    }}
                    onCancel={() => setSignatureFieldId(null)}
                />
            </Modal>
        </View>
    );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function ReportEditorScreen({ onNavigate }: Props) {
    const template = SYSTEM_TEMPLATES.find(
        (t) => t.id === store.selectedTemplateId,
    );
    const setup = store.reportSetup;

    const [sectionStatuses, setSectionStatuses] = useState<
        Record<string, SectionStatus>
    >(() => {
        const result: Record<string, SectionStatus> = {};
        template?.sections.forEach((s) => {
            result[s.id] = store.getSectionStatus(s.id);
        });
        return result;
    });

    const [allFieldValues, setAllFieldValues] = useState<
        Record<string, FieldValues>
    >(() => {
        const result: Record<string, FieldValues> = {};
        template?.sections.forEach((s) => {
            result[s.id] = store.getFieldValues(s.id);
        });
        return result;
    });

    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

    if (!template) {
        return (
            <View className="flex-1 bg-background items-center justify-center px-8">
                <Ionicons
                    name="alert-circle-outline"
                    size={40}
                    color="#52525b"
                />
                <Text className="text-zinc-400 text-sm mt-3 text-center">
                    No template selected. Go back and choose one.
                </Text>
                <TouchableOpacity
                    onPress={() => onNavigate("templateLibrary")}
                    className="mt-5 bg-primary px-6 py-3 rounded-xl"
                >
                    <Text className="text-white font-semibold text-sm">
                        Pick a template
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    const sections = template.sections;
    const completed = Object.values(sectionStatuses).filter(
        (s) => s === "completed",
    ).length;
    const total = sections.length;
    const progress = total > 0 ? completed / total : 0;

    const openSection = (sectionId: string) => {
        if (sectionStatuses[sectionId] !== "completed") {
            setSectionStatuses((prev) => ({
                ...prev,
                [sectionId]: "inprogress",
            }));
            store.setSectionStatus(sectionId, "inprogress");
        }
        setActiveSectionId(sectionId);
    };

    const handleSaveSection = (sectionId: string, values: FieldValues) => {
        setAllFieldValues((prev) => ({ ...prev, [sectionId]: values }));
        setSectionStatuses((prev) => ({ ...prev, [sectionId]: "completed" }));
        store.setFieldValues(sectionId, values);
        store.setSectionStatus(sectionId, "completed");
        setActiveSectionId(null);
    };

    const activeSection = sections.find((s) => s.id === activeSectionId);

    return (
        <View className="flex-1 bg-background">
            {/* Top Bar */}
            <View className="flex-row items-center gap-2 px-5 pt-16 pb-3">
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onNavigate("reportSetup")}
                    className="w-9 h-9 items-center justify-center rounded-full bg-slate-800"
                >
                    <Ionicons name="arrow-back" size={18} color="#ffffff" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text
                        className="text-white text-base font-bold"
                        numberOfLines={1}
                    >
                        {setup?.title ?? template.name}
                    </Text>
                    <Text
                        className="text-zinc-500 text-xs"
                        numberOfLines={1}
                    >
                        {template.name}
                        {setup?.inspectorName
                            ? ` · ${setup.inspectorName}`
                            : ""}
                    </Text>
                </View>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onNavigate("mediaHandler")}
                    className="w-9 h-9 items-center justify-center rounded-full bg-slate-800"
                >
                    <Ionicons
                        name="camera-outline"
                        size={18}
                        color="#f2a72f"
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onNavigate("mapsRoutes")}
                    className="w-9 h-9 items-center justify-center rounded-full bg-slate-800"
                >
                    <Ionicons name="map-outline" size={18} color="#f2a72f" />
                </TouchableOpacity>
                <View className="px-2.5 py-1 rounded-full bg-tagInprogress/20">
                    <Text className="text-tagInprogress text-xs font-semibold">
                        In Progress
                    </Text>
                </View>
            </View>

            {/* Progress */}
            <View className="px-5 pb-4">
                <Text className="text-zinc-400 text-xs mb-2">
                    {completed} of {total} section
                    {total !== 1 ? "s" : ""} complete
                </Text>
                <View className="h-1.5 bg-zinc-800 rounded-full">
                    <View
                        className="h-1.5 bg-primary rounded-full"
                        style={{ width: `${progress * 100}%` }}
                    />
                </View>
            </View>

            {/* Section list */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingBottom: 16,
                }}
            >
                <View className="gap-2">
                    {sections.map((section, index) => {
                        const status =
                            sectionStatuses[section.id] ?? "notstarted";
                        const isCompleted = status === "completed";
                        const isInProgress = status === "inprogress";

                        return (
                            <TouchableOpacity
                                key={section.id}
                                activeOpacity={0.75}
                                onPress={() => openSection(section.id)}
                                className={`flex-row items-center rounded-2xl px-4 py-3.5 ${
                                    isInProgress
                                        ? "bg-primary/10 border border-primary/30"
                                        : "bg-slate-900"
                                }`}
                            >
                                {isCompleted ? (
                                    <View className="w-8 h-8 rounded-full bg-green-500/20 items-center justify-center">
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={22}
                                            color="#22c55e"
                                        />
                                    </View>
                                ) : (
                                    <View
                                        className="w-8 h-8 rounded-full border-2 items-center justify-center"
                                        style={{
                                            borderColor: statusColor(status),
                                            backgroundColor: isInProgress
                                                ? "#f2a72f20"
                                                : "transparent",
                                        }}
                                    >
                                        <Text
                                            className="text-xs font-bold"
                                            style={{
                                                color: statusColor(status),
                                            }}
                                        >
                                            {index + 1}
                                        </Text>
                                    </View>
                                )}

                                <View className="flex-1 ml-3">
                                    <Text
                                        className={`text-sm font-semibold ${
                                            status === "notstarted"
                                                ? "text-zinc-500"
                                                : "text-white"
                                        }`}
                                    >
                                        {section.name}
                                    </Text>
                                    <Text
                                        className={`text-xs mt-0.5 ${
                                            isInProgress
                                                ? "text-primary"
                                                : isCompleted
                                                  ? "text-green-500"
                                                  : "text-zinc-600"
                                        }`}
                                    >
                                        {statusDetail(status)}
                                    </Text>
                                </View>

                                <Ionicons
                                    name={
                                        isCompleted
                                            ? "create-outline"
                                            : "chevron-forward"
                                    }
                                    size={16}
                                    color={
                                        isInProgress ? "#f2a72f" : "#3f3f46"
                                    }
                                />
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Footer */}
            <View className="flex-row gap-3 px-5 pb-10 pt-3 bg-background border-t border-zinc-800">
                <TouchableOpacity
                    activeOpacity={0.7}
                    className="flex-1 bg-slate-900 border border-zinc-700 rounded-2xl py-4 items-center"
                >
                    <Text className="text-white font-semibold text-sm">
                        Save draft
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => onNavigate("reportPreview")}
                    className="flex-1 bg-primary rounded-2xl py-4 items-center"
                >
                    <Text className="text-white font-bold text-sm">
                        Continue →
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Section editor modal */}
            <Modal
                visible={activeSectionId !== null}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setActiveSectionId(null)}
            >
                {activeSection && (
                    <SectionEditor
                        section={activeSection}
                        initialValues={allFieldValues[activeSectionId!] ?? {}}
                        onSave={(values) =>
                            handleSaveSection(activeSectionId!, values)
                        }
                        onClose={() => setActiveSectionId(null)}
                    />
                )}
            </Modal>
        </View>
    );
}
