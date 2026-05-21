import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { DeviceMotion } from "expo-sensors";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
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
import MapView, { Marker, Polyline, Region } from "react-native-maps";
import { Path, Svg } from "react-native-svg";

import { AppScreen } from "@/components/BottomNavBar";
import { store } from "@/lib/store";
import { trackingStore, RouteFieldData, AccelFieldData } from "@/lib/trackingStore";
import { SYSTEM_TEMPLATES } from "@/lib/templates/systemTemplates";
import { SectionStatus, TemplateField, TemplateSection } from "@/lib/types";

interface Props {
    onNavigate: (screen: AppScreen) => void;
}

type FieldValues = Record<string, string | boolean | number>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MULTILINE_KEYWORDS = [
    "notes",
    "description",
    "statement",
    "content",
    "observations",
    "comments",
    "recommendations",
    "actions",
    "feedback",
    "goals",
    "reason",
    "transcript",
    "items",
    "findings",
    "summary",
];

const DATE_KEYWORDS = [
    "date",
    "dob",
    "birth",
    "issued",
    "expiry",
    "expires",
    "scheduled",
    "inspection",
    "visited",
    "completed",
];

function isMultiline(label: string) {
    const l = label.toLowerCase();
    return MULTILINE_KEYWORDS.some((kw) => l.includes(kw));
}

function isDateField(label: string) {
    const l = label.toLowerCase();
    return DATE_KEYWORDS.some((kw) => l.includes(kw));
}

const DATETIME_KEYWORDS = [
    "time started",
    "time completed",
    "start time",
    "arrival time",
    "departure time",
    "shift start time",
];

function isDateTimeField(label: string) {
    const l = label.toLowerCase();
    return DATETIME_KEYWORDS.some((kw) => l.includes(kw));
}

const LOCATION_KEYWORDS = ["location"];

function isLocationField(label: string) {
    const l = label.toLowerCase();
    return LOCATION_KEYWORDS.some((kw) => l.includes(kw));
}

// Fields that are read-only and auto-filled from accelerometer analysis
const AUTOFILL_NUMBER_LABELS = ["rms", "peak", "avg"];
function isAutoFillNumber(label: string): boolean {
    return AUTOFILL_NUMBER_LABELS.includes(label.toLowerCase().trim());
}

function formatDuration(sec: number): string {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}


function statusColor(status: SectionStatus) {
    if (status === "completed") return "#22c55e";
    if (status === "partial") return "#eab308";
    if (status === "inprogress") return "#f2a72f";
    return "#3f3f46";
}

function statusDetail(status: SectionStatus) {
    if (status === "completed") return "Completed — tap to edit";
    if (status === "partial") return "Partially completed — tap to continue";
    if (status === "inprogress") return "In progress — tap to continue";
    return "Not started";
}

function isFieldFilled(
    type: string,
    value: string | boolean | number | undefined,
): boolean {
    if (value === undefined) return false;
    if (type === "checkbox") return true; // false (No) is a valid answer
    return value !== "" && value !== false;
}

interface AnnotationStroke {
    path: string;
    color: string;
}

interface TaggedPhoto {
    uri: string;
    lat?: number;
    lng?: number;
    pitch?: number;
    roll?: number;
    azimuth?: number;
    capturedAt?: number;
    annotations?: AnnotationStroke[];
}

function azimuthLabel(deg: number): string {
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return dirs[Math.round(deg / 45) % 8];
}

function formatTimestamp(ms: number): string {
    return new Date(ms).toLocaleString("en-AU", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
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

// ─── Annotation editor ───────────────────────────────────────────────────────

const ANNOTATION_COLORS = ["#ffffff", "#ef4444", "#facc15", "#22c55e", "#60a5fa"];

function AnnotationEditor({
    photo,
    onSave,
    onCancel,
}: {
    photo: TaggedPhoto;
    onSave: (annotations: AnnotationStroke[]) => void;
    onCancel: () => void;
}) {
    const [strokes, setStrokes] = useState<AnnotationStroke[]>(photo.annotations ?? []);
    const [activeColor, setActiveColor] = useState(ANNOTATION_COLORS[0]);
    const [livePath, setLivePath] = useState("");
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const livePathRef = useRef("");
    const activeColorRef = useRef(ANNOTATION_COLORS[0]);

    const handleColorChange = (c: string) => {
        setActiveColor(c);
        activeColorRef.current = c;
    };

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
                const saved = livePathRef.current;
                const color = activeColorRef.current;
                livePathRef.current = "";
                setLivePath("");
                if (saved) setStrokes((prev) => [...prev, { path: saved, color }]);
            },
        }),
    ).current;

    const timestamp = photo.capturedAt ? formatTimestamp(photo.capturedAt) : null;

    return (
        <View style={{ flex: 1, backgroundColor: "#000" }}>
            {/* Header */}
            <View style={{
                flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
                backgroundColor: "rgba(0,0,0,0.85)",
            }}>
                <TouchableOpacity
                    onPress={onCancel}
                    style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#1e293b", alignItems: "center", justifyContent: "center" }}
                >
                    <Ionicons name="close" size={18} color="#fff" />
                </TouchableOpacity>
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>Annotate</Text>
                <TouchableOpacity
                    onPress={() => onSave(strokes)}
                    style={{ backgroundColor: "#f2a72f", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}
                >
                    <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Save</Text>
                </TouchableOpacity>
            </View>

            {/* Drawing canvas */}
            <View
                style={{ flex: 1 }}
                onLayout={(e) => setCanvasSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
                {...pan.panHandlers}
            >
                <Image
                    source={{ uri: photo.uri }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="contain"
                />
                {canvasSize.width > 0 && (
                    <Svg
                        width={canvasSize.width}
                        height={canvasSize.height}
                        style={{ position: "absolute", top: 0, left: 0 }}
                    >
                        {strokes.map((s, i) => (
                            <Path key={i} d={s.path} stroke={s.color} strokeWidth={3}
                                fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        ))}
                        {livePath !== "" && (
                            <Path d={livePath} stroke={activeColor} strokeWidth={3}
                                fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        )}
                    </Svg>
                )}
                {/* Timestamp watermark */}
                {timestamp && (
                    <View style={{
                        position: "absolute", bottom: 12, right: 12,
                        backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 6,
                        paddingHorizontal: 8, paddingVertical: 4,
                    }}>
                        <Text style={{ color: "#fff", fontSize: 11, fontWeight: "600" }}>{timestamp}</Text>
                    </View>
                )}
            </View>

            {/* Toolbar */}
            <View style={{
                backgroundColor: "rgba(0,0,0,0.9)", paddingHorizontal: 20,
                paddingVertical: 16, paddingBottom: 36,
                flexDirection: "row", alignItems: "center", justifyContent: "space-between",
            }}>
                <View style={{ flexDirection: "row", gap: 10 }}>
                    {ANNOTATION_COLORS.map((c) => (
                        <TouchableOpacity
                            key={c}
                            onPress={() => handleColorChange(c)}
                            style={{
                                width: 28, height: 28, borderRadius: 14, backgroundColor: c,
                                borderWidth: activeColor === c ? 2.5 : 1,
                                borderColor: activeColor === c ? "#f2a72f" : "rgba(255,255,255,0.25)",
                            }}
                        />
                    ))}
                </View>
                <View style={{ flexDirection: "row", gap: 12 }}>
                    <TouchableOpacity
                        onPress={() => setStrokes((prev) => prev.slice(0, -1))}
                        style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#1e293b", alignItems: "center", justifyContent: "center" }}
                    >
                        <Ionicons name="arrow-undo" size={16} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setStrokes([])}
                        style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#1e293b", alignItems: "center", justifyContent: "center" }}
                    >
                        <Ionicons name="trash-outline" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

// ─── Location picker ─────────────────────────────────────────────────────────

function LocationPicker({
    onConfirm,
    onCancel,
}: {
    onConfirm: (address: string) => void;
    onCancel: () => void;
}) {
    const [initialRegion, setInitialRegion] = useState<Region | null>(null);
    // Tracks the current map center — updated on every pan/zoom end
    const centerRef = useRef<{ latitude: number; longitude: number } | null>(null);
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(true);
    const [geocoding, setGeocoding] = useState(false);

    const doReverseGeocode = async (lat: number, lng: number) => {
        setGeocoding(true);
        try {
            const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
            if (results.length > 0) {
                const r = results[0];
                const parts = [r.streetNumber, r.street, r.district ?? r.city, r.region].filter(Boolean);
                setAddress(parts.length > 0 ? parts.join(" ") : `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
            }
        } catch {
            setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        } finally {
            setGeocoding(false);
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === "granted") {
                    const pos = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                    });
                    const { latitude, longitude } = pos.coords;
                    const region = { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };
                    setInitialRegion(region);
                    centerRef.current = { latitude, longitude };
                    await doReverseGeocode(latitude, longitude);
                } else {
                    setInitialRegion({ latitude: -33.8688, longitude: 151.2093, latitudeDelta: 0.05, longitudeDelta: 0.05 });
                }
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleConfirm = () => {
        const c = centerRef.current;
        onConfirm(address || (c ? `${c.latitude.toFixed(5)}, ${c.longitude.toFixed(5)}` : ""));
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#0f172a" }}>
            {/* Header */}
            <View style={{
                flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
                backgroundColor: "#0f172a", borderBottomWidth: 1, borderBottomColor: "#1e293b",
            }}>
                <TouchableOpacity
                    onPress={onCancel}
                    style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#1e293b", alignItems: "center", justifyContent: "center" }}
                >
                    <Ionicons name="close" size={18} color="#fff" />
                </TouchableOpacity>
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>Pick location</Text>
                <TouchableOpacity
                    onPress={handleConfirm}
                    style={{ backgroundColor: "#f2a72f", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}
                >
                    <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Confirm</Text>
                </TouchableOpacity>
            </View>

            {/* Map + fixed centre-pin overlay */}
            {loading ? (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <ActivityIndicator size="large" color="#f2a72f" />
                    <Text style={{ color: "#94a3b8", marginTop: 12, fontSize: 13 }}>Getting your location…</Text>
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    <MapView
                        style={{ flex: 1 }}
                        initialRegion={initialRegion ?? { latitude: -33.8688, longitude: 151.2093, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
                        showsUserLocation
                        showsMyLocationButton
                        onRegionChangeComplete={(region) => {
                            centerRef.current = { latitude: region.latitude, longitude: region.longitude };
                            doReverseGeocode(region.latitude, region.longitude);
                        }}
                    />
                    {/* Fixed pin at screen centre — tip aligns with exact map centre */}
                    <View
                        pointerEvents="none"
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            // Shift left by half icon width; shift up by full icon height so the tip lands on centre
                            transform: [{ translateX: -20 }, { translateY: -40 }],
                        }}
                    >
                        <Ionicons name="location" size={40} color="#f2a72f" />
                    </View>
                </View>
            )}

            {/* Address preview bar */}
            <View style={{
                backgroundColor: "#0f172a", borderTopWidth: 1, borderTopColor: "#1e293b",
                paddingHorizontal: 20, paddingVertical: 14, paddingBottom: 32,
                flexDirection: "row", alignItems: "center", gap: 10,
            }}>
                <Ionicons name="location" size={18} color="#f2a72f" />
                {geocoding ? (
                    <ActivityIndicator size="small" color="#94a3b8" />
                ) : (
                    <Text style={{ color: address ? "#fff" : "#52525b", fontSize: 13, flex: 1 }} numberOfLines={2}>
                        {address || "Pan the map to position the pin"}
                    </Text>
                )}
            </View>
        </View>
    );
}

// ─── Route tracker ───────────────────────────────────────────────────────────

function RouteTrackerField({
    value,
    onChange,
}: {
    value: string | boolean | number | undefined;
    onChange: (v: string) => void;
}) {
    const [, refresh] = useState(0);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    useEffect(() => trackingStore.subscribe(() => refresh((n) => n + 1)), []);

    // Sync a completed result that finished while the component was unmounted
    useEffect(() => {
        if (trackingStore.routeStatus === "done" && trackingStore.routeResult) {
            const serialized = JSON.stringify(trackingStore.routeResult);
            if (String(value ?? "") !== serialized) onChangeRef.current(serialized);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const savedData: RouteFieldData | null = (() => {
        if (trackingStore.routeStatus !== "idle") return null;
        if (!value || typeof value !== "string") return null;
        try { return JSON.parse(value); } catch { return null; }
    })();

    const handleStart = async () => {
        const ok = await trackingStore.startRoute();
        if (!ok) Alert.alert("Permission required", "Location access is needed for route tracking.");
    };

    const handleStop = () => {
        const result = trackingStore.stopRoute();
        onChangeRef.current(JSON.stringify(result));
    };

    const handleReset = () => {
        trackingStore.resetRoute();
        onChangeRef.current("");
    };

    // ── Active tracking ──────────────────────────────────────────────────────
    if (trackingStore.routeStatus === "tracking") {
        return (
            <View style={{ gap: 10 }}>
                <View style={{ backgroundColor: "#1e293b", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#ef444430" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#ef4444" }} />
                            <Text style={{ color: "#ef4444", fontWeight: "bold", fontSize: 13 }}>
                                Recording  ·  {formatDuration(trackingStore.routeElapsed)}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => trackingStore.cancelRoute()}>
                            <Text style={{ color: "#52525b", fontSize: 12 }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <View>
                            <Text style={{ color: "#52525b", fontSize: 11 }}>Distance</Text>
                            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 20 }}>
                                {trackingStore.routeDistance.toFixed(2)}{" "}
                                <Text style={{ fontSize: 12, fontWeight: "normal", color: "#94a3b8" }}>km</Text>
                            </Text>
                        </View>
                        <View>
                            <Text style={{ color: "#52525b", fontSize: 11 }}>Speed</Text>
                            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 20 }}>
                                {trackingStore.routeLiveSpeed}{" "}
                                <Text style={{ fontSize: 12, fontWeight: "normal", color: "#94a3b8" }}>km/h</Text>
                            </Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={handleStop}
                    activeOpacity={0.8}
                    style={{ backgroundColor: "#7f1d1d", borderWidth: 1, borderColor: "#ef444440", borderRadius: 12, paddingVertical: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
                >
                    <Ionicons name="stop-circle" size={18} color="#ef4444" />
                    <Text style={{ color: "#ef4444", fontWeight: "bold", fontSize: 15 }}>End Route</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ── Completed / saved result ─────────────────────────────────────────────
    const displayData: RouteFieldData | null =
        trackingStore.routeStatus === "done" ? trackingStore.routeResult : savedData;

    if (displayData) {
        const coords = displayData.waypoints.map((w) => ({ latitude: w.lat, longitude: w.lng }));
        const durationSec = Math.floor((displayData.endTime - displayData.startTime) / 1000);
        const first = coords[0];
        const last = coords[coords.length - 1];
        return (
            <View style={{ gap: 10 }}>
                {coords.length > 1 && first && last && (
                    <MapView
                        style={{ height: 200, borderRadius: 12 }}
                        initialRegion={{ latitude: first.latitude, longitude: first.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
                        scrollEnabled={false} zoomEnabled={false} pitchEnabled={false} rotateEnabled={false}
                    >
                        <Polyline coordinates={coords} strokeColor="#f2a72f" strokeWidth={3} />
                        <Marker coordinate={first} pinColor="green" />
                        <Marker coordinate={last} pinColor="red" />
                    </MapView>
                )}
                <View style={{ backgroundColor: "#1e293b", borderRadius: 12, padding: 16, gap: 12 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <View>
                            <Text style={{ color: "#52525b", fontSize: 11 }}>Distance</Text>
                            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>{displayData.distanceKm} km</Text>
                        </View>
                        <View>
                            <Text style={{ color: "#52525b", fontSize: 11 }}>Duration</Text>
                            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>{formatDuration(durationSec)}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <View>
                            <Text style={{ color: "#52525b", fontSize: 11 }}>Avg Speed</Text>
                            <Text style={{ color: "#22c55e", fontWeight: "bold", fontSize: 16 }}>{displayData.avgSpeedKmh} km/h</Text>
                        </View>
                        <View>
                            <Text style={{ color: "#52525b", fontSize: 11 }}>Top Speed</Text>
                            <Text style={{ color: "#ef4444", fontWeight: "bold", fontSize: 16 }}>{displayData.topSpeedKmh} km/h</Text>
                        </View>
                        <View>
                            <Text style={{ color: "#52525b", fontSize: 11 }}>Min Speed</Text>
                            <Text style={{ color: "#60a5fa", fontWeight: "bold", fontSize: 16 }}>{displayData.minSpeedKmh} km/h</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={handleReset}
                    activeOpacity={0.7}
                    style={{ backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#3f3f46", borderRadius: 12, paddingVertical: 12, alignItems: "center" }}
                >
                    <Text style={{ color: "#94a3b8", fontSize: 13, fontWeight: "600" }}>Reset & Track Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ── Idle ────────────────────────────────────────────────────────────────
    return (
        <TouchableOpacity
            onPress={handleStart}
            activeOpacity={0.8}
            style={{ backgroundColor: "#14532d", borderWidth: 1, borderColor: "#22c55e40", borderRadius: 12, paddingVertical: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
        >
            <Ionicons name="navigate" size={18} color="#22c55e" />
            <Text style={{ color: "#22c55e", fontWeight: "bold", fontSize: 15 }}>Start Route Tracking</Text>
        </TouchableOpacity>
    );
}

// ─── Accelerometer vibration field ───────────────────────────────────────────

function AccelerometerField({
    value,
    onChange,
}: {
    value: string | boolean | number | undefined;
    onChange: (v: string) => void;
}) {
    const [, refresh] = useState(0);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    useEffect(() => trackingStore.subscribe(() => refresh((n) => n + 1)), []);

    useEffect(() => {
        if (trackingStore.accelStatus === "done" && trackingStore.accelResult) {
            const serialized = JSON.stringify(trackingStore.accelResult);
            if (String(value ?? "") !== serialized) onChangeRef.current(serialized);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const savedData: AccelFieldData | null = (() => {
        if (trackingStore.accelStatus !== "idle") return null;
        if (!value || typeof value !== "string") return null;
        try { return JSON.parse(value); } catch { return null; }
    })();

    const handleStop = () => {
        const result = trackingStore.stopAccel();
        onChangeRef.current(JSON.stringify(result));
    };

    const handleReset = () => {
        trackingStore.resetAccel();
        onChangeRef.current("");
    };

    // ── Active sampling ──────────────────────────────────────────────────────
    if (trackingStore.accelStatus === "sampling") {
        return (
            <View style={{ gap: 10 }}>
                <View style={{ backgroundColor: "#1e293b", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#60a5fa30" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#60a5fa" }} />
                            <Text style={{ color: "#60a5fa", fontWeight: "bold", fontSize: 13 }}>
                                Sampling  ·  {formatDuration(trackingStore.accelElapsed)}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => trackingStore.cancelAccel()}>
                            <Text style={{ color: "#52525b", fontSize: 12 }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <View>
                            <Text style={{ color: "#52525b", fontSize: 11 }}>Samples</Text>
                            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 20 }}>{trackingStore.accelSampleCount}</Text>
                        </View>
                        <View>
                            <Text style={{ color: "#52525b", fontSize: 11 }}>Live Magnitude</Text>
                            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 20 }}>
                                {trackingStore.accelLiveMag}{" "}
                                <Text style={{ fontSize: 12, fontWeight: "normal", color: "#94a3b8" }}>g</Text>
                            </Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={handleStop}
                    activeOpacity={0.8}
                    style={{ backgroundColor: "#1e3a5f", borderWidth: 1, borderColor: "#60a5fa40", borderRadius: 12, paddingVertical: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
                >
                    <Ionicons name="stop-circle" size={18} color="#60a5fa" />
                    <Text style={{ color: "#60a5fa", fontWeight: "bold", fontSize: 15 }}>Stop Analysis</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ── Completed / saved result ─────────────────────────────────────────────
    const displayData: AccelFieldData | null =
        trackingStore.accelStatus === "done" ? trackingStore.accelResult : savedData;

    if (displayData) {
        const catColor =
            displayData.category === "Smooth" ? "#22c55e" :
            displayData.category === "Moderate" ? "#f2a72f" :
            displayData.category === "Rough" ? "#f97316" : "#ef4444";
        return (
            <View style={{ gap: 10 }}>
                <View style={{ backgroundColor: "#1e293b", borderRadius: 12, padding: 16, gap: 12 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={{ color: "#94a3b8", fontSize: 12 }}>
                            {formatDuration(displayData.durationSec)} · {trackingStore.accelSampleCount || "saved"} samples
                        </Text>
                        <View style={{ backgroundColor: catColor + "20", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                            <Text style={{ color: catColor, fontWeight: "bold", fontSize: 13 }}>{displayData.category}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <View>
                            <Text style={{ color: "#52525b", fontSize: 11 }}>RMS</Text>
                            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>{displayData.rms} g</Text>
                        </View>
                        <View>
                            <Text style={{ color: "#52525b", fontSize: 11 }}>Peak</Text>
                            <Text style={{ color: "#ef4444", fontWeight: "bold", fontSize: 16 }}>{displayData.peak} g</Text>
                        </View>
                        <View>
                            <Text style={{ color: "#52525b", fontSize: 11 }}>Avg</Text>
                            <Text style={{ color: "#60a5fa", fontWeight: "bold", fontSize: 16 }}>{displayData.avgMagnitude} g</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={handleReset}
                    activeOpacity={0.7}
                    style={{ backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#3f3f46", borderRadius: 12, paddingVertical: 12, alignItems: "center" }}
                >
                    <Text style={{ color: "#94a3b8", fontSize: 13, fontWeight: "600" }}>Reset & Analyse Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ── Idle ────────────────────────────────────────────────────────────────
    return (
        <TouchableOpacity
            onPress={() => trackingStore.startAccel()}
            activeOpacity={0.8}
            style={{ backgroundColor: "#1e3a5f", borderWidth: 1, borderColor: "#60a5fa40", borderRadius: 12, paddingVertical: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
        >
            <Ionicons name="pulse-outline" size={18} color="#60a5fa" />
            <Text style={{ color: "#60a5fa", fontWeight: "bold", fontSize: 15 }}>Start Vibration Analysis</Text>
        </TouchableOpacity>
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
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());
    const [annotatingIdx, setAnnotatingIdx] = useState<number | null>(null);
    const [locationPickerOpen, setLocationPickerOpen] = useState(false);

    // ── Gyroscope ─────────────────────────────────────────────────────────────
    const motionRef = useRef<{ pitch: number; roll: number; azimuth: number } | null>(null);

    useEffect(() => {
        if (!field.gyroCapture) return;
        DeviceMotion.setUpdateInterval(100);
        const sub = DeviceMotion.addListener(({ rotation }) => {
            if (!rotation) return;
            const toDeg = (r: number) => Math.round(r * (180 / Math.PI));
            motionRef.current = {
                pitch: toDeg(rotation.beta ?? 0),
                roll: toDeg(rotation.gamma ?? 0),
                azimuth: ((toDeg(rotation.alpha ?? 0)) + 360) % 360,
            };
        });
        return () => sub.remove();
    }, [field.gyroCapture]);

    // ── Photo helpers ─────────────────────────────────────────────────────────

    // Photos stored as JSON array of TaggedPhoto objects; legacy string-only arrays are upgraded transparently.
    const photos: TaggedPhoto[] = (() => {
        if (!value || typeof value !== "string") return [];
        try {
            const p = JSON.parse(value);
            if (!Array.isArray(p)) return [];
            return p.map((item: unknown) =>
                typeof item === "string" ? { uri: item } : (item as TaggedPhoto),
            );
        } catch {
            return typeof value === "string" && value ? [{ uri: value }] : [];
        }
    })();

    const commitPhotos = (tagged: TaggedPhoto[]) =>
        onChange(tagged.length > 0 ? JSON.stringify(tagged) : "");

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
        if (result.canceled) return;

        const uri = result.assets[0].uri;
        let lat: number | undefined;
        let lng: number | undefined;
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === "granted") {
                const pos = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                lat = pos.coords.latitude;
                lng = pos.coords.longitude;
            }
        } catch {
            // GPS unavailable — photo saved without coordinates
        }
        const motion = field.gyroCapture ? motionRef.current : null;
        commitPhotos([...photos, {
            uri,
            lat,
            lng,
            capturedAt: Date.now(),
            ...(motion ? { pitch: motion.pitch, roll: motion.roll, azimuth: motion.azimuth } : {}),
        }]);
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
            commitPhotos([...photos, ...result.assets.map((a) => ({ uri: a.uri, capturedAt: Date.now() }))]);
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

    // ── Voice helpers ─────────────────────────────────────────────────────────

    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isTranscribing, setIsTranscribing] = useState(false);

    const startRecording = async () => {
        try {
            const { granted } = await Audio.requestPermissionsAsync();
            if (!granted) {
                Alert.alert("Permission required", "Microphone access is needed for voice input.");
                return;
            }
            await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
            const { recording: rec } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY,
            );
            setRecording(rec);
        } catch {
            Alert.alert("Error", "Could not start recording.");
        }
    };

    const stopAndTranscribe = async () => {
        if (!recording) return;
        try {
            await recording.stopAndUnloadAsync();
            await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
            const uri = recording.getURI();
            setRecording(null);
            if (!uri) return;

            setIsTranscribing(true);
            const apiKey = (process.env.EXPO_PUBLIC_GROQ_API_KEY ?? "").replace(/^["']|["']$/g, "").trim();
            if (!apiKey) {
                Alert.alert("Setup required", "Add EXPO_PUBLIC_GROQ_API_KEY to your .env file.");
                return;
            }

            const formData = new FormData();
            formData.append("file", { uri, type: "audio/m4a", name: "recording.m4a" } as any);
            formData.append("model", "whisper-large-v3");

            const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
                method: "POST",
                headers: { Authorization: `Bearer ${apiKey}` },
                body: formData,
            });
            if (!res.ok) {
                const body = await res.text();
                throw new Error(`${res.status}: ${body}`);
            }
            const { text } = await res.json();
            if (text?.trim()) {
                const current = String(value ?? "").trim();
                onChange(current ? `${current} ${text.trim()}` : text.trim());
            }
        } catch (err: any) {
            Alert.alert("Transcription failed", err?.message ?? "Unknown error");
        } finally {
            setIsTranscribing(false);
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

            {/* TEXT — location (map picker) */}
            {field.type === "text" && isLocationField(field.label) && (
                <>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setLocationPickerOpen(true)}
                        className="bg-slate-800 rounded-xl px-3 h-11 flex-row items-center justify-between"
                    >
                        <Text className={`text-sm flex-1 mr-2 ${value ? "text-white" : "text-zinc-600"}`} numberOfLines={1}>
                            {value ? String(value) : "Select on map…"}
                        </Text>
                        <Ionicons name="map-outline" size={16} color="#52525b" />
                    </TouchableOpacity>

                    <Modal
                        visible={locationPickerOpen}
                        animationType="slide"
                        presentationStyle="fullScreen"
                        onRequestClose={() => setLocationPickerOpen(false)}
                    >
                        <LocationPicker
                            onConfirm={(address) => {
                                onChange(address);
                                setLocationPickerOpen(false);
                            }}
                            onCancel={() => setLocationPickerOpen(false)}
                        />
                    </Modal>
                </>
            )}

            {/* TEXT — datetime (date + time picker) */}
            {field.type === "text" && isDateTimeField(field.label) && (
                <>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                            if (value) {
                                const parsed = new Date(String(value));
                                setTempDate(isNaN(parsed.getTime()) ? new Date() : parsed);
                            }
                            setShowDatePicker(true);
                        }}
                        className="bg-slate-800 rounded-xl px-3 h-11 flex-row items-center justify-between"
                    >
                        <Text className={`text-sm ${value ? "text-white" : "text-zinc-600"}`}>
                            {value ? String(value) : "Select date & time…"}
                        </Text>
                        <Ionicons name="time-outline" size={16} color="#52525b" />
                    </TouchableOpacity>

                    {Platform.OS === "ios" ? (
                        <Modal
                            visible={showDatePicker}
                            transparent
                            animationType="slide"
                            onRequestClose={() => setShowDatePicker(false)}
                        >
                            <View style={{ flex: 1, justifyContent: "flex-end" }}>
                                <View style={{
                                    backgroundColor: "#1e293b",
                                    borderTopLeftRadius: 20,
                                    borderTopRightRadius: 20,
                                    paddingBottom: 32,
                                }}>
                                    <View style={{
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        paddingHorizontal: 20,
                                        paddingVertical: 14,
                                        borderBottomWidth: 1,
                                        borderBottomColor: "#27272a",
                                    }}>
                                        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                            <Text style={{ color: "#71717a", fontSize: 15 }}>Cancel</Text>
                                        </TouchableOpacity>
                                        <Text style={{ color: "#ffffff", fontWeight: "bold", fontSize: 15 }}>
                                            Date & Time
                                        </Text>
                                        <TouchableOpacity onPress={() => {
                                            onChange(tempDate.toLocaleString("en-AU", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            }));
                                            setShowDatePicker(false);
                                        }}>
                                            <Text style={{ color: "#f2a72f", fontWeight: "bold", fontSize: 15 }}>Done</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <DateTimePicker
                                        value={tempDate}
                                        mode="datetime"
                                        display="spinner"
                                        themeVariant="dark"
                                        onChange={(_, date) => { if (date) setTempDate(date); }}
                                        style={{ height: 200 }}
                                    />
                                </View>
                            </View>
                        </Modal>
                    ) : (
                        <>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={tempDate}
                                    mode="date"
                                    display="default"
                                    onChange={(_, date) => {
                                        setShowDatePicker(false);
                                        if (date) {
                                            setTempDate(date);
                                            setShowTimePicker(true);
                                        }
                                    }}
                                />
                            )}
                            {showTimePicker && (
                                <DateTimePicker
                                    value={tempDate}
                                    mode="time"
                                    display="default"
                                    onChange={(_, date) => {
                                        setShowTimePicker(false);
                                        if (date) {
                                            setTempDate(date);
                                            onChange(date.toLocaleString("en-AU", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            }));
                                        }
                                    }}
                                />
                            )}
                        </>
                    )}
                </>
            )}

            {/* TEXT — date detected by label keyword */}
            {field.type === "text" && isDateField(field.label) && !isDateTimeField(field.label) && (
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
                        <View style={{ flex: 1, justifyContent: "flex-end" }}>
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
                                        onPress={() => setShowDatePicker(false)}
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

            {/* TEXT — single-line (mic icon at right) */}
            {field.type === "text" && !isLocationField(field.label) && !isDateTimeField(field.label) && !isDateField(field.label) && !isMultiline(field.label) && (
                <View className="bg-slate-800 rounded-xl px-3 h-11 flex-row items-center">
                    <TextInput
                        className="text-white text-sm flex-1"
                        value={String(value ?? "")}
                        onChangeText={onChange}
                        placeholderTextColor="#52525b"
                        placeholder="Type here…"
                        numberOfLines={1}
                        textAlignVertical="center"
                    />
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={recording ? stopAndTranscribe : startRecording}
                        disabled={isTranscribing}
                        style={{ paddingLeft: 10 }}
                    >
                        {isTranscribing ? (
                            <ActivityIndicator size="small" color="#f2a72f" />
                        ) : recording ? (
                            <Ionicons name="stop-circle" size={20} color="#ef4444" />
                        ) : (
                            <Ionicons name="mic-outline" size={20} color="#52525b" />
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {/* TEXT — multiline (Dictate button below textarea) */}
            {field.type === "text" && !isLocationField(field.label) && !isDateTimeField(field.label) && !isDateField(field.label) && isMultiline(field.label) && (
                <View className="bg-slate-800 rounded-xl px-3 py-3">
                    <TextInput
                        className="text-white text-sm"
                        value={String(value ?? "")}
                        onChangeText={onChange}
                        placeholderTextColor="#52525b"
                        placeholder="Type here…"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        style={{ minHeight: 88 }}
                    />
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "flex-end",
                            marginTop: 8,
                            paddingTop: 8,
                            borderTopWidth: 1,
                            borderTopColor: "#27272a",
                        }}
                    >
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={recording ? stopAndTranscribe : startRecording}
                            disabled={isTranscribing}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 6,
                                backgroundColor: "#1e293b",
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: recording ? "#ef444440" : "#3f3f46",
                            }}
                        >
                            {isTranscribing ? (
                                <>
                                    <ActivityIndicator size="small" color="#f2a72f" />
                                    <Text style={{ color: "#f2a72f", fontSize: 12 }}>Transcribing…</Text>
                                </>
                            ) : recording ? (
                                <>
                                    <Ionicons name="stop-circle" size={14} color="#ef4444" />
                                    <Text style={{ color: "#ef4444", fontSize: 12, fontWeight: "600" }}>Stop recording</Text>
                                </>
                            ) : (
                                <>
                                    <Ionicons name="mic-outline" size={14} color="#94a3b8" />
                                    <Text style={{ color: "#94a3b8", fontSize: 12 }}>Dictate</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* NUMBER — read-only auto-fill (RMS / Peak / Avg from accelerometer) */}
            {field.type === "number" && isAutoFillNumber(field.label) && (
                <View
                    className="bg-slate-800 rounded-xl px-3 h-11 flex-row items-center justify-between"
                    style={{ opacity: 0.7 }}
                >
                    <Text style={{ color: value !== undefined && value !== "" ? "#fff" : "#3f3f46", fontSize: 14 }}>
                        {value !== undefined && value !== "" ? String(value) : "—"}
                    </Text>
                    <Ionicons name="flash-outline" size={13} color="#3f3f46" />
                </View>
            )}

            {/* NUMBER — editable */}
            {field.type === "number" && !isAutoFillNumber(field.label) && (
                <View className="bg-slate-800 rounded-xl px-3 h-11 justify-center">
                    <TextInput
                        className="text-white text-sm"
                        value={value !== undefined && value !== "" ? String(value) : ""}
                        onChangeText={(v) => {
                            if (v === "" || v === "-") { onChange(v); return; }
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
                            <Ionicons name="checkmark" size={13} color="#fff" />
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
                <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                    {photos.map((photo, idx) => (
                        <View
                            key={idx}
                            style={{ width: "47.5%", position: "relative" }}
                        >
                            <Image
                                source={{ uri: photo.uri }}
                                style={{
                                    width: "100%",
                                    height: 110,
                                    borderRadius: 10,
                                }}
                                resizeMode="cover"
                            />
                            {/* Gyro badge */}
                            {photo.pitch !== undefined && (
                                <View
                                    style={{
                                        position: "absolute",
                                        bottom: photo.lat !== undefined ? 28 : 5,
                                        left: 5,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        backgroundColor: "rgba(0,0,0,0.65)",
                                        borderRadius: 6,
                                        paddingHorizontal: 5,
                                        paddingVertical: 2,
                                        gap: 3,
                                    }}
                                >
                                    <Ionicons name="compass-outline" size={9} color="#60a5fa" />
                                    <Text style={{ color: "#60a5fa", fontSize: 8, fontWeight: "600" }}>
                                        {azimuthLabel(photo.azimuth ?? 0)} · {photo.pitch}° · {photo.roll}°
                                    </Text>
                                </View>
                            )}
                            {/* GPS badge */}
                            {photo.lat !== undefined && (
                                <View
                                    style={{
                                        position: "absolute",
                                        bottom: 5,
                                        left: 5,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        backgroundColor: "rgba(0,0,0,0.6)",
                                        borderRadius: 6,
                                        paddingHorizontal: 5,
                                        paddingVertical: 2,
                                        gap: 3,
                                    }}
                                >
                                    <Ionicons name="location" size={10} color="#22c55e" />
                                    <Text style={{ color: "#22c55e", fontSize: 9, fontWeight: "600" }}>
                                        GPS
                                    </Text>
                                </View>
                            )}
                            {/* Timestamp watermark */}
                            {photo.capturedAt !== undefined && (
                                <View style={{
                                    position: "absolute",
                                    bottom: 5,
                                    right: 5,
                                    backgroundColor: "rgba(0,0,0,0.55)",
                                    borderRadius: 4,
                                    paddingHorizontal: 4,
                                    paddingVertical: 2,
                                }}>
                                    <Text style={{ color: "#fff", fontSize: 7, fontWeight: "600" }}>
                                        {formatTimestamp(photo.capturedAt)}
                                    </Text>
                                </View>
                            )}
                            {/* Annotate button */}
                            <TouchableOpacity
                                onPress={() => setAnnotatingIdx(idx)}
                                activeOpacity={0.8}
                                style={{
                                    position: "absolute",
                                    top: 5,
                                    left: 5,
                                    width: 22,
                                    height: 22,
                                    borderRadius: 11,
                                    backgroundColor: (photo.annotations?.length ?? 0) > 0
                                        ? "rgba(242,167,47,0.85)"
                                        : "rgba(0,0,0,0.65)",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Ionicons name="pencil" size={11} color="#fff" />
                            </TouchableOpacity>
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
                                <Ionicons name="close" size={13} color="#fff" />
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
                        <Ionicons
                            name="camera-outline"
                            size={22}
                            color="#52525b"
                        />
                        <Text style={{ color: "#52525b", fontSize: 12 }}>
                            {photos.length === 0 ? "Add photo" : "Add more"}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* ANNOTATION EDITOR */}
            {field.type === "photo" && annotatingIdx !== null && annotatingIdx < photos.length && (
                <Modal
                    visible
                    animationType="slide"
                    presentationStyle="fullScreen"
                    onRequestClose={() => setAnnotatingIdx(null)}
                >
                    <AnnotationEditor
                        photo={photos[annotatingIdx]}
                        onSave={(annotations) => {
                            const updated = photos.map((p, i) =>
                                i === annotatingIdx ? { ...p, annotations } : p,
                            );
                            commitPhotos(updated);
                            setAnnotatingIdx(null);
                        }}
                        onCancel={() => setAnnotatingIdx(null)}
                    />
                </Modal>
            )}

            {/* ROUTE TRACKER */}
            {field.type === "route" && (
                <RouteTrackerField
                    value={value}
                    onChange={(v) => onChange(v)}
                />
            )}

            {/* ACCELEROMETER */}
            {field.type === "accelerometer" && (
                <AccelerometerField
                    value={value}
                    onChange={(v) => onChange(v)}
                />
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
        setValues((prev) => {
            const next = { ...prev, [fieldId]: value };
            const field = section.fields.find((f) => f.id === fieldId);
            if (field?.type === "accelerometer" && typeof value === "string" && value) {
                try {
                    const accel = JSON.parse(value);
                    section.fields.forEach((f) => {
                        if (f.type !== "number") return;
                        const l = f.label.toLowerCase().trim();
                        if (l === "rms")  next[f.id] = accel.rms ?? 0;
                        if (l === "peak") next[f.id] = accel.peak ?? 0;
                        if (l === "avg")  next[f.id] = accel.avgMagnitude ?? 0;
                    });
                } catch {}
            }
            return next;
        });
    };

    // Re-apply auto-fill when reopening a section that already has accel data
    useEffect(() => {
        const accelField = section.fields.find((f) => f.type === "accelerometer");
        if (!accelField) return;
        const accelValue = initialValues[accelField.id];
        if (accelValue && typeof accelValue === "string") setValue(accelField.id, accelValue);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
    const prevStatusRef = useRef<Record<string, SectionStatus>>({});

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
        (s) => s === "completed" || s === "partial",
    ).length;
    const total = sections.length;
    const progress = total > 0 ? completed / total : 0;

    const openSection = (sectionId: string) => {
        prevStatusRef.current[sectionId] =
            sectionStatuses[sectionId] ?? "notstarted";
        const cur = sectionStatuses[sectionId] ?? "notstarted";
        if (cur !== "completed" && cur !== "partial") {
            setSectionStatuses((prev) => ({
                ...prev,
                [sectionId]: "inprogress",
            }));
            store.setSectionStatus(sectionId, "inprogress");
        }
        setActiveSectionId(sectionId);
    };

    const handleCloseSection = () => {
        if (activeSectionId) {
            const prev = prevStatusRef.current[activeSectionId];
            if (prev !== undefined) {
                setSectionStatuses((p) => ({ ...p, [activeSectionId]: prev }));
                store.setSectionStatus(activeSectionId, prev);
            }
        }
        setActiveSectionId(null);
    };

    const handleSaveSection = (sectionId: string, values: FieldValues) => {
        const section = sections.find((s) => s.id === sectionId)!;
        const filledCount = section.fields.filter((f) =>
            isFieldFilled(f.type, values[f.id]),
        ).length;
        const newStatus: SectionStatus =
            filledCount === section.fields.length
                ? "completed"
                : filledCount > 0
                  ? "partial"
                  : "notstarted";

        setAllFieldValues((prev) => ({ ...prev, [sectionId]: values }));
        setSectionStatuses((prev) => ({ ...prev, [sectionId]: newStatus }));
        store.setFieldValues(sectionId, values);
        store.setSectionStatus(sectionId, newStatus);
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
                    <Text className="text-zinc-500 text-xs" numberOfLines={1}>
                        {template.name}
                        {setup?.inspectorName
                            ? ` · ${setup.inspectorName}`
                            : ""}
                    </Text>
                </View>
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
                        const isPartial = status === "partial";
                        const isInProgress = status === "inprogress";

                        return (
                            <TouchableOpacity
                                key={section.id}
                                activeOpacity={0.75}
                                onPress={() => openSection(section.id)}
                                className="flex-row items-center rounded-2xl px-4 py-3.5"
                                style={
                                    isInProgress
                                        ? {
                                              backgroundColor: "#f2a72f1a",
                                              borderWidth: 1,
                                              borderColor: "#f2a72f4d",
                                          }
                                        : isPartial
                                          ? {
                                                backgroundColor: "#eab3080d",
                                                borderWidth: 1,
                                                borderColor: "#eab30833",
                                            }
                                          : { backgroundColor: "#0f172a" }
                                }
                            >
                                {isCompleted ? (
                                    <View className="w-8 h-8 rounded-full bg-green-500/20 items-center justify-center">
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={22}
                                            color="#22c55e"
                                        />
                                    </View>
                                ) : isPartial ? (
                                    <View
                                        className="w-8 h-8 rounded-full items-center justify-center"
                                        style={{ backgroundColor: "#eab30820" }}
                                    >
                                        <Ionicons
                                            name="checkmark-circle-outline"
                                            size={22}
                                            color="#eab308"
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
                                        style={{
                                            fontSize: 12,
                                            marginTop: 2,
                                            color: isCompleted
                                                ? "#22c55e"
                                                : isPartial
                                                  ? "#eab308"
                                                  : isInProgress
                                                    ? "#f2a72f"
                                                    : "#52525b",
                                        }}
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
                                        isCompleted
                                            ? "#3f3f46"
                                            : isPartial
                                              ? "#eab308"
                                              : isInProgress
                                                ? "#f2a72f"
                                                : "#3f3f46"
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
                onRequestClose={handleCloseSection}
            >
                {activeSection && (
                    <SectionEditor
                        section={activeSection}
                        initialValues={allFieldValues[activeSectionId!] ?? {}}
                        onSave={(values) =>
                            handleSaveSection(activeSectionId!, values)
                        }
                        onClose={handleCloseSection}
                    />
                )}
            </Modal>
        </View>
    );
}
