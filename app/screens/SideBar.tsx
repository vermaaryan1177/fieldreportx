import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Sidebar() {
  return (
    <View className="flex-1 bg-your-color border-r border-your-color">
      {/* top user */}
      <View className="flex-row items-center border-b border-your-color p-5">
        <View className="h-14 w-14 rounded-full bg-your-color items-center justify-center">
          <Text className="text-your-color font-bold text-lg">AK</Text>
        </View>

        <Text className="ml-3 text-your-color font-semibold text-base">
          Alex King
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* home active */}
        <TouchableOpacity className="mb-3 flex-row items-center rounded-xl bg-your-color px-3 py-4">
          <View className="h-6 w-6 rounded-md bg-your-color mr-3" />

          <Text className="text-your-color font-medium">Home</Text>
        </TouchableOpacity>

        {/* menu items */}
        <TouchableOpacity className="mb-3 flex-row items-center px-3 py-4">
          <View className="h-6 w-6 rounded-md bg-your-color mr-3" />

          <Text className="text-your-color">My reports</Text>
        </TouchableOpacity>

        <TouchableOpacity className="mb-3 flex-row items-center px-3 py-4">
          <View className="h-6 w-6 rounded-md bg-your-color mr-3" />

          <Text className="text-your-color">Templates</Text>
        </TouchableOpacity>

        {/* notifications */}
        <TouchableOpacity className="mb-3 flex-row items-center justify-between px-3 py-4">
          <View className="flex-row items-center">
            <View className="h-6 w-6 rounded-md bg-your-color mr-3" />

            <Text className="text-your-color">Notifications</Text>
          </View>

          <View className="h-6 w-6 rounded-full bg-red-500 items-center justify-center">
            <Text className="text-white text-xs font-bold">3</Text>
          </View>
        </TouchableOpacity>

        {/* line */}
        <View className="h-[1px] bg-your-color my-2" />

        {/* other items */}
        <TouchableOpacity className="mb-3 flex-row items-center px-3 py-4">
          <View className="h-6 w-6 rounded-md bg-your-color mr-3" />

          <Text className="text-your-color">Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity className="mb-3 flex-row items-center px-3 py-4">
          <View className="h-6 w-6 rounded-md bg-your-color mr-3" />

          <Text className="text-your-color">Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity className="mb-4 flex-row items-center px-3 py-4">
          <View className="h-6 w-6 rounded-md bg-your-color mr-3" />

          <Text className="text-your-color">Organisation</Text>
        </TouchableOpacity>

        {/* line */}
        <View className="h-[1px] bg-your-color mb-4" />

        {/* current org */}
        <Text className="text-your-color text-xs font-bold uppercase mb-3">
          Current Org
        </Text>

        <TouchableOpacity className="border border-your-color rounded-xl px-4 py-4 flex-row items-center justify-between">
          <Text className="text-your-color">
            Field Inspectors Co
          </Text>

          <Text className="text-your-color">{">"}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* footer */}
      <View className="border-t border-your-color p-4">
        <Text className="text-your-color font-semibold">
          FieldReportX
        </Text>

        <Text className="text-your-color text-sm mt-1">
          Version 2.1.0 · Build 441
        </Text>

        <TouchableOpacity className="mt-2">
          <Text className="text-red-500 font-medium">Sign out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}