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

import { auth, db } from "@/lib/firebase";
import {
  createOrganisation,
  getUserOrganisation,
  inviteMember,
  removeMember,
} from "@/lib/db/organisations";
import { getUserProfile } from "@/lib/db/users";
import { collection, getDocs, query, where } from "firebase/firestore";

interface Props {
  onNavigate: (screen: AppScreen) => void;
  onOpenSidebar: () => void;
  hasOrganisation: boolean;
}

interface Member {
  uid: string;
  username: string;
  role: "Admin" | "Member";
}

export default function OrganisationScreen({
  onNavigate,
  onOpenSidebar,
  hasOrganisation,
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

  // MEMBER MENU
  const [memberMenuVisible, setMemberMenuVisible] = useState(false);
  const [menuMember, setMenuMember] = useState<Member | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    loadOrgs();
  }, []);

  const loadOrgs = async () => {
    try {
      setLoading(true);
      const orgs = await getUserOrganisation(user!.uid);
      setOrganisations(orgs);

      if (orgs.length > 0) {
        setSelectedOrg(orgs[0]);
        await buildMembers(orgs[0]);
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

  const buildMembers = async (org: any) => {
    if (!org?.memberUids?.length) {
      setMembers([]);
      return;
    }

    const list: Member[] = await Promise.all(
      org.memberUids.map(async (uid: string) => {
        let username = "Unknown User";
        try {
          const profile = await getUserProfile(uid);
          if (profile) username = profile.displayName || profile.email || "Unknown User";
        } catch {}

        if (uid === user?.uid) {
          username = user.displayName || user.email || "You";
        }

        return {
          uid,
          username,
          role: uid === org.adminUid ? "Admin" : "Member",
        };
      })
    );

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
    } catch {
      Alert.alert("Failed to create organisation");
    }
  };

  const handleInvite = async () => {
    if (!selectedOrg?.id) return;
    if (!inviteEmail) {
      Alert.alert("Enter user email");
      return;
    }

    try {
      const q = query(
        collection(db, "users"),
        where("email", "==", inviteEmail.trim().toLowerCase())
      );
      const snap = await getDocs(q);
      if (snap.empty) {
        Alert.alert("User not found in this app");
        return;
      }

      const uid = snap.docs[0].id;
      await inviteMember(selectedOrg.id, selectedOrg.name, uid, user.uid);

      setInviteEmail("");
      setShowInviteModal(false);
      await loadOrgs();
      Alert.alert("Invitation sent!");
    } catch (err) {
      console.log(err);
      Alert.alert("Failed to send invitation");
    }
  };

  const switchOrg = async (org: any) => {
    setSelectedOrg(org);
    await buildMembers(org);
  };

  const deleteOrganisation = async (orgId: string) => {
    try {
      const updated = organisations.filter((o) => o.id !== orgId);
      setOrganisations(updated);

      if (selectedOrg?.id === orgId) {
        const next = updated[0] || null;
        setSelectedOrg(next);
        if (next) await buildMembers(next);
        else setMembers([]);
      }
    } catch {
      Alert.alert("Failed to delete organisation");
    }
  };

  const openMemberMenu = (member: Member) => {
    setMenuMember(member);
    setMemberMenuVisible(true);
  };

  const closeMemberMenu = () => {
    setMenuMember(null);
    setMemberMenuVisible(false);
  };

  const handleRemoveMember = async () => {
    if (!selectedOrg?.id || !menuMember) return;

    try {
      await removeMember(selectedOrg.id, menuMember.uid);
      closeMemberMenu();
      await loadOrgs();
    } catch {
      Alert.alert("Failed to remove member");
    }
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
      <AppHeader onOpenSidebar={onOpenSidebar} onNavigate={onNavigate} />

      <ScrollView className="px-4 pt-6">
        {/* Organisations Header */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-white text-2xl font-bold">Organisations</Text>
          <TouchableOpacity onPress={() => setShowCreateModal(true)}>
            <Text className="text-primary">+ Create</Text>
          </TouchableOpacity>
        </View>

        {/* Organisation List */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {organisations.map((org) => {
            const isAdmin = org.adminUid === user.uid;
            const bgColor = selectedOrg?.id === org.id ? "bg-primary" : "bg-slate-900";
            return (
              <View
                key={org.id ?? Math.random().toString()}
                className={`p-4 rounded-2xl w-64 mr-3 ${bgColor}`}
              >
                <View className="flex-row justify-between items-start">
                  <TouchableOpacity onPress={() => switchOrg(org)} className="flex-1">
                    <Text className="text-white font-bold text-base">{org.name ?? "Unknown"}</Text>
                    <Text className="text-zinc-400 mt-1">{(org.memberUids?.length ?? 0) + " members"}</Text>
                  </TouchableOpacity>

                  {isAdmin && (
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert(
                          "Delete Organisation",
                          `Are you sure you want to delete "${org.name}"?`,
                          [
                            { text: "Cancel", style: "cancel" },
                            { text: "Delete", style: "destructive", onPress: () => deleteOrganisation(org.id) },
                          ]
                        )
                      }
                      className="ml-3"
                    >
                      <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Members */}
        <View className="mt-6 flex-row justify-between">
          <Text className="text-zinc-400">Members</Text>
          <TouchableOpacity onPress={() => setShowInviteModal(true)}>
            <Text className="text-primary">+ Invite</Text>
          </TouchableOpacity>
        </View>

        {members.map((m) => (
          <View key={m.uid ?? Math.random().toString()} className="bg-slate-900 p-4 rounded-2xl mt-3 flex-row justify-between items-center">
            <View>
              <Text className="text-white font-semibold">{m.username}</Text>
              <Text className="text-zinc-400">{m.role}</Text>
            </View>

            {selectedOrg?.adminUid === user.uid && m.uid !== user.uid && (
              <TouchableOpacity onPress={() => openMemberMenu(m)}>
                <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        ))}

      </ScrollView>

      {/* Create Organisation Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View className="flex-1 bg-black bg-opacity-70 justify-center items-center">
          <View className="bg-zinc-900 p-6 rounded-2xl w-80">
            <Text className="text-white text-lg font-bold mb-4">Create Organisation</Text>
            <TextInput
              placeholder="Name"
              placeholderTextColor="#888"
              className="bg-zinc-800 text-white p-3 rounded mb-3"
              value={orgName}
              onChangeText={setOrgName}
            />
            <TextInput
              placeholder="ABN"
              placeholderTextColor="#888"
              className="bg-zinc-800 text-white p-3 rounded mb-3"
              value={orgAbn}
              onChangeText={setOrgAbn}
            />
            <TextInput
              placeholder="Address"
              placeholderTextColor="#888"
              className="bg-zinc-800 text-white p-3 rounded mb-3"
              value={orgAddress}
              onChangeText={setOrgAddress}
            />

            <View className="flex-row justify-end mt-4">
              <TouchableOpacity onPress={() => setShowCreateModal(false)} className="mr-3">
                <Text className="text-zinc-400">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateOrganisation}>
                <Text className="text-primary font-bold">Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Invite Modal */}
      <Modal visible={showInviteModal} transparent animationType="slide">
        <View className="flex-1 bg-black bg-opacity-70 justify-center items-center">
          <View className="bg-zinc-900 p-6 rounded-2xl w-80">
            <Text className="text-white text-lg font-bold mb-4">Invite Member</Text>
            <TextInput
              placeholder="User Email"
              placeholderTextColor="#888"
              className="bg-zinc-800 text-white p-3 rounded mb-3"
              value={inviteEmail}
              onChangeText={setInviteEmail}
            />

            <View className="flex-row justify-end mt-4">
              <TouchableOpacity onPress={() => setShowInviteModal(false)} className="mr-3">
                <Text className="text-zinc-400">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleInvite}>
                <Text className="text-primary font-bold">Invite</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Member Action Menu */}
      <Modal visible={memberMenuVisible} transparent animationType="fade">
        <TouchableOpacity
          className="flex-1 bg-black bg-opacity-50 justify-center items-center"
          onPress={closeMemberMenu}
        >
          <View className="bg-zinc-900 p-4 rounded-2xl w-64">
            <Text className="text-white font-bold mb-4">Member Options</Text>
            <TouchableOpacity onPress={handleRemoveMember} className="py-2">
              <Text className="text-red-500 font-semibold">Remove Member</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closeMemberMenu} className="py-2">
              <Text className="text-white font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <BottomNavBar active="organisation" onNavigate={onNavigate} hasOrganisation={hasOrganisation} />
    </SafeAreaView>
  );
}