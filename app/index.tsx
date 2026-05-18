import "./global.css";

import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { AppScreen } from "@/components/BottomNavBar";
import { useAuth } from "@/hooks/useAuth";
import HomeScreen from "./screens/HomeScreen";
import LoginRegisterScreen from "./screens/LoginRegisterScreen";
import MapsRoutesScreen from "./screens/MapsRoutesScreen";
import MediaHandlerScreen from "./screens/MediaHandlerScreen";
import NotificationScreen from "./screens/NotificationScreen";
import OrganisationScreen from "./screens/OrganisationScreen";
import PermissionsScreen from "./screens/PermissionsScreen";
import ReportComparisonScreen from "./screens/ReportComparisonScreen";
import ReportEditorScreen from "./screens/ReportEditorScreen";
import ReportListScreen from "./screens/ReportListScreen";
import ReportPreviewScreen from "./screens/ReportPreviewScreen";
import ReportSetupScreen from "./screens/ReportSetupScreen";
import ScoreScreen from "./screens/ScoreScreen";
import SettingsScreen from "./screens/SettingsScreen";
import SignatureScreen from "./screens/SignatureScreen";
import TemplateBuilderScreen from "./screens/TemplateBuilderScreen";
import TemplateLibraryScreen from "./screens/TemplateLibraryScreen";

export default function App() {
    const { user, loading } = useAuth();
    const [screen, setScreen] = useState<AppScreen>("home");
    // Set to true BEFORE signUp starts so the useEffect sees it when
    // onAuthStateChanged fires mid-signup (before signUp resolves).
    const pendingPermissions = useRef(false);

    useEffect(() => {
        if (!user) {
            pendingPermissions.current = false;
            return;
        }
        if (pendingPermissions.current) {
            pendingPermissions.current = false;
            setScreen("permissions");
        } else {
            setScreen("home");
        }
    }, [user?.uid]);

    if (loading) {
        return (
            <View className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator color="#f2a72f" size="large" />
            </View>
        );
    }

    if (!user) {
        return (
            <LoginRegisterScreen
                onStartRegister={() => {
                    pendingPermissions.current = true;
                }}
            />
        );
    }

    if (screen === "permissions") {
        return <PermissionsScreen onNavigate={setScreen} />;
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
        return <SettingsScreen onNavigate={setScreen} />;
    }
    if (screen === "organisation") {
        return <OrganisationScreen onNavigate={setScreen} />;
    }
    if (screen === "notification") {
        return <NotificationScreen onNavigate={setScreen} />;
    }

    return (
        <View className="flex-1">
            <HomeScreen onNavigate={setScreen} />
        </View>
    );
}
