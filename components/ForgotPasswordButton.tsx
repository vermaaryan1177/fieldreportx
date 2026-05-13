import React from "react";
import { Text, TouchableOpacity } from "react-native";

export default function ForgotPasswordButton() {
    return (
        <>
            <TouchableOpacity className="self-end -mt-1">
                <Text className="text-primary text-sm font-medium">
                    Forgot password?
                </Text>
            </TouchableOpacity>
        </>
    );
}
