import React, { useEffect, useState } from "react";
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

import {
  createOrganisation,
  getUserOrganisation,
  removeMember,
} from "@/lib/db/organisations";

import { auth } from "@/lib/firebase";

interface Props {
  onNavigate: (screen: AppScreen) => void;
}

interface Member {
  uid: string;
  name: string;
  email: string;
  role: "Admin" | "Member";
}

export default function OrganisationScreen({ onNavigate }: Props) {
  const user = auth.currentUser;

  const [organisation, setOrganisation] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgAbn, setOrgAbn] = useState("");
  const [orgAddress, setOrgAddress] = useState("");

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    loadOrganisation();
  }, []);

  const loadOrganisation = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);

      const org = await getUserOrganisation(user.uid);

      if (!org) {
        setOrganisation(null);
        setMembers([]);
        setLoading(false);
        return;
      }

      setOrganisation(org);

      const tempMembers: Member[] = org.memberUids.map((uid: string) => ({
        uid,
        name: uid === org.adminUid ? "Admin User" : "Member User",
        email: `${uid}@mail.com`,
        role: uid === org.adminUid ? "Admin" : "Member",
      }));

      setMembers(tempMembers);
      setLoading(false);
    } catch (e) {
      console.log("LOAD ORG ERROR:", e);
      setLoading(false);
    }
  };

  // ✅ FIXED CREATE FLOW (important fix here)
  const handleCreateOrganisation = async () => {
    if (!user?.uid) return;

    if (!orgName || !orgAbn || !orgAddress) {
      Alert.alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await createOrganisation(user.uid, {
        name: orgName,
        abn: orgAbn,
        address: orgAddress,
      });

      setShowCreateModal(false);

      setOrgName("");
      setOrgAbn("");
      setOrgAddress("");

      // 🔥 IMPORTANT: ensure Firestore propagation + cache update
      await new Promise((res) => setTimeout(res, 500));

      await loadOrganisation();
    } catch (e) {
      console.log("CREATE ORG ERROR:", e);
      Alert.alert("Failed to create organisation");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = () => {
    setShowInviteModal(true);
  };

  const addMemberToList = () => {
    if (!inviteEmail) {
      Alert.alert("Enter email");
      return;
    }

    const newMember: Member = {
      uid: Date.now().toString(),
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: "Member",
    };

    setMembers((prev) => [...prev, newMember]);

    setInviteEmail("");
    setShowInviteModal(false);
  };

  const handleMemberMenu = (member: Member) => {
    Alert.alert(member.name, "Choose an action", [
      {
        text: member.role === "Admin" ? "Make Member" : "Make Admin",
        onPress: () => {
          setMembers((prev) =>
            prev.map((m) =>
              m.uid === member.uid
                ? {
                    ...m,
                    role: m.role === "Admin" ? "Member" : "Admin",
                  }
                : m
            )
          );
        },
      },
      {
        text: "Remove Member",
        style: "destructive",
        onPress: async () => {
          if (organisation) {
            await removeMember(organisation.id, member.uid);
          }

          setMembers((prev) =>
            prev.filter((m) => m.uid !== member.uid)
          );
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-white">Loading organisation...</Text>
      </SafeAreaView>
    );
  }

  if (!organisation) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-white text-3xl font-bold mb-4">
            No Organisation
          </Text>

          <Text className="text-zinc-400 text-center mb-8">
            Create an organisation to manage team members and reports.
          </Text>

          <TouchableOpacity
            className="bg-primary px-6 py-4 rounded-2xl"
            onPress={() => setShowCreateModal(true)}
          >
            <Text className="text-white font-semibold">
              Create Organisation
            </Text>
          </TouchableOpacity>
        </View>

        <Modal visible={showCreateModal} transparent animationType="fade">
          <View
            className="flex-1 items-center justify-center px-6"
            style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          >
            <View className="w-full rounded-2xl bg-slate-900 p-5">
              <Text className="text-white text-xl font-bold mb-4">
                Create Organisation
              </Text>

              <TextInput
                placeholder="Organisation name"
                placeholderTextColor="#71717a"
                value={orgName}
                onChangeText={setOrgName}
                className="bg-slate-800 text-white rounded-xl px-4 py-3 mb-3"
              />

              <TextInput
                placeholder="ABN"
                placeholderTextColor="#71717a"
                value={orgAbn}
                onChangeText={setOrgAbn}
                className="bg-slate-800 text-white rounded-xl px-4 py-3 mb-3"
              />

              <TextInput
                placeholder="Address"
                placeholderTextColor="#71717a"
                value={orgAddress}
                onChangeText={setOrgAddress}
                className="bg-slate-800 text-white rounded-xl px-4 py-3"
              />

              <View className="flex-row justify-end mt-5">
                <TouchableOpacity
                  onPress={() => setShowCreateModal(false)}
                  className="mr-3 px-4 py-2"
                >
                  <Text className="text-zinc-400">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCreateOrganisation}
                  className="bg-primary px-4 py-2 rounded-xl"
                >
                  <Text className="text-white font-semibold">
                    Create
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

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-6">
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-white">
            Organisation
          </Text>

          <TouchableOpacity onPress={handleInvite}>
            <Text className="text-primary text-base">+ Invite</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-slate-900 rounded-2xl p-4 mb-6">
          <View className="flex-row items-center">
            <View className="h-14 w-14 rounded-full bg-primary items-center justify-center mr-4">
              <Text className="text-white font-bold">
                {organisation.name?.[0]}
              </Text>
            </View>

            <View>
              <Text className="text-white text-lg font-semibold">
                {organisation.name}
              </Text>

              <Text className="text-zinc-400 text-sm mt-1">
                {members.length} members
              </Text>
            </View>
          </View>
        </View>

        <Text className="text-zinc-400 uppercase text-xs font-bold mb-3">
          Members
        </Text>

        {members.map((member) => (
          <View
            key={member.uid}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-3"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="h-12 w-12 rounded-full bg-primary items-center justify-center mr-3">
                  <Text className="text-white font-bold">
                    {member.name[0]}
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
                <View className="bg-primary px-3 py-1 rounded-full mr-2">
                  <Text className="text-white text-xs">
                    {member.role}
                  </Text>
                </View>

                <TouchableOpacity onPress={() => handleMemberMenu(member)}>
                  <Text className="text-zinc-400 text-lg">⋮</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={showInviteModal} transparent animationType="fade">
        <View
          className="flex-1 items-center justify-center px-6"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        >
          <View className="w-full rounded-2xl bg-slate-900 p-5">
            <Text className="text-white text-xl font-bold mb-4">
              Invite Member
            </Text>

            <TextInput
              placeholder="Enter email"
              placeholderTextColor="#71717a"
              value={inviteEmail}
              onChangeText={setInviteEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white"
            />

            <View className="mt-5 flex-row justify-end">
              <TouchableOpacity
                onPress={() => {
                  setShowInviteModal(false);
                  setInviteEmail("");
                }}
                className="mr-3 px-4 py-2"
              >
                <Text className="text-zinc-400">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={addMemberToList}
                className="rounded-xl bg-primary px-4 py-2"
              >
                <Text className="font-semibold text-white">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNavBar active="settings" onNavigate={onNavigate} />
    </SafeAreaView>
  );
}