import "./global.css";

import { useState } from "react";
import { View } from "react-native";

import { AppScreen } from "@/components/BottomNavBar";
import HomeScreen from "./screens/HomeScreen";
import MediaHandlerScreen from "./screens/MediaHandlerScreen";
import MapsRoutesScreen from "./screens/MapsRoutesScreen";
import ReportEditorScreen from "./screens/ReportEditorScreen";
import ReportSetupScreen from "./screens/ReportSetupScreen";
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
    if (screen === "reportSetup") {
        return <ReportSetupScreen onNavigate={setScreen} />;
    }
    if (screen === "reportEditor") {
        return <ReportEditorScreen onNavigate={setScreen} />;
    }
    if (screen === "mediaHandler") {
        return <MediaHandlerScreen onNavigate={setScreen} />;
    }
    if (screen === "mapsRoutes") {
        return <MapsRoutesScreen onNavigate={setScreen} />;
    }

    return (
        <View className="flex-1">
            <HomeScreen onNavigate={setScreen} />
        </View>
    );
}
