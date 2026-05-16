// SettingsScreen.tsx

import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Switch,
  TouchableOpacity,
} from "react-native";

const SettingsScreen = () => {
  // Permissions
  const [cameraEnabled, setCameraEnabled] =
    useState(true);

  const [locationEnabled, setLocationEnabled] =
    useState(true);

  const [microphoneEnabled, setMicrophoneEnabled] =
    useState(true);

  const [motionEnabled, setMotionEnabled] =
    useState(false);

  // Notifications
  const [reportReminderEnabled, setReportReminderEnabled] =
    useState(true);

  const [templateUpdatesEnabled, setTemplateUpdatesEnabled] =
    useState(true);

  // Storage
  const [cloudSyncEnabled, setCloudSyncEnabled] =
    useState(true);

  return (
    <SafeAreaView className="flex-1 bg-your color">
      
      {/* Header */}
      <View className="border-b border-your color px-5 py-4">
        <Text className="text-3xl font-bold text-your color">
          Settings
        </Text>
      </View>

      {/* Permissions */}
      <View className="px-5 pt-5">
        <Text className="mb-4 text-xs font-bold uppercase tracking-widest text-your color">
          Permissions
        </Text>

        {/* Camera */}
        <View className="flex-row items-center justify-between border-b border-your color py-4">
          <Text className="text-base text-your color">
            Camera
          </Text>

          <Switch
            value={cameraEnabled}
            onValueChange={setCameraEnabled}
            trackColor={{
              false: "#d1d5db",
              true: "#f59e0b",
            }}
            thumbColor="#ffffff"
          />
        </View>

        {/* Location */}
        <View className="flex-row items-center justify-between border-b border-your color py-4">
          <Text className="text-base text-your color">
            Location (GPS)
          </Text>

          <Switch
            value={locationEnabled}
            onValueChange={setLocationEnabled}
            trackColor={{
              false: "#d1d5db",
              true: "#f59e0b",
            }}
            thumbColor="#ffffff"
          />
        </View>

        {/* Microphone */}
        <View className="flex-row items-center justify-between border-b border-your color py-4">
          <Text className="text-base text-your color">
            Microphone
          </Text>

          <Switch
            value={microphoneEnabled}
            onValueChange={setMicrophoneEnabled}
            trackColor={{
              false: "#d1d5db",
              true: "#f59e0b",
            }}
            thumbColor="#ffffff"
          />
        </View>

        {/* Motion Sensors */}
        <View className="flex-row items-center justify-between border-b border-your color py-4">
          <Text className="text-base text-your color">
            Motion sensors
          </Text>

          <Switch
            value={motionEnabled}
            onValueChange={setMotionEnabled}
            trackColor={{
              false: "#d1d5db",
              true: "#f59e0b",
            }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      {/* Notifications */}
      <View className="px-5 pt-5">
        <Text className="mb-4 text-xs font-bold uppercase tracking-widest text-your color">
          Notifications
        </Text>

        {/* Report Reminders */}
        <View className="flex-row items-center justify-between border-b border-your color py-4">
          <Text className="text-base text-your color">
            Report reminders
          </Text>

          <Switch
            value={reportReminderEnabled}
            onValueChange={setReportReminderEnabled}
            trackColor={{
              false: "#d1d5db",
              true: "#f59e0b",
            }}
            thumbColor="#ffffff"
          />
        </View>

        {/* Template Updates */}
        <View className="flex-row items-center justify-between border-b border-your color py-4">
          <Text className="text-base text-your color">
            Template updates
          </Text>

          <Switch
            value={templateUpdatesEnabled}
            onValueChange={setTemplateUpdatesEnabled}
            trackColor={{
              false: "#d1d5db",
              true: "#f59e0b",
            }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      {/* Storage & Data */}
      <View className="px-5 pt-5">
        <Text className="mb-4 text-xs font-bold uppercase tracking-widest text-your color">
          Storage & Data
        </Text>

        {/* Cloud Sync */}
        <View className="flex-row items-center justify-between border-b border-your color py-4">
          <Text className="text-base text-your color">
            Cloud sync
          </Text>

          <Switch
            value={cloudSyncEnabled}
            onValueChange={setCloudSyncEnabled}
            trackColor={{
              false: "#d1d5db",
              true: "#f59e0b",
            }}
            thumbColor="#ffffff"
          />
        </View>

        {/* Local Storage */}
        <View className="flex-row items-center justify-between border-b border-your color py-4">
          <Text className="text-base text-your color">
            Local storage used
          </Text>

          <Text className="text-your color">
            1.2 GB
          </Text>
        </View>

        {/* Export */}
        <TouchableOpacity className="border-b border-your color py-4">
          <Text className="font-medium text-your color">
            Export & backup data
          </Text>
        </TouchableOpacity>
      </View>

      {/* About */}
      <View className="px-5 pt-5">
        <Text className="mb-4 text-xs font-bold uppercase tracking-widest text-your color">
          About
        </Text>

        {/* Version */}
        <View className="flex-row items-center justify-between border-b border-your color py-4">
          <Text className="text-base text-your color">
            App version
          </Text>

          <Text className="text-your color">
            2.1.0 (441)
          </Text>
        </View>

        {/* Terms */}
        <TouchableOpacity className="flex-row items-center justify-between py-4">
          <Text className="text-base text-your color">
            Terms & privacy policy
          </Text>

          <Text className="text-lg text-your color">
            ›
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;