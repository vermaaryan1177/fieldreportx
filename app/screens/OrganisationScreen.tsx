import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNavBar, { AppScreen } from "@/components/BottomNavBar";

interface Props {
  onNavigate: (screen: AppScreen) => void;
}

export default function OrganisationScreen({ onNavigate }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-6">
        {/* Top Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-white">Organisation</Text>
          <TouchableOpacity>
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
              <Text className="text-zinc-400 text-sm mt-1">6 members</Text>
            </View>
          </View>
        </View>

        {/* Members Title */}
        <Text className="text-zinc-400 uppercase text-xs font-bold mb-3">
          Members
        </Text>

        {/* Member 1 */}
        <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="h-12 w-12 rounded-full bg-primary items-center justify-center mr-3">
                <Text className="text-white font-bold">JA</Text>
              </View>
              <View>
                <Text className="text-white font-semibold">John Appleseed</Text>
                <Text className="text-zinc-400 text-sm">
                  johnappleseed@gmail.com
                </Text>
              </View>
            </View>
            <View className="bg-primary px-3 py-1 rounded-full">
              <Text className="text-white text-xs">Admin</Text>
            </View>
          </View>
        </View>

        {/* Member 2 */}
        <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="h-12 w-12 rounded-full bg-blue-600 items-center justify-center mr-3">
                <Text className="text-white font-bold">JD</Text>
              </View>
              <View>
                <Text className="text-white font-semibold">Jon Doe</Text>
                <Text className="text-zinc-400 text-sm">jondoe@gmail.com</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <View className="bg-blue-800 px-3 py-1 rounded-full">
                <Text className="text-white text-xs">Member</Text>
              </View>
              <TouchableOpacity className="ml-2">
                <Text className="text-zinc-400 text-lg">⋮</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Member 3 */}
        <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="h-12 w-12 rounded-full bg-pink-600 items-center justify-center mr-3">
                <Text className="text-white font-bold">JD</Text>
              </View>
              <View>
                <Text className="text-white font-semibold">Jane Doe</Text>
                <Text className="text-zinc-400 text-sm">janedoe@gmail.com</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <View className="bg-pink-800 px-3 py-1 rounded-full">
                <Text className="text-white text-xs">Member</Text>
              </View>
              <TouchableOpacity className="ml-2">
                <Text className="text-zinc-400 text-lg">⋮</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Pending Invite */}
        <View className="border border-dashed border-slate-600 rounded-2xl p-4 mb-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="h-12 w-12 rounded-full border border-slate-600 items-center justify-center mr-3">
                <Text className="text-zinc-400 text-lg">?</Text>
              </View>
              <View>
                <Text className="text-white font-semibold">Joe Shmoe</Text>
                <Text className="text-zinc-400 text-sm">Invite pending</Text>
              </View>
            </View>
            <TouchableOpacity>
              <Text className="text-red-500 font-medium">Revoke</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reports Section */}
        <Text className="text-zinc-400 uppercase text-xs font-bold mb-3">
          Team Reports
        </Text>

        <TouchableOpacity className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-3 flex-row items-center justify-between">
          <Text className="text-white">View all organisation reports</Text>
          <Text className="text-zinc-400">{">"}</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text className="text-white">Shared templates</Text>
            <Text className="text-zinc-400 text-sm ml-3">4 templates</Text>
          </View>
          <Text className="text-zinc-400">{">"}</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNavBar active="settings" onNavigate={onNavigate} />
    </SafeAreaView>
  );
}