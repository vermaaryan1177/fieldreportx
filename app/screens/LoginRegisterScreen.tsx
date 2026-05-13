import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import ForgotPasswordButton from "@/components/ForgotPasswordButton";
import InputField from "@/components/InputField";
import SubmitFormButton from "@/components/SubmitFormButton";

type Tab = "login" | "register";

export default function LoginRegisterScreen() {
    // Misc. fields
    const [activeTab, setActiveTab] = useState<Tab>("login");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Login fields
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // Register fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    return (
        <View className="bg-background h-screen">
            <View className="h-screen">
                <ScrollView>
                    {/* Header  */}
                    <View className="items-center pt-16 pb-10 px-6 mt-16">
                        <View className="w-16 h-16 rounded-2xl bg-primary items-center justify-center mb-4 shadow-sm">
                            <Text className="text-white text-2xl font-black">
                                FX
                            </Text>
                        </View>
                        <Text className="text-primary text-3xl font-bold">
                            FieldReportX
                        </Text>
                        <Text className="text-white text-sm mt-1">
                            Field reporting, simplified.
                        </Text>
                    </View>

                    {/* Tab Switcher */}
                    <View className="mx-5 mb-6">
                        <View className="flex-row bg-secondary rounded-2xl p-1">
                            {(["login", "register"] as Tab[]).map((tab) => (
                                <TouchableOpacity
                                    key={tab}
                                    onPress={() => setActiveTab(tab)}
                                    className={`flex-1 py-2.5 rounded-xl items-center ${
                                        activeTab === tab ? "bg-primary" : ""
                                    }`}
                                >
                                    <Text
                                        className={`font-semibold text-sm capitalize ${
                                            activeTab === tab
                                                ? "text-white"
                                                : "text-black"
                                        }`}
                                    >
                                        {tab === "login"
                                            ? "Sign In"
                                            : "Register"}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Form */}
                    <View className="mx-5 gap-3">
                        {activeTab === "login" ? (
                            /* Login Form */
                            <>
                                <InputField
                                    label="Email"
                                    placeholder="janedoe@example.com"
                                    value={loginEmail}
                                    onChangeText={setLoginEmail}
                                    keyboardType="email-address"
                                    icon="✉️"
                                />

                                <InputField
                                    label="Password"
                                    placeholder="Enter your password"
                                    value={loginPassword}
                                    onChangeText={setLoginPassword}
                                    icon="🔒"
                                    rightAction={
                                        <TouchableOpacity
                                            onPress={() =>
                                                setShowPassword((v) => !v)
                                            }
                                        >
                                            <Text className="text-slate-500 text-xs font-medium">
                                                {showPassword ? "Hide" : "Show"}
                                            </Text>
                                        </TouchableOpacity>
                                    }
                                />

                                <ForgotPasswordButton />

                                <SubmitFormButton text="Log In" />
                            </>
                        ) : (
                            /* Register Form */
                            <>
                                <InputField
                                    label="Full Name"
                                    placeholder="Jane Smith"
                                    value={name}
                                    onChangeText={setName}
                                    icon="👤"
                                />

                                <InputField
                                    label="Email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    icon="✉️"
                                />

                                <InputField
                                    label="Password"
                                    placeholder="Create a password"
                                    value={password}
                                    onChangeText={setPassword}
                                    icon="🔒"
                                    rightAction={
                                        <TouchableOpacity
                                            onPress={() =>
                                                setShowPassword((v) => !v)
                                            }
                                        >
                                            <Text className="text-zinc-500 text-xs font-medium">
                                                {showPassword ? "Hide" : "Show"}
                                            </Text>
                                        </TouchableOpacity>
                                    }
                                />

                                <InputField
                                    label="Confirm Password"
                                    placeholder="Repeat password"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    icon="🔒"
                                    rightAction={
                                        <TouchableOpacity
                                            onPress={() =>
                                                setShowConfirmPassword(
                                                    (v) => !v,
                                                )
                                            }
                                        >
                                            <Text className="text-zinc-500 text-xs font-medium">
                                                {showConfirmPassword
                                                    ? "Hide"
                                                    : "Show"}
                                            </Text>
                                        </TouchableOpacity>
                                    }
                                />

                                <SubmitFormButton text="Create Account" />

                                {/* Terms */}
                                <Text className="text-white text-xs text-center px-4 pb-4">
                                    By creating an account you agree to our{" "}
                                    <Text className="text-sky-500">
                                        Terms of Service
                                    </Text>{" "}
                                    and{" "}
                                    <Text className="text-sky-500">
                                        Privacy Policy
                                    </Text>
                                    .
                                </Text>
                            </>
                        )}

                        {/* ── Divider ── */}
                        <View className="flex-row items-center gap-3 my-2">
                            <View className="flex-1 h-px bg-white" />
                            <Text className="text-primary text-xs">
                                or continue with
                            </Text>
                            <View className="flex-1 h-px bg-white" />
                        </View>

                        {/* ── SSO Options ── */}
                        <View className="flex-row gap-3 pb-10">
                            {["Apple", "Google", "SSO"].map((provider) => (
                                <TouchableOpacity
                                    key={provider}
                                    className="flex-1 bg-secondary border border-slate-500 rounded-2xl py-3 items-center active:opacity-70"
                                >
                                    <Text className="text-black text-xs font-medium">
                                        {provider}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}
