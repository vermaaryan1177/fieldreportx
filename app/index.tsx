import "./global.css";

import { View } from "react-native";
import LoginRegisterScreen from "./screens/LoginRegisterScreen";

export default function Home() {
    return (
        <View>
            <LoginRegisterScreen />
        </View>
    );
}
