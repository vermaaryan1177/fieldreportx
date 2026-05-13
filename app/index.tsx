import "./global.css";

import { View } from "react-native";
import PermissionsScreen from "./screens/PermissionsScreen";

export default function Home() {
    return (
        <View>
            <PermissionsScreen />
        </View>
    );
}
