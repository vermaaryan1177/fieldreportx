import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function OrganisationScreen() {
  return (
    <ScrollView className="flex-1 bg-your-color px-4 pt-6">
      {/* top */}
      <View className="mb-6 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-your-color">
          Organisation
        </Text>

        <TouchableOpacity>
          <Text className="text-your-color text-base">+ Invite</Text>
        </TouchableOpacity>
      </View>

      {/* company card */}
      <View className="bg-your-color rounded-2xl p-4 mb-6">
        <View className="flex-row items-center">
          <View className="h-14 w-14 rounded-full bg-your-color items-center justify-center mr-4">
            <Text className="text-your-color font-bold">FI</Text>
          </View>

          <View>
            <Text className="text-your-color text-lg font-semibold">
              Field Inspectors Co
            </Text>

            <Text className="text-your-color text-sm mt-1">
              6 members
            </Text>
          </View>
        </View>
      </View>

      {/* members title */}
      <Text className="text-your-color uppercase text-xs font-bold mb-3">
        Members
      </Text>

      {/* member 1 */}
      <View className="bg-your-color border border-your-color rounded-2xl p-4 mb-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="h-12 w-12 rounded-full bg-your-color items-center justify-center mr-3">
              <Text className="text-your-color font-bold">JA</Text>
            </View>

            <View>
              <Text className="text-your-color font-semibold">
                John Appleseed
              </Text>

              <Text className="text-your-color text-sm">
                johnappleseed@gmail.com
              </Text>
            </View>
          </View>

          <View className="bg-your-color px-3 py-1 rounded-full">
            <Text className="text-your-color text-xs">Admin</Text>
          </View>
        </View>
      </View>

      {/* member 2 */}
      <View className="bg-your-color border border-your-color rounded-2xl p-4 mb-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="h-12 w-12 rounded-full bg-your-color items-center justify-center mr-3">
              <Text className="text-your-color font-bold">JD</Text>
            </View>

            <View>
              <Text className="text-your-color font-semibold">
                Jon Doe
              </Text>

              <Text className="text-your-color text-sm">
                jondoe@gmail.com
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="bg-your-color px-3 py-1 rounded-full">
              <Text className="text-your-color text-xs">Member</Text>
            </View>

            <TouchableOpacity className="ml-2">
              <Text className="text-your-color text-lg">⋮</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* member 3 */}
      <View className="bg-your-color border border-your-color rounded-2xl p-4 mb-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="h-12 w-12 rounded-full bg-your-color items-center justify-center mr-3">
              <Text className="text-your-color font-bold">JD</Text>
            </View>

            <View>
              <Text className="text-your-color font-semibold">
                Jane Doe
              </Text>

              <Text className="text-your-color text-sm">
                janedoe@gmail.com
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="bg-your-color px-3 py-1 rounded-full">
              <Text className="text-your-color text-xs">Member</Text>
            </View>

            <TouchableOpacity className="ml-2">
              <Text className="text-your-color text-lg">⋮</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* pending invite */}
      <View className="border border-dashed border-your-color rounded-2xl p-4 mb-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="h-12 w-12 rounded-full border border-your-color items-center justify-center mr-3">
              <Text className="text-your-color text-lg">?</Text>
            </View>

            <View>
              <Text className="text-your-color font-semibold">
                Joe Shmoe
              </Text>

              <Text className="text-your-color text-sm">
                Invite pending
              </Text>
            </View>
          </View>

          <TouchableOpacity>
            <Text className="text-red-500 font-medium">Revoke</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* reports */}
      <Text className="text-your-color uppercase text-xs font-bold mb-3">
        Team Reports
      </Text>

      <TouchableOpacity className="bg-your-color border border-your-color rounded-2xl p-4 mb-3 flex-row items-center justify-between">
        <Text className="text-your-color">
          View all organisation reports
        </Text>

        <Text className="text-your-color">{">"}</Text>
      </TouchableOpacity>

      <TouchableOpacity className="bg-your-color border border-your-color rounded-2xl p-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="text-your-color">
            Shared templates
          </Text>

          <Text className="text-your-color text-sm ml-3">
            4 templates
          </Text>
        </View>

        <Text className="text-your-color">{">"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}