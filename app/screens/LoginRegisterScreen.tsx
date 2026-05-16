import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import ForgotPasswordButton from "@/components/ForgotPasswordButton";
import InputField from "@/components/InputField";
import SubmitFormButton from "@/components/SubmitFormButton";
import { getAuthErrorMessage, signIn, signUp } from "@/lib/auth";

type Tab = "login" | "register";

export default function LoginRegisterScreen() {
    const [activeTab, setActiveTab] = useState<Tab>("login");

    // Login fields
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [showLoginPassword, setShowLoginPassword] = useState(false);

    // Register fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Shared state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearError = () => setError(null);

    const handleLogin = async () => {
        if (!loginEmail || !loginPassword) {
            setError("Please fill in all fields.");
            return;
        }
        setError(null);
        setLoading(true);
        try {
            await signIn(loginEmail, loginPassword);
            // useAuth in index.tsx detects the new user and re-renders automatically
        } catch (e) {
            setError(getAuthErrorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        setError(null);
        setLoading(true);
        try {
            await signUp(name, email, password);
        } catch (e) {
            setError(getAuthErrorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    const switchTab = (tab: Tab) => {
        setActiveTab(tab);
        clearError();
    };

    return (
        <View className="bg-background h-screen">
            <View className="h-screen">
                <ScrollView keyboardShouldPersistTaps="handled">
                    {/* Header */}
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
                                    onPress={() => switchTab(tab)}
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
                                        {tab === "login" ? "Sign In" : "Register"}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Form */}
                    <View className="mx-5 gap-3">
                        {/* Error Banner */}
                        {error && (
                            <View className="bg-alert/15 border border-alert/40 rounded-2xl px-4 py-3 flex-row items-center justify-between">
                                <Text className="text-alert text-sm flex-1">
                                    {error}
                                </Text>
                                <TouchableOpacity onPress={clearError}>
                                    <Text className="text-alert text-lg leading-none ml-3">
                                        ×
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {activeTab === "login" ? (
                            /* Login Form */
                            <>
                                <InputField
                                    label="Email"
                                    placeholder="janedoe@example.com"
                                    value={loginEmail}
                                    onChangeText={(v) => {
                                        setLoginEmail(v);
                                        clearError();
                                    }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    icon="✉️"
                                />

                                <InputField
                                    label="Password"
                                    placeholder="Enter your password"
                                    value={loginPassword}
                                    onChangeText={(v) => {
                                        setLoginPassword(v);
                                        clearError();
                                    }}
                                    icon="🔒"
                                    secureTextEntry={!showLoginPassword}
                                    rightAction={
                                        <TouchableOpacity
                                            onPress={() =>
                                                setShowLoginPassword((v) => !v)
                                            }
                                        >
                                            <Text className="text-slate-500 text-xs font-medium">
                                                {showLoginPassword
                                                    ? "Hide"
                                                    : "Show"}
                                            </Text>
                                        </TouchableOpacity>
                                    }
                                />

                                <ForgotPasswordButton email={loginEmail} />

                                <SubmitFormButton
                                    text="Sign In"
                                    onPress={handleLogin}
                                    loading={loading}
                                    disabled={loading}
                                />
                            </>
                        ) : (
                            /* Register Form */
                            <>
                                <InputField
                                    label="Full Name"
                                    placeholder="Jane Smith"
                                    value={name}
                                    onChangeText={(v) => {
                                        setName(v);
                                        clearError();
                                    }}
                                    icon="👤"
                                />

                                <InputField
                                    label="Email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChangeText={(v) => {
                                        setEmail(v);
                                        clearError();
                                    }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    icon="✉️"
                                />

                                <InputField
                                    label="Password"
                                    placeholder="Create a password"
                                    value={password}
                                    onChangeText={(v) => {
                                        setPassword(v);
                                        clearError();
                                    }}
                                    icon="🔒"
                                    secureTextEntry={!showPassword}
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
                                    onChangeText={(v) => {
                                        setConfirmPassword(v);
                                        clearError();
                                    }}
                                    icon="🔒"
                                    secureTextEntry={!showConfirmPassword}
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

                                <SubmitFormButton
                                    text="Create Account"
                                    onPress={handleRegister}
                                    loading={loading}
                                    disabled={loading}
                                />

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

                        {/* Divider */}
                        <View className="flex-row items-center gap-3 my-2">
                            <View className="flex-1 h-px bg-white" />
                            <Text className="text-primary text-xs">
                                or continue with
                            </Text>
                            <View className="flex-1 h-px bg-white" />
                        </View>

                        {/* SSO Options */}
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
