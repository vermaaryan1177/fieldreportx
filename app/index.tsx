import "./global.css";

import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, View,TouchableOpacity } from "react-native";

import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

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


import Sidebar from "./screens/SideBar";


const { width: SCREEN_WIDTH } = Dimensions.get("window");

const TIMING = {
    duration: 420,
    easing: Easing.out(Easing.cubic),
};

function ScreenContent({
    screen,
    navigate,
    openSidebar,
}: {
    screen: AppScreen;
    navigate: (s: AppScreen) => void;
    openSidebar: () => void;
}) {
    switch (screen) {
        case "permissions":
            return <PermissionsScreen onNavigate={navigate} />;
        case "reports":
            return <ReportListScreen onNavigate={navigate} onOpenSidebar={openSidebar}/>;
        case "templateLibrary":
            return <TemplateLibraryScreen onNavigate={navigate} />;
        case "templateBuilder":
            return <TemplateBuilderScreen onNavigate={navigate} />;
        case "reportSetup":
            return <ReportSetupScreen onNavigate={navigate} />;
        case "reportEditor":
            return <ReportEditorScreen onNavigate={navigate} />;
        case "mediaHandler":
            return <MediaHandlerScreen onNavigate={navigate} />;
        case "mapsRoutes":
            return <MapsRoutesScreen onNavigate={navigate} />;
        case "reportPreview":
            return <ReportPreviewScreen onNavigate={navigate} />;
        case "score":
            return <ScoreScreen onNavigate={navigate} />;
        case "signature":
            return <SignatureScreen onNavigate={navigate} />;
        case "reportComparison":
            return <ReportComparisonScreen onNavigate={navigate} />;
        case "settings":
            return <SettingsScreen onNavigate={navigate} onOpenSidebar={openSidebar} />;
        case "organisation":
            return <OrganisationScreen onNavigate={navigate} onOpenSidebar={openSidebar} />;
        case "notifications":
            return <NotificationScreen onNavigate={navigate} onOpenSidebar={openSidebar} />;
        default:
            
            return (
                    <HomeScreen onNavigate={navigate} onOpenSidebar={openSidebar} />);
    }
}

export default function App() {
    const { user, loading } = useAuth();

    // currentScreen is always visible underneath.
    // incomingScreen slides in on top, then becomes current when done.
    const [currentScreen, setCurrentScreen] = useState<AppScreen>("home");
    const [incomingScreen, setIncomingScreen] = useState<AppScreen | null>(
        null,
    );

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const pendingPermissions = useRef(false);
    const historyRef = useRef<AppScreen[]>(["home"]);

    // Incoming layer starts off-screen; we animate it to 0.
    const incomingX = useSharedValue(SCREEN_WIDTH);

    const incomingStyle = useAnimatedStyle(() => ({
        ...StyleSheet.absoluteFillObject,
        transform: [{ translateX: incomingX.value }],
    }));

    const finishTransition = (target: AppScreen) => {
        // Promote incoming to current and unmount the transition layer.
        // Do NOT touch incomingX here — moving it while the layer is still
        // mounted causes the old base screen to flash before React re-renders.
        setCurrentScreen(target);
        setIncomingScreen(null);
    };

    const navigate = (target: AppScreen) => {
        const history = historyRef.current;
        const existingIdx = history.lastIndexOf(target);
        const isBack = existingIdx !== -1 && existingIdx < history.length - 1;

        if (isBack) {
            historyRef.current = history.slice(0, existingIdx + 1);
        } else {
            historyRef.current = [...history, target];
        }

        // Reset incomingX to the start position NOW (incoming layer is unmounted
        // at this point), then mount the layer and animate it in.
        incomingX.value = isBack ? -SCREEN_WIDTH : SCREEN_WIDTH;
        setIncomingScreen(target);
        incomingX.value = withTiming(0, TIMING, (finished) => {
            if (finished) runOnJS(finishTransition)(target);
        });
    };

    useEffect(() => {
        if (!user) {
            pendingPermissions.current = false;
            return;
        }
        // Auth-triggered switches have no animation.
        setIncomingScreen(null);
        if (pendingPermissions.current) {
            pendingPermissions.current = false;
            historyRef.current = ["permissions"];
            setCurrentScreen("permissions");
        } else {
            historyRef.current = ["home"];
            setCurrentScreen("home");
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



    return (
    <View style={{ flex: 1 }}>
        {/* Main Content */}
        <ScreenContent
            screen={currentScreen}
            navigate={navigate}
            openSidebar={() => setSidebarOpen(true)}
        />

        {/* Transition layer */}
        {incomingScreen !== null && (
            <Animated.View style={incomingStyle}>
                <ScreenContent
                    screen={incomingScreen}
                    navigate={navigate}
                    openSidebar={() => setSidebarOpen(true)}
                />
            </Animated.View>
        )}

        {/* Only render overlay and sidebar if open */}
        {sidebarOpen && (
            <>
                {/* Dark semi-transparent overlay */}
                <TouchableOpacity
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.3)",
                        zIndex: 998,
                    }}
                    activeOpacity={1}
                    onPress={() => setSidebarOpen(false)}
                />

                {/* Sidebar */}
                <View
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: 300, // sidebar width
                        zIndex: 999,
                        shadowColor: "#000",
                        shadowOpacity: 0.3,
                        shadowOffset: { width: 0, height: 2 },
                        shadowRadius: 10,
                    }}
                >
                    <Sidebar
                        active={currentScreen}
                        onNavigate={(screen) => {
                            setSidebarOpen(false);
                            navigate(screen);
                        }}
                        onSignOut={() => setSidebarOpen(false)}
                    />
                </View>
            </>
        )}
    </View>
);
}
