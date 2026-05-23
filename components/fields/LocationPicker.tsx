import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Region } from "react-native-maps";

interface Props {
    onConfirm: (address: string) => void;
    onCancel: () => void;
}

export default function LocationPicker({ onConfirm, onCancel }: Props) {
    const [initialRegion, setInitialRegion] = useState<Region | null>(null);
    // Tracks the current map center — updated on every pan/zoom end
    const centerRef = useRef<{ latitude: number; longitude: number } | null>(null);
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(true);
    const [geocoding, setGeocoding] = useState(false);

    const doReverseGeocode = async (lat: number, lng: number) => {
        setGeocoding(true);
        try {
            const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
            if (results.length > 0) {
                const r = results[0];
                const parts = [r.streetNumber, r.street, r.district ?? r.city, r.region].filter(Boolean);
                setAddress(parts.length > 0 ? parts.join(" ") : `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
            }
        } catch {
            setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        } finally {
            setGeocoding(false);
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === "granted") {
                    const pos = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                    });
                    const { latitude, longitude } = pos.coords;
                    const region = { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };
                    setInitialRegion(region);
                    centerRef.current = { latitude, longitude };
                    await doReverseGeocode(latitude, longitude);
                } else {
                    setInitialRegion({ latitude: -33.8688, longitude: 151.2093, latitudeDelta: 0.05, longitudeDelta: 0.05 });
                }
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleConfirm = () => {
        const c = centerRef.current;
        onConfirm(address || (c ? `${c.latitude.toFixed(5)}, ${c.longitude.toFixed(5)}` : ""));
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#0f172a" }}>
            {/* Header */}
            <View style={{
                flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
                backgroundColor: "#0f172a", borderBottomWidth: 1, borderBottomColor: "#1e293b",
            }}>
                <TouchableOpacity
                    onPress={onCancel}
                    style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#1e293b", alignItems: "center", justifyContent: "center" }}
                >
                    <Ionicons name="close" size={18} color="#fff" />
                </TouchableOpacity>
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>Pick location</Text>
                <TouchableOpacity
                    onPress={handleConfirm}
                    style={{ backgroundColor: "#f2a72f", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}
                >
                    <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Confirm</Text>
                </TouchableOpacity>
            </View>

            {/* Map + fixed centre-pin overlay */}
            {loading ? (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <ActivityIndicator size="large" color="#f2a72f" />
                    <Text style={{ color: "#94a3b8", marginTop: 12, fontSize: 13 }}>Getting your location…</Text>
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    <MapView
                        style={{ flex: 1 }}
                        initialRegion={initialRegion ?? { latitude: -33.8688, longitude: 151.2093, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
                        showsUserLocation
                        showsMyLocationButton
                        onRegionChangeComplete={(region) => {
                            centerRef.current = { latitude: region.latitude, longitude: region.longitude };
                            doReverseGeocode(region.latitude, region.longitude);
                        }}
                    />
                    {/* Fixed pin at screen centre — tip aligns with exact map centre */}
                    <View
                        pointerEvents="none"
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            // Shift left by half icon width; shift up by full icon height so the tip lands on centre
                            transform: [{ translateX: -20 }, { translateY: -40 }],
                        }}
                    >
                        <Ionicons name="location" size={40} color="#f2a72f" />
                    </View>
                </View>
            )}

            {/* Address preview bar */}
            <View style={{
                backgroundColor: "#0f172a", borderTopWidth: 1, borderTopColor: "#1e293b",
                paddingHorizontal: 20, paddingVertical: 14, paddingBottom: 32,
                flexDirection: "row", alignItems: "center", gap: 10,
            }}>
                <Ionicons name="location" size={18} color="#f2a72f" />
                {geocoding ? (
                    <ActivityIndicator size="small" color="#94a3b8" />
                ) : (
                    <Text style={{ color: address ? "#fff" : "#52525b", fontSize: 13, flex: 1 }} numberOfLines={2}>
                        {address || "Pan the map to position the pin"}
                    </Text>
                )}
            </View>
        </View>
    );
}
