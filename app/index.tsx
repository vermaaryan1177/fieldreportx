import "./global.css";

import { useState } from "react";
import { View } from "react-native";

import { AppScreen } from "@/components/BottomNavBar";
import HomeScreen from "./screens/HomeScreen";
import TemplateBuilderScreen from "./screens/TemplateBuilderScreen";
import TemplateLibraryScreen from "./screens/TemplateLibraryScreen";

export default function App() {
    const [screen, setScreen] = useState<AppScreen>("home");

    if (screen === "templateLibrary") {
        return <TemplateLibraryScreen onNavigate={setScreen} />;
    }

    if (screen === "templateBuilder") {
        return <TemplateBuilderScreen onNavigate={setScreen} />;
    }

    return (
        <View className="flex-1">
            <HomeScreen onNavigate={setScreen} />
        </View>
    );
}
