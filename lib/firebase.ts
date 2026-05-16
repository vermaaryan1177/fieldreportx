import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: "fieldreportx-ae740.firebaseapp.com",
    projectId: "fieldreportx-ae740",
    storageBucket: "fieldreportx-ae740.firebasestorage.app",
    messagingSenderId: "221687199668",
    appId: "1:221687199668:ios:614b11da0c42b0b501a4e1",
};

// Firebase removed getReactNativePersistence
// Implement AsyncStorage persistence manually
const asyncStoragePersistence = {
    type: "LOCAL" as const,
    async _isAvailable() {
        try {
            await AsyncStorage.setItem("__fx_test__", "1");
            await AsyncStorage.removeItem("__fx_test__");
            return true;
        } catch {
            return false;
        }
    },
    async _set(key: string, value: unknown) {
        await AsyncStorage.setItem(key, JSON.stringify(value));
    },
    async _get(key: string) {
        const raw = await AsyncStorage.getItem(key);
        return raw != null ? JSON.parse(raw) : null;
    },
    async _remove(key: string) {
        await AsyncStorage.removeItem(key);
    },
    _addListener(_key: string, _listener: unknown) {},
    _removeListener(_key: string, _listener: unknown) {},
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
    persistence: asyncStoragePersistence as any,
});
