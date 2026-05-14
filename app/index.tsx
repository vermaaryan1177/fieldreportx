import "./global.css";

import { useState } from "react";
import { View } from "react-native";

import { AppScreen } from "@/components/BottomNavBar";
import HomeScreen from "./screens/HomeScreen";
import MediaHandlerScreen from "./screens/MediaHandlerScreen";
import MapsRoutesScreen from "./screens/MapsRoutesScreen";
import ReportComparisonScreen from "./screens/ReportComparisonScreen";
import ReportEditorScreen from "./screens/ReportEditorScreen";
import ReportListScreen from "./screens/ReportListScreen";
import ReportPreviewScreen from "./screens/ReportPreviewScreen";
import ReportSetupScreen from "./screens/ReportSetupScreen";
import ScoreScreen from "./screens/ScoreScreen";
import SignatureScreen from "./screens/SignatureScreen";
import TemplateBuilderScreen from "./screens/TemplateBuilderScreen";
import TemplateLibraryScreen from "./screens/TemplateLibraryScreen";

export default function App() {
    const [screen, setScreen] = useState<AppScreen>("home");

    if (screen === "reports") {
        return <ReportListScreen onNavigate={setScreen} />;
    }
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
    if (screen === "reportPreview") {
        return <ReportPreviewScreen onNavigate={setScreen} />;
    }
    if (screen === "score") {
        return <ScoreScreen onNavigate={setScreen} />;
    }
    if (screen === "signature") {
        return <SignatureScreen onNavigate={setScreen} />;
    }
    if (screen === "reportComparison") {
        return <ReportComparisonScreen onNavigate={setScreen} />;
    }

    return (
        <View className="flex-1">
            <HomeScreen onNavigate={setScreen} />
        </View>
    );
}
