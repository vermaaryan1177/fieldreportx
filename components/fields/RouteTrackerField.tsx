import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Modal,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";

import { trackingStore, RouteFieldData, RouteStop, haversineKm } from "@/lib/trackingStore";

function formatDuration(sec: number): string {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatEta(sec: number): string {
    if (sec < 60) return "< 1 min";
    const h = Math.floor(sec / 3600);
    const m = Math.ceil((sec % 3600) / 60);
    return h > 0 ? `~${h}h ${m}min` : `~${m} min`;
}

interface Props {
    value: string | boolean | number | undefined;
    onChange: (v: string) => void;
}

export default function RouteTrackerField({ value, onChange }: Props) {
    const [, refresh] = useState(0);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    const mapRef = useRef<MapView>(null);
    const [destPickerOpen, setDestPickerOpen] = useState(false);
    const [destRegion, setDestRegion] = useState<Region | null>(null);
    const [lastStopFlash, setLastStopFlash] = useState(0);

    useEffect(() => trackingStore.subscribe(() => refresh((n) => n + 1)), []);

    // Sync completed result that finished while unmounted
    useEffect(() => {
        if (trackingStore.routeStatus === "done" && trackingStore.routeResult) {
            const s = JSON.stringify(trackingStore.routeResult);
            if (String(value ?? "") !== s) onChangeRef.current(s);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Animate live map to latest waypoint during tracking
    const wpCount = trackingStore.routeWaypoints.length;
    useEffect(() => {
        if (trackingStore.routeStatus !== "tracking") return;
        const last = trackingStore.routeWaypoints[wpCount - 1];
        if (!last || !mapRef.current) return;
        mapRef.current.animateToRegion(
            { latitude: last.lat, longitude: last.lng, latitudeDelta: 0.008, longitudeDelta: 0.008 },
            400,
        );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wpCount]);

    const savedData: RouteFieldData | null = (() => {
        if (trackingStore.routeStatus !== "idle") return null;
        if (!value || typeof value !== "string") return null;
        try { return JSON.parse(value); } catch { return null; }
    })();

    const handleStart = async () => {
        const ok = await trackingStore.startRoute();
        if (!ok) Alert.alert("Permission required", "Location access is needed for route tracking.");
    };

    const handleStop = () => {
        const result = trackingStore.stopRoute();
        onChangeRef.current(JSON.stringify(result));
    };

    const handleReset = () => {
        trackingStore.resetRoute();
        onChangeRef.current("");
    };

    const handleRecordStop = () => {
        trackingStore.recordStop();
        setLastStopFlash(Date.now());
    };

    const openDestPicker = async () => {
        try {
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            setDestRegion({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            });
        } catch {
            setDestRegion({ latitude: -33.87, longitude: 151.21, latitudeDelta: 0.05, longitudeDelta: 0.05 });
        }
        setDestPickerOpen(true);
    };

    const confirmDest = () => {
        if (destRegion) trackingStore.setDestination(destRegion.latitude, destRegion.longitude);
        setDestPickerOpen(false);
    };

    // ── Destination picker modal (inlined — never define as inner component) ──
    const destPickerModal = (
        <Modal visible={destPickerOpen} animationType="slide">
            <View style={{ flex: 1, backgroundColor: "#0f172a" }}>
                {destRegion && (
                    <MapView
                        style={{ flex: 1 }}
                        initialRegion={destRegion}
                        onRegionChangeComplete={(r) => setDestRegion(r)}
                        showsUserLocation
                    />
                )}
                <View style={{ position: "absolute", top: "50%", left: "50%", transform: [{ translateX: -16 }, { translateY: -40 }], alignItems: "center" }} pointerEvents="none">
                    <Ionicons name="location" size={32} color="#ef4444" />
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#ef4444", marginTop: -4 }} />
                </View>
                <View style={{ position: "absolute", top: 52, left: 0, right: 0, alignItems: "center" }}>
                    <View style={{ backgroundColor: "rgba(15,23,42,0.85)", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}>
                        <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>Move map to set destination</Text>
                    </View>
                </View>
                <View style={{ flexDirection: "row", gap: 12, padding: 20, paddingBottom: 40 }}>
                    <TouchableOpacity onPress={() => setDestPickerOpen(false)} style={{ flex: 1, backgroundColor: "#1e293b", borderRadius: 12, paddingVertical: 14, alignItems: "center" }}>
                        <Text style={{ color: "#94a3b8", fontWeight: "600" }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={confirmDest} style={{ flex: 2, backgroundColor: "#ef4444", borderRadius: 12, paddingVertical: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}>
                        <Ionicons name="location" size={16} color="#fff" />
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>Set Destination</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    // ── Active tracking ──────────────────────────────────────────────────────
    if (trackingStore.routeStatus === "tracking") {
        const liveCoords = trackingStore.routeWaypoints.map((w) => ({ latitude: w.lat, longitude: w.lng }));
        const firstWp = trackingStore.routeWaypoints[0];
        const dest = trackingStore.routeDestination;
        const stopFlashed = Date.now() - lastStopFlash < 1500;

        return (
            <View style={{ gap: 10 }}>
                {destPickerModal}

                {/* Live map */}
                {firstWp && (
                    <View style={{ borderRadius: 12, overflow: "hidden", height: 220 }}>
                        <MapView
                            ref={mapRef}
                            style={{ flex: 1 }}
                            initialRegion={{ latitude: firstWp.lat, longitude: firstWp.lng, latitudeDelta: 0.008, longitudeDelta: 0.008 }}
                            showsUserLocation
                        >
                            {liveCoords.length > 1 && (
                                <Polyline coordinates={liveCoords} strokeColor="#f2a72f" strokeWidth={3} />
                            )}
                            {trackingStore.routeStops.map((stop) => (
                                <Marker
                                    key={stop.index}
                                    coordinate={{ latitude: stop.lat, longitude: stop.lng }}
                                    title={`Stop ${stop.index}`}
                                    pinColor="blue"
                                />
                            ))}
                            {dest && (
                                <Marker coordinate={{ latitude: dest.lat, longitude: dest.lng }} title="Destination" pinColor="red" />
                            )}
                        </MapView>
                    </View>
                )}

                {/* Stats row */}
                <View style={{ backgroundColor: "#1e293b", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#ef444430", gap: 10 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#ef4444" }} />
                            <Text style={{ color: "#ef4444", fontWeight: "bold", fontSize: 13 }}>
                                Recording  ·  {formatDuration(trackingStore.routeElapsed)}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => trackingStore.cancelRoute()}>
                            <Text style={{ color: "#52525b", fontSize: 12 }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <View>
                            <Text style={{ color: "#52525b", fontSize: 11 }}>Distance</Text>
                            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
                                {trackingStore.routeDistance.toFixed(2)}{" "}
                                <Text style={{ fontSize: 11, fontWeight: "normal", color: "#94a3b8" }}>km</Text>
                            </Text>
                        </View>
                        <View>
                            <Text style={{ color: "#52525b", fontSize: 11 }}>Speed</Text>
                            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
                                {trackingStore.routeLiveSpeed}{" "}
                                <Text style={{ fontSize: 11, fontWeight: "normal", color: "#94a3b8" }}>km/h</Text>
                            </Text>
                        </View>
                        <View>
                            <Text style={{ color: "#52525b", fontSize: 11 }}>Stops</Text>
                            <Text style={{ color: stopFlashed ? "#22c55e" : "#fff", fontWeight: "bold", fontSize: 18 }}>
                                {trackingStore.routeStops.length}
                            </Text>
                        </View>
                        {trackingStore.routeEtaSec !== null && (
                            <View>
                                <Text style={{ color: "#52525b", fontSize: 11 }}>ETA</Text>
                                <Text style={{ color: "#f2a72f", fontWeight: "bold", fontSize: 15 }}>
                                    {formatEta(trackingStore.routeEtaSec)}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Destination row */}
                <TouchableOpacity
                    onPress={openDestPicker}
                    style={{ backgroundColor: "#1e293b", borderWidth: 1, borderColor: dest ? "#ef444440" : "#3f3f46", borderRadius: 12, paddingVertical: 11, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                    <Ionicons name="location-outline" size={16} color={dest ? "#ef4444" : "#52525b"} />
                    <Text style={{ color: dest ? "#f87171" : "#52525b", fontSize: 13, flex: 1 }}>
                        {dest
                            ? `Destination set · ${haversineKm({ lat: trackingStore.routeWaypoints[trackingStore.routeWaypoints.length - 1]?.lat ?? dest.lat, lng: trackingStore.routeWaypoints[trackingStore.routeWaypoints.length - 1]?.lng ?? dest.lng }, dest).toFixed(1)} km away`
                            : "Set destination for ETA"}
                    </Text>
                    {dest && (
                        <TouchableOpacity onPress={(e) => { e.stopPropagation(); trackingStore.clearDestination(); }}>
                            <Ionicons name="close-circle" size={16} color="#52525b" />
                        </TouchableOpacity>
                    )}
                </TouchableOpacity>

                {/* Action buttons */}
                <View style={{ flexDirection: "row", gap: 10 }}>
                    <TouchableOpacity
                        onPress={handleRecordStop}
                        activeOpacity={0.8}
                        style={{ flex: 1, backgroundColor: stopFlashed ? "#14532d" : "#1e293b", borderWidth: 1, borderColor: stopFlashed ? "#22c55e" : "#3f3f46", borderRadius: 12, paddingVertical: 13, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 }}
                    >
                        <Ionicons name="flag" size={16} color={stopFlashed ? "#22c55e" : "#71717a"} />
                        <Text style={{ color: stopFlashed ? "#22c55e" : "#71717a", fontWeight: "600", fontSize: 14 }}>
                            {stopFlashed ? "Stop Recorded!" : "Record Stop"}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleStop}
                        activeOpacity={0.8}
                        style={{ flex: 1, backgroundColor: "#7f1d1d", borderWidth: 1, borderColor: "#ef444440", borderRadius: 12, paddingVertical: 13, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 }}
                    >
                        <Ionicons name="stop-circle" size={16} color="#ef4444" />
                        <Text style={{ color: "#ef4444", fontWeight: "bold", fontSize: 14 }}>End Route</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // ── Completed / saved result ─────────────────────────────────────────────
    const displayData: RouteFieldData | null =
        trackingStore.routeStatus === "done" ? trackingStore.routeResult : savedData;

    if (displayData) {
        const coords = displayData.waypoints.map((w) => ({ latitude: w.lat, longitude: w.lng }));
        const durationSec = Math.floor((displayData.endTime - displayData.startTime) / 1000);
        const first = coords[0];
        const last = coords[coords.length - 1];
        const stops: RouteStop[] = displayData.stops ?? [];
        const dest = displayData.destination;

        return (
            <View style={{ gap: 10 }}>
                {coords.length > 1 && first && last && (
                    <MapView
                        style={{ height: 220, borderRadius: 12 }}
                        initialRegion={{ latitude: first.latitude, longitude: first.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
                        scrollEnabled zoomEnabled
                    >
                        <Polyline coordinates={coords} strokeColor="#f2a72f" strokeWidth={3} />
                        <Marker coordinate={first} pinColor="green" title="Start" />
                        <Marker coordinate={last} pinColor="orange" title="End" />
                        {stops.map((stop) => (
                            <Marker
                                key={stop.index}
                                coordinate={{ latitude: stop.lat, longitude: stop.lng }}
                                title={`Stop ${stop.index}`}
                                pinColor="blue"
                            />
                        ))}
                        {dest && (
                            <Marker coordinate={{ latitude: dest.lat, longitude: dest.lng }} title="Destination" pinColor="red" />
                        )}
                    </MapView>
                )}

                {/* Metrics */}
                <View style={{ backgroundColor: "#1e293b", borderRadius: 12, padding: 16, gap: 12 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <View>
                            <Text style={{ color: "#52525b", fontSize: 11 }}>Distance</Text>
                            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>{displayData.distanceKm} km</Text>
                        </View>
                        <View>
                            <Text style={{ color: "#52525b", fontSize: 11 }}>Duration</Text>
                            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>{formatDuration(durationSec)}</Text>
                        </View>
                        <View>
                            <Text style={{ color: "#52525b", fontSize: 11 }}>Stops</Text>
                            <Text style={{ color: "#60a5fa", fontWeight: "bold", fontSize: 18 }}>{stops.length}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <View>
                            <Text style={{ color: "#52525b", fontSize: 11 }}>Avg Speed</Text>
                            <Text style={{ color: "#22c55e", fontWeight: "bold", fontSize: 15 }}>{displayData.avgSpeedKmh} km/h</Text>
                        </View>
                        <View>
                            <Text style={{ color: "#52525b", fontSize: 11 }}>Top Speed</Text>
                            <Text style={{ color: "#ef4444", fontWeight: "bold", fontSize: 15 }}>{displayData.topSpeedKmh} km/h</Text>
                        </View>
                        <View>
                            <Text style={{ color: "#52525b", fontSize: 11 }}>Min Speed</Text>
                            <Text style={{ color: "#94a3b8", fontWeight: "bold", fontSize: 15 }}>{displayData.minSpeedKmh} km/h</Text>
                        </View>
                    </View>
                </View>

                {/* Stop list */}
                {stops.length > 0 && (
                    <View style={{ backgroundColor: "#1e293b", borderRadius: 12, padding: 14, gap: 8 }}>
                        <Text style={{ color: "#71717a", fontSize: 11, fontWeight: "600", marginBottom: 2 }}>RECORDED STOPS</Text>
                        {stops.map((stop) => (
                            <View key={stop.index} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#1d4ed8", alignItems: "center", justifyContent: "center" }}>
                                    <Text style={{ color: "#fff", fontSize: 11, fontWeight: "bold" }}>{stop.index}</Text>
                                </View>
                                <Text style={{ color: "#94a3b8", fontSize: 13 }}>
                                    {new Date(stop.ts).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                                </Text>
                                <Text style={{ color: "#52525b", fontSize: 12 }}>
                                    {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                <TouchableOpacity
                    onPress={handleReset}
                    activeOpacity={0.7}
                    style={{ backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#3f3f46", borderRadius: 12, paddingVertical: 12, alignItems: "center" }}
                >
                    <Text style={{ color: "#94a3b8", fontSize: 13, fontWeight: "600" }}>Reset & Track Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ── Idle ────────────────────────────────────────────────────────────────
    return (
        <View style={{ gap: 10 }}>
            {destPickerModal}
            {/* Destination setter (optional before starting) */}
            <TouchableOpacity
                onPress={openDestPicker}
                style={{ backgroundColor: "#1e293b", borderWidth: 1, borderColor: trackingStore.routeDestination ? "#ef444440" : "#3f3f46", borderRadius: 12, paddingVertical: 11, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 8 }}
            >
                <Ionicons name="location-outline" size={16} color={trackingStore.routeDestination ? "#ef4444" : "#52525b"} />
                <Text style={{ color: trackingStore.routeDestination ? "#f87171" : "#52525b", fontSize: 13, flex: 1 }}>
                    {trackingStore.routeDestination ? "Destination set (tap to change)" : "Set destination (optional — enables ETA)"}
                </Text>
                {trackingStore.routeDestination && (
                    <TouchableOpacity onPress={() => trackingStore.clearDestination()}>
                        <Ionicons name="close-circle" size={16} color="#52525b" />
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
            <TouchableOpacity
                onPress={handleStart}
                activeOpacity={0.8}
                style={{ backgroundColor: "#14532d", borderWidth: 1, borderColor: "#22c55e40", borderRadius: 12, paddingVertical: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
            >
                <Ionicons name="navigate" size={18} color="#22c55e" />
                <Text style={{ color: "#22c55e", fontWeight: "bold", fontSize: 15 }}>Start Route Tracking</Text>
            </TouchableOpacity>
        </View>
    );
}
