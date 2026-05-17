import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: "fieldreportx-ae740.firebaseapp.com",
    projectId: "fieldreportx-ae740",
    storageBucket: "fieldreportx-ae740.firebasestorage.app",
    messagingSenderId: "221687199668",
    appId: "1:221687199668:ios:614b11da0c42b0b501a4e1",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
