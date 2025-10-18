import { View, Text } from "react-native";
import BottomNav from "./component/BottomNav";

export default function News() {
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 20, color: "#333" }}>📰 News Screen</Text>
      </View>
      <BottomNav />
    </View>
  );
}
