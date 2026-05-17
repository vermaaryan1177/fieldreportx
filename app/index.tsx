import "./global.css";

import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { AppScreen } from "@/components/BottomNavBar";
import { useAuth } from "@/hooks/useAuth";
import LoginRegisterScreen from "./screens/LoginRegisterScreen";
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


import SettingScreen from "./screens/SettingScreen";
import OrganisationScreen from "./screens/OrganisationScreen";
import SideBar from "./screens/SideBar";



export default function App() {
    const { user, loading } = useAuth();
    const [screen, setScreen] = useState<AppScreen>("home");

    // Reset to home screen whenever a new session starts
    useEffect(() => {
        if (user) setScreen("home");
    }, [user]);

    if (loading) {
        return (
            <View className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator color="#f2a72f" size="large" />
            </View>
        );
    }

    if (!user) {
        return <LoginRegisterScreen />;
    }

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
    if (screen === "settings") {
        return <SettingScreen onNavigate={setScreen} />;
    }
    if (screen === "organisation") {
    return <OrganisationScreen onNavigate={setScreen} />;
    }


    return (
        <View className="flex-1">
            {/* <HomeScreen onNavigate={setScreen} /> */}
            <SideBar onNavigate={setScreen} />
        </View>
    );
}
