import React from "react";
import { Text, TouchableOpacity } from "react-native";

interface SubmitFormButtonProps {
    text: string;
}

export default function SubmitFormButton({ text }: SubmitFormButtonProps) {
    return (
        <>
            <TouchableOpacity className="bg-primary rounded-2xl py-4 items-center mt-2">
                <Text className="text-white font-bold text-base"> {text} </Text>
            </TouchableOpacity>
        </>
    );
}
