import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
    Image,
    PanResponder,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Path, Svg } from "react-native-svg";

import { AnnotationStroke, TaggedPhoto } from "@/lib/types";

const ANNOTATION_COLORS = ["#ffffff", "#ef4444", "#facc15", "#22c55e", "#60a5fa"];

function formatTimestamp(ms: number): string {
    return new Date(ms).toLocaleString("en-AU", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

interface Props {
    photo: TaggedPhoto;
    onSave: (annotations: AnnotationStroke[]) => void;
    onCancel: () => void;
}

export default function AnnotationEditor({ photo, onSave, onCancel }: Props) {
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
