import { Text, TextInput, View, useColorScheme } from "react-native";

interface InputFieldProps {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    keyboardType?: "default" | "email-address" | "numeric";
    icon: string;
    rightAction?: React.ReactNode;
    secureTextEntry?: boolean;
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

export default function InputField({
    label,
    placeholder,
    value,
    onChangeText,
    keyboardType = "default",
    icon,
    rightAction,
    secureTextEntry = false,
    autoCapitalize,
}: InputFieldProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    return (
        <View>
            <Text className="text-slate-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-1.5 px-1">
                {label}
            </Text>
            <View className="flex-row items-center bg-white dark:bg-slate-700 rounded-2xl px-4 h-12">
                {icon && (
                    <Text className="text-base mr-3 opacity-60">{icon}</Text>
                )}
                <TextInput
                    className="flex-1 text-slate-900 dark:text-white text-sm"
                    placeholder={placeholder}
                    placeholderTextColor={isDark ? "#52525b" : "#94a3b8"}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    secureTextEntry={secureTextEntry}
                    autoCapitalize={
                        autoCapitalize ?? (keyboardType === "email-address" ? "none" : "sentences")
                    }
                    autoCorrect={false}
                />
                {rightAction && <View className="ml-2">{rightAction}</View>}
            </View>
        </View>
    );
}
