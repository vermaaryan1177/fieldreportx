import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Circle, Line, Svg } from "react-native-svg";

import { detectJointAngle, JointAngleCapture, SKELETON_EDGES, AI_UNSUPPORTED_JOINTS } from "@/lib/poseService";

const DISPLAY_W = Dimensions.get("window").width - 48;
const JOINT_LIST_AI = ["Knee", "Shoulder", "Elbow", "Hip", "Ankle"];

interface Props {
    value: string | boolean | number | undefined;
    onChange: (v: string) => void;
}

export default function JointAngleCaptureField({ value, onChange }: Props) {
    type Phase = "idle" | "processing" | "done" | "error";
    const [phase, setPhase] = useState<Phase>("idle");
    const [joint, setJoint] = useState("Knee");
    const [result, setResult] = useState<JointAngleCapture | null>(null);
    const [errorMsg, setErrorMsg] = useState("");
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    useEffect(() => {
        if (typeof value === "string" && value) {
            try {
                const d: JointAngleCapture = JSON.parse(value);
                setResult(d);
                setJoint(d.joint);
                setPhase("done");
            } catch {}
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const capture = async () => {
        if (AI_UNSUPPORTED_JOINTS.includes(joint)) {
            Alert.alert(
                "Not supported",
                `AI angle detection isn't available for ${joint}. Enter the angle manually in the Angle Measurements section.`,
            );
            return;
        }
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
            Alert.alert("Permission required", "Camera access is needed for joint capture.");
            return;
        }
        const picked = await ImagePicker.launchCameraAsync({ allowsEditing: false, quality: 0.85 });
        if (picked.canceled) return;

        setPhase("processing");
        setErrorMsg("");
        const asset = picked.assets[0];
        try {
            const detection = await detectJointAngle(asset.uri, joint, asset.width, asset.height);
            setResult(detection);
            setPhase("done");
            onChangeRef.current(JSON.stringify(detection));
        } catch (err: any) {
            setErrorMsg(err.message ?? "Detection failed.");
            setPhase("error");
        }
    };

    const reset = () => {
        setPhase("idle");
        setResult(null);
        setErrorMsg("");
        onChangeRef.current("");
    };

    // ── Joint picker (shared across idle/error states) ───────────────────────
    const JointPicker = () => (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
                {JOINT_LIST_AI.map((j) => (
                    <TouchableOpacity
                        key={j}
                        onPress={() => setJoint(j)}
                        style={{
                            paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
                            backgroundColor: joint === j ? "#22c55e20" : "#1e293b",
                            borderWidth: 1,
                            borderColor: joint === j ? "#22c55e" : "#3f3f46",
                        }}
                    >
                        <Text style={{ color: joint === j ? "#22c55e" : "#71717a", fontSize: 13, fontWeight: "600" }}>
                            {j}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );

    // ── Processing ───────────────────────────────────────────────────────────
    if (phase === "processing") {
        return (
            <View style={{ backgroundColor: "#1e293b", borderRadius: 12, padding: 24, alignItems: "center", gap: 12, borderWidth: 1, borderColor: "#22c55e20" }}>
                <ActivityIndicator color="#22c55e" size="large" />
                <Text style={{ color: "#94a3b8", fontSize: 14, fontWeight: "600" }}>Detecting joint angle…</Text>
                <Text style={{ color: "#52525b", fontSize: 12, textAlign: "center" }}>
                    Loading AI model on first use may take a moment
                </Text>
            </View>
        );
    }

    // ── Done — photo + skeleton overlay + angle badge ────────────────────────
    if (phase === "done" && result) {
        const dispH = DISPLAY_W * (result.origH / result.origW);
        const scaleX = DISPLAY_W / 256;
        const scaleY = dispH / 256;
        const [pIdx, vIdx, dIdx] = result.triplet;

        return (
            <View style={{ gap: 10 }}>
                {/* Photo + SVG skeleton overlay */}
                <View style={{ width: DISPLAY_W, height: dispH, borderRadius: 12, overflow: "hidden", position: "relative" }}>
                    <Image
                        source={{ uri: result.imageUri }}
                        style={{ width: DISPLAY_W, height: dispH }}
                        resizeMode="stretch"
                    />
                    <Svg width={DISPLAY_W} height={dispH} style={{ position: "absolute", top: 0, left: 0 }}>
                        {/* Skeleton edges */}
                        {SKELETON_EDGES.map(([a, b], i) => {
                            const kA = result.keypoints[a], kB = result.keypoints[b];
                            if (!kA || !kB || kA.score < 0.2 || kB.score < 0.2) return null;
                            return (
                                <Line
                                    key={i}
                                    x1={kA.x * scaleX} y1={kA.y * scaleY}
                                    x2={kB.x * scaleX} y2={kB.y * scaleY}
                                    stroke="rgba(255,255,255,0.35)" strokeWidth={1.5}
                                />
                            );
                        })}
                        {/* All keypoints */}
                        {result.keypoints.map((kp, i) => {
                            if (kp.score < 0.2) return null;
                            const isActive = i === pIdx || i === vIdx || i === dIdx;
                            return (
                                <Circle
                                    key={i}
                                    cx={kp.x * scaleX} cy={kp.y * scaleY}
                                    r={isActive ? 7 : 4}
                                    fill={isActive ? "#22c55e" : "rgba(255,255,255,0.5)"}
                                    stroke={isActive ? "#fff" : "none"}
                                    strokeWidth={isActive ? 1.5 : 0}
                                />
                            );
                        })}
                        {/* Lines connecting the measured triplet */}
                        {[pIdx, dIdx].map((idx, i) => {
                            const kA = result.keypoints[idx], kV = result.keypoints[vIdx];
                            if (!kA || !kV || kA.score < 0.2 || kV.score < 0.2) return null;
                            return (
                                <Line
                                    key={`active_${i}`}
                                    x1={kA.x * scaleX} y1={kA.y * scaleY}
                                    x2={kV.x * scaleX} y2={kV.y * scaleY}
                                    stroke="#22c55e" strokeWidth={2.5}
                                />
                            );
                        })}
                    </Svg>
                    {/* Angle badge */}
                    <View style={{ position: "absolute", bottom: 10, right: 10, backgroundColor: "rgba(0,0,0,0.75)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, flexDirection: "row", alignItems: "baseline", gap: 3 }}>
                        <Text style={{ color: "#22c55e", fontWeight: "bold", fontSize: 28 }}>{result.angle}</Text>
                        <Text style={{ color: "#22c55e", fontSize: 14 }}>°</Text>
                    </View>
                    {/* Confidence badge */}
                    <View style={{ position: "absolute", top: 10, left: 10, backgroundColor: "rgba(0,0,0,0.65)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                        <Text style={{ color: "#94a3b8", fontSize: 11 }}>{result.joint} · {Math.round(result.confidence * 100)}% conf</Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={reset}
                    activeOpacity={0.7}
                    style={{ backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#3f3f46", borderRadius: 12, paddingVertical: 12, alignItems: "center" }}
                >
                    <Text style={{ color: "#94a3b8", fontSize: 13, fontWeight: "600" }}>Retake</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ── Error ────────────────────────────────────────────────────────────────
    if (phase === "error") {
        return (
            <View style={{ gap: 10 }}>
                <View style={{ backgroundColor: "#1e293b", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#ef444430", gap: 8 }}>
                    <Text style={{ color: "#ef4444", fontWeight: "600", fontSize: 13 }}>Detection failed</Text>
                    <Text style={{ color: "#94a3b8", fontSize: 12 }}>{errorMsg}</Text>
                </View>
                <JointPicker />
                <TouchableOpacity
                    onPress={capture}
                    activeOpacity={0.8}
                    style={{ backgroundColor: "#14532d", borderWidth: 1, borderColor: "#22c55e40", borderRadius: 12, paddingVertical: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
                >
                    <Ionicons name="camera-outline" size={18} color="#22c55e" />
                    <Text style={{ color: "#22c55e", fontWeight: "bold", fontSize: 15 }}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ── Idle ─────────────────────────────────────────────────────────────────
    return (
        <View style={{ gap: 10 }}>
            <JointPicker />
            <TouchableOpacity
                onPress={capture}
                activeOpacity={0.8}
                style={{ backgroundColor: "#14532d", borderWidth: 1, borderColor: "#22c55e40", borderRadius: 12, paddingVertical: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
            >
                <Ionicons name="camera-outline" size={18} color="#22c55e" />
                <Text style={{ color: "#22c55e", fontWeight: "bold", fontSize: 15 }}>
                    Capture {joint} Angle
                </Text>
            </TouchableOpacity>
        </View>
    );
}
