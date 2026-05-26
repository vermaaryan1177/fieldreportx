import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";

const KEY = "app:colorScheme";

export type ThemePreference = "light" | "dark" | "system";

export async function loadSavedTheme(): Promise<void> {
    try {
        const saved = await AsyncStorage.getItem(KEY);
        if (saved === "light" || saved === "dark") {
            Appearance.setColorScheme(saved);
        }
    } catch {}
}

export async function saveTheme(pref: ThemePreference): Promise<void> {
    await AsyncStorage.setItem(KEY, pref);
    if (pref === "system") {
        Appearance.setColorScheme(null); // revert to OS setting
    } else {
        Appearance.setColorScheme(pref);
    }
}

export async function getSavedThemePreference(): Promise<ThemePreference> {
    try {
        const saved = await AsyncStorage.getItem(KEY);
        if (saved === "light" || saved === "dark" || saved === "system") {
            return saved;
        }
    } catch {}
    return "system";
}
