import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNavBar, { AppScreen } from "@/components/BottomNavBar";

interface Props {
  onNavigate: (screen: AppScreen) => void;
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Member" | "Pending";
  initials: string;
}

export default function OrganisationScreen({ onNavigate }: Props) {
  const [members, setMembers] = useState<Member[]>([
    {
      id: "1",
      name: "John Appleseed",
      email: "johnappleseed@gmail.com",
      role: "Admin",
      initials: "JA",
    },
    {
      id: "2",
      name: "Jon Doe",
      email: "jondoe@gmail.com",
      role: "Member",
      initials: "JD",
    },
    {
      id: "3",
      name: "Jane Doe",
      email: "janedoe@gmail.com",
      role: "Member",
      initials: "JD",
    },
    {
      id: "4",
      name: "Joe Shmoe",
      email: "joeshmoe@gmail.com",
      role: "Pending",
      initials: "JS",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");

  const revokeInvite = (id: string) => {
    Alert.alert(
      "Revoke Invite",
      "Are you sure you want to revoke this invite?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Revoke",
          style: "destructive",
          onPress: () => {
            setMembers((prev) => prev.filter((m) => m.id !== id));
          },
        },
      ]
    );
  };

  const changeRole = (id: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, role: m.role === "Admin" ? "Member" : "Admin" }
          : m
      )
    );
  };

  const handleInvite = () => {
    setShowModal(true);
  };

  const sendInvite = () => {
    if (!email.trim()) {
      Alert.alert("Please enter an email");
      return;
    }

    const username = email.split("@")[0];

    const newMember: Member = {
      id: Date.now().toString(),
      name: username,
      email: email,
      role: "Pending",
      initials: username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase(),
    };

    setMembers((prev) => [...prev, newMember]);

    setEmail("");
    setShowModal(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-6">
        {/* Top Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-white">
            Organisation
          </Text>

          <TouchableOpacity onPress={handleInvite}>
            <Text className="text-primary text-base">+ Invite</Text>
          </TouchableOpacity>
        </View>

        {/* Company Card */}
        <View className="bg-slate-900 rounded-2xl p-4 mb-6">
          <View className="flex-row items-center">
            <View className="h-14 w-14 rounded-full bg-primary items-center justify-center mr-4">
              <Text className="text-white font-bold">FI</Text>
            </View>

            <View>
              <Text className="text-white text-lg font-semibold">
                Field Inspectors Co
              </Text>

              <Text className="text-zinc-400 text-sm mt-1">
                {members.filter((m) => m.role !== "Pending").length} members
              </Text>
            </View>
          </View>
        </View>

        {/* Members List */}
        <Text className="text-zinc-400 uppercase text-xs font-bold mb-3">
          Members
        </Text>

        {members.map((member) => {
          if (member.role === "Pending") {
            return (
              <View
                key={member.id}
                className="border border-dashed border-slate-600 rounded-2xl p-4 mb-3"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="h-12 w-12 rounded-full border border-slate-600 items-center justify-center mr-3">
                      <Text className="text-zinc-400 text-lg">?</Text>
                    </View>

                    <View>
                      <Text className="text-white font-semibold">
                        {member.name}
                      </Text>

                      <Text className="text-zinc-400 text-sm">
                        Invite pending
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => revokeInvite(member.id)}
                  >
                    <Text className="text-red-500 font-medium">
                      Revoke
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }

          return (
            <View
              key={member.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-3"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="h-12 w-12 rounded-full bg-primary items-center justify-center mr-3">
                    <Text className="text-white font-bold">
                      {member.initials}
                    </Text>
                  </View>

                  <View>
                    <Text className="text-white font-semibold">
                      {member.name}
                    </Text>

                    <Text className="text-zinc-400 text-sm">
                      {member.email}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <TouchableOpacity
                    className="bg-primary px-3 py-1 rounded-full"
                    onPress={() => changeRole(member.id)}
                  >
                    <Text className="text-white text-xs">
                      {member.role}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="ml-2"
                    onPress={() =>
                      Alert.alert(
                        "Member Options",
                        "Edit or Remove member"
                      )
                    }
                  >
                    <Text className="text-zinc-400 text-lg">⋮</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        {/* Reports Section */}
        <Text className="text-zinc-400 uppercase text-xs font-bold mb-3 mt-6">
          Team Reports
        </Text>

        <TouchableOpacity
          className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-3 flex-row items-center justify-between"
          onPress={() => onNavigate("reports")}
        >
          <Text className="text-white">
            View all organisation reports
          </Text>

          <Text className="text-zinc-400">{">"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex-row items-center justify-between"
          onPress={() => onNavigate("templates")}
        >
          <View className="flex-row items-center">
            <Text className="text-white">Shared templates</Text>

            <Text className="text-zinc-400 text-sm ml-3">
              4 templates
            </Text>
          </View>

          <Text className="text-zinc-400">{">"}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Invite Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View
          className="flex-1 items-center justify-center px-6"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        >
          <View className="w-full rounded-2xl bg-slate-900 p-5">
            <Text className="mb-4 text-xl font-bold text-white">
              Invite Member
            </Text>

            <TextInput
              placeholder="Enter email"
              placeholderTextColor="#71717a"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white"
            />

            <View className="mt-5 flex-row justify-end">
              <TouchableOpacity
                onPress={() => {
                  setShowModal(false);
                  setEmail("");
                }}
                className="mr-3 px-4 py-2"
              >
                <Text className="text-zinc-400">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={sendInvite}
                className="rounded-xl bg-primary px-4 py-2"
              >
                <Text className="font-semibold text-white">
                  Send Invite
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNavBar active="settings" onNavigate={onNavigate} />
    </SafeAreaView>
  );
}