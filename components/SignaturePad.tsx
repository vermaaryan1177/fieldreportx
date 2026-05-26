import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { Alert, PanResponder, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { Path, Svg } from "react-native-svg";

interface Props {
    onDone: (paths: string) => void;
    onCancel: () => void;
}

export default function SignaturePad({ onDone, onCancel }: Props) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
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
        <View className="flex-1 bg-background dark:bg-[#1e2529]">
            <View className="flex-row items-center justify-between px-5 pt-14 pb-4 border-b border-slate-200 dark:border-zinc-800">
                <TouchableOpacity
                    onPress={onCancel}
                    className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center"
                >
                    <Ionicons name="close" size={18} color={isDark ? "#fff" : "#0f172a"} />
                </TouchableOpacity>
                <Text className="text-slate-900 dark:text-white font-bold text-base">Sign here</Text>
                <TouchableOpacity
                    onPress={() => {
                        setCompletedPaths([]);
                        setLivePath("");
                        livePathRef.current = "";
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800"
                >
                    <Text className="text-slate-500 dark:text-zinc-400 text-sm">Clear</Text>
                </TouchableOpacity>
            </View>

            <Text className="text-slate-400 dark:text-zinc-500 text-xs text-center mt-3 mb-2">
                Draw your signature in the box below
            </Text>

            <View
                className="mx-5 flex-1 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-700"
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
                        <Ionicons name="pencil-outline" size={32} color={isDark ? "#3f3f46" : "#cbd5e1"} />
                        <Text className="text-slate-400 dark:text-zinc-700 text-sm mt-2">Sign above</Text>
                    </View>
                )}
                <View
                    className="absolute left-8 right-8 h-px bg-slate-200 dark:bg-zinc-700"
                    style={{ bottom: 60 }}
                />
            </View>

            <View className="px-5 py-5">
                <TouchableOpacity
                    onPress={handleDone}
                    activeOpacity={0.8}
                    className="bg-primary rounded-2xl py-4 items-center"
                >
                    <Text className="text-slate-900 dark:text-white font-bold text-base">Confirm signature</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
