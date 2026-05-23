import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
// @ts-ignore — getReactNativePersistence lives in the RN bundle, not the web bundle
import { getReactNativePersistence } from "@firebase/auth/dist/index.rn.js";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: "fieldreportx-ae740.firebaseapp.com",
    projectId: "fieldreportx-ae740",
    storageBucket: "fieldreportx-ae740.firebasestorage.app",
    messagingSenderId: "221687199668",
    appId: "1:221687199668:ios:614b11da0c42b0b501a4e1",
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const db = getFirestore(app);
export const storage = getStorage(app);
