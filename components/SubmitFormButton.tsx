import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

interface SubmitFormButtonProps {
    text: string;
    onPress?: () => void;
    loading?: boolean;
    disabled?: boolean;
}

export default function SubmitFormButton({
    text,
    onPress,
    loading = false,
    disabled = false,
}: SubmitFormButtonProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            className={`rounded-2xl py-4 items-center mt-2 ${
                disabled || loading ? "bg-primary/50" : "bg-primary"
            }`}
        >
            {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
            ) : (
                <Text className="text-white font-bold text-base">{text}</Text>
            )}
        </TouchableOpacity>
    );
}
