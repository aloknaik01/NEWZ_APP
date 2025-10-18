import { View, Text, TouchableOpacity } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { bottomNavData } from "../utils/bottomNavData.js";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderTopWidth: 1,
        borderTopColor: "#E0E0E0",
        paddingVertical: 10,
      }}
    >
      {bottomNavData.map((item, index) => {
        const isActive = pathname === item.route;

        // Select the right icon component
        const IconComponent = item.iconType === "ionicon" ? Ionicons : MaterialIcons;

        return (
          <TouchableOpacity
            key={index}
            onPress={() => router.push(item.route)}
            style={{ alignItems: "center" }}
          >
            <IconComponent
              name={item.icon}
              size={26}
              color={isActive ? "#FF4B2B" : "#A9A9A9"}
            />
            <Text
              style={{
                fontSize: 12,
                color: isActive ? "#FF4B2B" : "#A9A9A9",
                marginTop: 4,
              }}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
