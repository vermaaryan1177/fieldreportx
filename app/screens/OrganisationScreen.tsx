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

import { Ionicons } from "@expo/vector-icons";

import AppHeader from "@/components/Header";
import BottomNavBar, { AppScreen } from "@/components/BottomNavBar";

import {
  createOrganisation,
  getUserOrganisation,
  addMember,
} from "@/lib/db/organisations";

import { auth } from "@/lib/firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { db as firestoreDb } from "@/lib/firebase";

interface Props {
  onNavigate: (screen: AppScreen) => void;
  onOpenSidebar: () => void;
}

interface Member {
  uid: string;
  name: string;
  email: string;
  role: "Admin" | "Member";
}

export default function OrganisationScreen({
  onNavigate,
  onOpenSidebar,
}: Props) {
  const user = auth.currentUser;

  const [organisations, setOrganisations] = useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<any | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [orgName, setOrgName] = useState("");
  const [orgAbn, setOrgAbn] = useState("");
  const [orgAddress, setOrgAddress] = useState("");

  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    if (!user?.uid) return;
    loadOrgs();
  }, []);

  const loadOrgs = async () => {
    try {
      setLoading(true);

      const orgs = await getUserOrganisation(user!.uid);
      const safe = Array.isArray(orgs) ? orgs : [];

      setOrganisations(safe);

      if (safe.length > 0) {
        setSelectedOrg(safe[0]);
        buildMembers(safe[0]);
      } else {
        setSelectedOrg(null);
        setMembers([]);
      }
    } catch (e) {
      console.log("LOAD ORGS ERROR:", e);
    } finally {
      setLoading(false);
    }
  };

  const buildMembers = (org: any) => {
    if (!org?.memberUids) {
      setMembers([]);
      return;
    }

    const list: Member[] = org.memberUids.map((uid: string) => ({
      uid,
      name: uid === org.adminUid ? "Admin" : uid,
      email: uid,
      role: uid === org.adminUid ? "Admin" : "Member",
    }));

    setMembers(list);
  };

  const handleCreateOrganisation = async () => {
    if (!user?.uid) return;

    if (!orgName || !orgAbn || !orgAddress) {
      Alert.alert("Fill all fields");
      return;
    }

    try {
      await createOrganisation(user.uid, {
        name: orgName,
        abn: orgAbn,
        address: orgAddress,
      });

      setOrgName("");
      setOrgAbn("");
      setOrgAddress("");
      setShowCreateModal(false);

      await loadOrgs();
    } catch (e) {
      console.log("CREATE ORG ERROR:", e);
      Alert.alert("Failed to create organisation");
    }
  };

  const handleInvite = async () => {
    if (!selectedOrg?.id) return;

    if (!inviteEmail) {
      Alert.alert("Enter UID/email");
      return;
    }

    try {
      await addMember(selectedOrg.id, inviteEmail.trim());

      await loadOrgs();

      const refreshed = await getUserOrganisation(user!.uid);
      const safe = Array.isArray(refreshed) ? refreshed : [];

      const updated = safe.find((o) => o.id === selectedOrg.id);

      if (updated) {
        setSelectedOrg(updated);
        buildMembers(updated);
      }

      setInviteEmail("");
      setShowInviteModal(false);
    } catch (e) {
      console.log("INVITE ERROR:", e);
      Alert.alert("Failed to add member");
    }
  };

  const deleteOrganisation = async (orgId: string) => {
    try {
      await deleteDoc(doc(firestoreDb, "organisations", orgId));

      const updated = organisations.filter((o) => o.id !== orgId);
      setOrganisations(updated);

      if (selectedOrg?.id === orgId) {
        const next = updated[0] || null;
        setSelectedOrg(next);
        if (next) buildMembers(next);
        else setMembers([]);
      }
    } catch (e) {
      console.log("DELETE ORG ERROR:", e);
      Alert.alert("Failed to delete organisation");
    }
  };

  const switchOrg = (org: any) => {
    setSelectedOrg(org);
    buildMembers(org);
  };

  if (!user?.uid) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-white">Please login again</Text>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-white">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <AppHeader
        onOpenSidebar={onOpenSidebar}
        onNavigate={onNavigate}
      />

      <ScrollView className="px-4 pt-6">

        {/* HEADER */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-white text-2xl font-bold">
            Organisations
          </Text>

          <TouchableOpacity onPress={() => setShowCreateModal(true)}>
            <Text className="text-primary">+ Create</Text>
          </TouchableOpacity>
        </View>

        {/* ORGANISATIONS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {organisations.map((org) => (
            <View key={org.id} className="relative mr-3">

              {/* CARD */}
              <TouchableOpacity
                onPress={() => switchOrg(org)}
                className={`p-4 rounded-2xl w-64 ${
                  selectedOrg?.id === org.id
                    ? "bg-primary"
                    : "bg-slate-900"
                }`}
              >
                <Text className="text-white font-bold">
                  {org.name}
                </Text>

                <Text className="text-zinc-400">
                  {(org.memberUids || []).length} members
                </Text>
              </TouchableOpacity>

              {/* 3 DOT MENU (BIG TOUCH TARGET) */}
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "Organisation Actions",
                    "Choose an option",
                    [
                      {
                        text: "Delete Organisation",
                        style: "destructive",
                        onPress: () =>
                          Alert.alert(
                            "Confirm Delete",
                            "This cannot be undone.",
                            [
                              { text: "Cancel", style: "cancel" },
                              {
                                text: "Delete",
                                style: "destructive",
                                onPress: () =>
                                  deleteOrganisation(org.id),
                              },
                            ]
                          ),
                      },
                      { text: "Cancel", style: "cancel" },
                    ]
                  )
                }
                className="absolute top-2 right-2 bg-slate-800 rounded-full items-center justify-center"
                style={{
                  width: 44,
                  height: 44,
                }}
              >
                <Ionicons
                  name="ellipsis-vertical"
                  size={22}
                  color="#fff"
                />
              </TouchableOpacity>

            </View>
          ))}
        </ScrollView>

        {/* MEMBERS */}
        <View className="mt-6 flex-row justify-between">
          <Text className="text-zinc-400">Members</Text>

          <TouchableOpacity onPress={() => setShowInviteModal(true)}>
            <Text className="text-primary">+ Invite</Text>
          </TouchableOpacity>
        </View>

        {members.map((m) => (
          <View
            key={m.uid}
            className="bg-slate-900 p-4 rounded-2xl mt-3"
          >
            <Text className="text-white font-semibold">
              {m.name}
            </Text>

            <Text className="text-zinc-400 text-sm">
              {m.email}
            </Text>

            <Text className="text-primary text-xs mt-1">
              {m.role}
            </Text>
          </View>
        ))}

      </ScrollView>

      <BottomNavBar active="settings" onNavigate={onNavigate} />

      {/* CREATE MODAL */}
      <Modal visible={showCreateModal} transparent>
        <View className="flex-1 bg-black/70 justify-center px-6">
          <View className="bg-slate-900 p-5 rounded-2xl">

            <Text className="text-white mb-3">
              Create Organisation
            </Text>

            <TextInput
              placeholder="Name"
              placeholderTextColor="#777"
              value={orgName}
              onChangeText={setOrgName}
              className="bg-slate-800 text-white p-3 rounded-xl mb-3"
            />

            <TextInput
              placeholder="ABN"
              placeholderTextColor="#777"
              value={orgAbn}
              onChangeText={setOrgAbn}
              className="bg-slate-800 text-white p-3 rounded-xl mb-3"
            />

            <TextInput
              placeholder="Address"
              placeholderTextColor="#777"
              value={orgAddress}
              onChangeText={setOrgAddress}
              className="bg-slate-800 text-white p-3 rounded-xl"
            />

            <TouchableOpacity
              onPress={handleCreateOrganisation}
              className="bg-primary mt-4 p-3 rounded-xl"
            >
              <Text className="text-white text-center">
                Create
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

      {/* INVITE MODAL */}
      <Modal visible={showInviteModal} transparent>
        <View className="flex-1 bg-black/70 justify-center px-6">
          <View className="bg-slate-900 p-5 rounded-2xl">

            <Text className="text-white mb-3">
              Add Member
            </Text>

            <TextInput
              placeholder="UID or email"
              placeholderTextColor="#777"
              value={inviteEmail}
              onChangeText={setInviteEmail}
              className="bg-slate-800 text-white p-3 rounded-xl"
            />

            <TouchableOpacity
              onPress={handleInvite}
              className="bg-primary mt-4 p-3 rounded-xl"
            >
              <Text className="text-white text-center">
                Add
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}