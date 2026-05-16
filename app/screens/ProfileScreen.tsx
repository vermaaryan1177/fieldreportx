// ProfileScreen.tsx

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

const ProfileScreen = () => {
  return (
    <View className="flex-1 bg-white">
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-your color">
        <Text className="text-2xl font-bold text-black">
          Profile
        </Text>

        <TouchableOpacity>
          <Text className="text-sm font-medium text-specialText">
            Edit
          </Text>
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View className="items-center py-6 bg-white/10">
        
        {/* Avatar */}
        <View className="w-24 h-24 rounded-full border-2 border-primary items-center justify-center">
          <Text className="text-3xl font-bold ">
            AK
          </Text>
        </View>

        {/* Name */}
        <Text className="mt-4 text-lg font-medium text-black">
          ALLEN K
        </Text>
      </View>

      {/* Account Details */}
      <View className="px-5 py-4">
        <Text className="text-sm font-bold uppercase tracking-widest text-black mb-4">
          Account Details
        </Text>

        {/* Email */}
        <View className="flex-row justify-between items-center py-4 border-b border-black">
          <Text className="text-black">
            Email
          </Text>

          <Text className="text-black">
            ABC@gmail.com
          </Text>
        </View>

        {/* Phone */}
        <View className="flex-row justify-between items-center py-4 border-b border-black">
          <Text className="text-black">
            Phone
          </Text>

          <Text className="text-black">
            0111 111 111
          </Text>
        </View>

        {/* Password */}
        <View className="flex-row justify-between items-center py-4 border-b border-black">
          <Text className="text-black">
            Password
          </Text>

          <TouchableOpacity>
            <Text className="text-specialText">
              Change password
            </Text>
          </TouchableOpacity>
        </View>

        {/* Organisation */}
        <View className="flex-row justify-between items-center py-4 border-b border-your color">
          <Text className="">
            Organisation
          </Text>

          <Text className="">
            Field Inspectors Co
          </Text>
        </View>
      </View>

      {/* Activity */}
      <View className="px-5 pb-6">
        <Text className="text-sm font-bold uppercase tracking-widest  mb-4">
          Activity
        </Text>

        <View className="flex-row justify-between">
          
          {/* Card 1 */}
          <View className="bg-your color/10 rounded-lg p-4 w-[31%] items-center border rounded-lg border-black">
            <Text className="text-3xl font-bold">
              47
            </Text>

            <Text className="text-xs mt-1  text-center">
              Reports total
            </Text>
          </View>

          {/* Card 2 */}
          <View className="bg-your color/10 rounded-lg p-4 w-[31%] items-center border rounded-lg border-black">
            <Text className="text-3xl font-bold ">
              12
            </Text>

            <Text className="text-xs mt-1  text-center">
              This month
            </Text>
          </View>

          {/* Card 3 */}
          <View className="bg-your color/10 rounded-lg p-4 w-[31%] items-center border rounded-lg border-black">
            <Text className="text-3xl font-bold ">
              7
            </Text>

            <Text className="text-xs mt-1  text-center">
              Templates made
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ProfileScreen;