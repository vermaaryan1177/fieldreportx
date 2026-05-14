import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { AppScreen } from "@/components/BottomNavBar";

interface Props {
    onNavigate: (screen: AppScreen) => void;
}

export default function SignatureScreen({ onNavigate }: Props) {
    const [signed, setSigned] = useState(false);
    const [name, setName] = useState("Arn Malasi");
    const [role, setRole] = useState("Property Inspector");

    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <View className="flex-row items-center gap-3 px-5 pt-16 pb-4">
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onNavigate("reportPreview")}
                    className="w-9 h-9 items-center justify-center rounded-full bg-slate-800"
                >
                    <Ionicons name="arrow-back" size={18} color="#ffffff" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold">Sign off</Text>
            </View>

            <View className="flex-1 px-5">
                {/* Inspector details */}
                <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2">
                    Inspector details
                </Text>
                <View className="bg-slate-900 rounded-2xl px-4 py-1 mb-5">
                    {[
                        { label: "Full name", value: name, onChange: setName },
                        { label: "Role", value: role, onChange: setRole },
                    ].map((field, i, arr) => (
                        <View
                            key={field.label}
                            className={`flex-row items-center py-3.5 ${i < arr.length - 1 ? "border-b border-zinc-800" : ""}`}
                        >
                            <Text className="text-zinc-500 text-sm w-20">
                                {field.label}
                            </Text>
                            <TextInput
                                value={field.value}
                                onChangeText={field.onChange}
                                className="flex-1 text-white text-sm"
                                placeholderTextColor="#52525b"
                            />
                        </View>
                    ))}
                    <View className="flex-row items-center py-3.5 border-t border-zinc-800">
                        <Text className="text-zinc-500 text-sm w-20">Date</Text>
                        <Text className="text-white text-sm">
                            14 May 2026, 3:42 PM
                        </Text>
                    </View>
                </View>

                {/* Signature Canvas */}
                <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2">
                    Signature
                </Text>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setSigned(true)}
                    style={{
                        height: 180,
                        backgroundColor: "#0f172a",
                        borderRadius: 16,
                        borderWidth: 2,
                        borderColor: signed ? "#f2a72f" : "#334155",
                        borderStyle: signed ? "solid" : "dashed",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {signed ? (
                        <View className="items-center">
                            <Text
                                style={{
                                    fontSize: 38,
                                    color: "#f2a72f",
                                    fontStyle: "italic",
                                    fontWeight: "300",
                                    letterSpacing: 2,
                                    opacity: 0.9,
                                }}
                            >
                                {name}
                            </Text>
                            <View
                                style={{
                                    height: 1.5,
                                    backgroundColor: "#f2a72f",
                                    width: 160,
                                    marginTop: 8,
                                    opacity: 0.5,
                                }}
                            />
                        </View>
                    ) : (
                        <View className="items-center gap-3">
                            <Ionicons name="create-outline" size={32} color="#334155" />
                            <Text className="text-zinc-600 text-sm">Tap to sign</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {signed && (
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setSigned(false)}
                        className="flex-row items-center justify-center gap-1.5 mt-3"
                    >
                        <Ionicons name="refresh-outline" size={14} color="#71717a" />
                        <Text className="text-zinc-500 text-sm">Clear signature</Text>
                    </TouchableOpacity>
                )}

                {/* Disclaimer */}
                <Text className="text-zinc-600 text-xs text-center mt-5 leading-5 px-2">
                    By signing, you certify that this report accurately reflects the
                    condition of the property as inspected.
                </Text>
            </View>

            {/* Bottom Actions */}
            <View className="flex-row gap-3 px-5 pb-10 pt-3 bg-background border-t border-zinc-800">
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onNavigate("reportPreview")}
                    className="flex-1 bg-slate-900 border border-zinc-700 rounded-2xl py-4 items-center"
                >
                    <Text className="text-white font-semibold text-sm">Skip</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => signed && onNavigate("reportPreview")}
                    className={`flex-1 rounded-2xl py-4 items-center ${signed ? "bg-primary" : "bg-zinc-700"}`}
                >
                    <Text className="text-white font-bold text-sm">
                        {signed ? "Save signature" : "Sign to continue"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
