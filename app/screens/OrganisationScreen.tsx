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
  removeMember,
} from "@/lib/db/organisations";

import { auth, db } from "@/lib/firebase";
import {
  deleteDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getUserProfile } from "@/lib/db/users";

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
      const safe = Array.isArray(orgs) ? orgs : [];

      setOrganisations(safe);

      if (safe.length > 0) {
        setSelectedOrg(safe[0]);
        await buildMembers(safe[0]);
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

          if (profile) {
            username =
              profile.displayName ||
              profile.email ||
              "Unknown User";
          }
        } catch {}

        const authUser = auth.currentUser;

        if (uid === authUser?.uid) {
          username =
            authUser.displayName ||
            authUser.email ||
            "You";
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
        where(
          "email",
          "==",
          inviteEmail.trim().toLowerCase()
        )
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        Alert.alert("User not found in this app");
        return;
      }

      const uid = snap.docs[0].id;

      await addMember(selectedOrg.id, uid);

      setInviteEmail("");
      setShowInviteModal(false);

      await loadOrgs();
    } catch {
      Alert.alert("Failed to add member");
    }
  };

  const switchOrg = async (org: any) => {
    setSelectedOrg(org);
    await buildMembers(org);
  };

  const deleteOrganisation = async (orgId: string) => {
    try {
      await deleteDoc(doc(db, "organisations", orgId));

      const updated = organisations.filter(
        (o) => o.id !== orgId
      );

      setOrganisations(updated);

      if (selectedOrg?.id === orgId) {
        const next = updated[0] || null;

        setSelectedOrg(next);

        if (next) {
          await buildMembers(next);
        } else {
          setMembers([]);
        }
      }
    } catch {
      Alert.alert("Failed to delete organisation");
    }
  };

  // MEMBER MENU
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
      await removeMember(
        selectedOrg.id,
        menuMember.uid
      );

      closeMemberMenu();

      await loadOrgs();
    } catch {
      Alert.alert("Failed to remove member");
    }
  };

  if (!user?.uid) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-white">
          Please login again
        </Text>
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

          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
          >
            <Text className="text-primary">
              + Create
            </Text>
          </TouchableOpacity>
        </View>

        {/* ORGS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {organisations.map((org) => {
            const isAdmin =
              org.adminUid === user.uid;

            return (
              <View
                key={org.id}
                className={`p-4 rounded-2xl w-64 mr-3 ${
                  selectedOrg?.id === org.id
                    ? "bg-primary"
                    : "bg-slate-900"
                }`}
              >
                <View className="flex-row justify-between items-start">
                  {/* ORG INFO */}
                  <TouchableOpacity
                    onPress={() => switchOrg(org)}
                    className="flex-1"
                  >
                    <Text className="text-white font-bold text-base">
                      {org.name}
                    </Text>

                    <Text className="text-zinc-400 mt-1">
                      {(org.memberUids || []).length}{" "}
                      members
                    </Text>
                  </TouchableOpacity>

                  {/* DELETE BUTTON */}
                  {isAdmin && (
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert(
                          "Delete Organisation",
                          `Are you sure you want to delete "${org.name}"?`,
                          [
                            {
                              text: "Cancel",
                              style: "cancel",
                            },
                            {
                              text: "Delete",
                              style: "destructive",
                              onPress: () =>
                                deleteOrganisation(
                                  org.id
                                ),
                            },
                          ]
                        )
                      }
                      className="ml-3"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#ef4444"
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* MEMBERS */}
        <View className="mt-6 flex-row justify-between">
          <Text className="text-zinc-400">
            Members
          </Text>

          <TouchableOpacity
            onPress={() => setShowInviteModal(true)}
          >
            <Text className="text-primary">
              + Invite
            </Text>
          </TouchableOpacity>
        </View>

        {members.map((m) => (
          <View
            key={m.uid}
            className="bg-slate-900 p-4 rounded-2xl mt-3 flex-row justify-between items-center"
          >
            <View>
              <Text className="text-white font-semibold">
                {m.username}
              </Text>

              <Text className="text-primary text-xs mt-1">
                {m.role}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => openMemberMenu(m)}
            >
              <Ionicons
                name="ellipsis-vertical"
                size={18}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <BottomNavBar
        active="settings"
        onNavigate={onNavigate}
        hasOrganisation={hasOrganisation}
      />

      {/* MEMBER MENU */}
      <Modal
        visible={memberMenuVisible}
        transparent
        animationType="fade"
      >
        <View className="flex-1 bg-black/70 justify-center px-6">
          <View className="bg-slate-900 p-5 rounded-2xl">
            <Text className="text-white font-bold mb-4">
              Member Actions
            </Text>

            <Text className="text-zinc-400 mb-4">
              {menuMember?.username}
            </Text>

            <TouchableOpacity
              onPress={handleRemoveMember}
              className="bg-red-600 p-3 rounded-xl mb-2"
            >
              <Text className="text-white text-center">
                Remove Member
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={closeMemberMenu}
              className="p-3"
            >
              <Text className="text-zinc-400 text-center">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* CREATE MODAL */}
      <Modal
        visible={showCreateModal}
        transparent
      >
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

            <View className="flex-row justify-between mt-4">
              <TouchableOpacity
                onPress={() =>
                  setShowCreateModal(false)
                }
                className="bg-slate-700 p-3 rounded-xl flex-1 mr-2"
              >
                <Text className="text-white text-center">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCreateOrganisation}
                className="bg-primary p-3 rounded-xl flex-1 ml-2"
              >
                <Text className="text-white text-center">
                  Create
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* INVITE MODAL */}
      <Modal
        visible={showInviteModal}
        transparent
      >
        <View className="flex-1 bg-black/70 justify-center px-6">
          <View className="bg-slate-900 p-5 rounded-2xl">
            <Text className="text-white mb-3">
              Add Member
            </Text>

            <TextInput
              placeholder="Registered user email"
              placeholderTextColor="#777"
              value={inviteEmail}
              onChangeText={setInviteEmail}
              className="bg-slate-800 text-white p-3 rounded-xl"
            />

            <View className="flex-row justify-between mt-4">
              <TouchableOpacity
                onPress={() =>
                  setShowInviteModal(false)
                }
                className="bg-slate-700 p-3 rounded-xl flex-1 mr-2"
              >
                <Text className="text-white text-center">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleInvite}
                className="bg-primary p-3 rounded-xl flex-1 ml-2"
              >
                <Text className="text-white text-center">
                  Add
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}