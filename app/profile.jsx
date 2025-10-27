import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Alert, Image, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BottomNav from "./component/BottomNav";

export default function Profile() {
  const handleShare = async () => {
    try {
      await Share.share({
        message: "🎁 Join this app and earn rewards! Download now: https://yourapp.link",
      });
    } catch (error) {
      Alert.alert("Error", "Unable to share link");
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => console.log("Logged out") },
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      "Request Account Deletion",
      "Are you sure you want to request account deletion? This process cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Request", style: "destructive", onPress: () => console.log("Deletion requested") },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header Section */}
        <LinearGradient colors={["#FF416C", "#000000ff"]} style={styles.header}>
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=12" }}
            style={styles.avatar}
          />
          <Text style={styles.name}>Zakir Khan</Text>
          <Text style={styles.email}>zakir@example.com</Text>
        </LinearGradient>

        {/* Refer & Earn */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎁 Refer & Earn</Text>
          <Text style={styles.cardText}>
            Invite your friends and earn exciting rewards!
          </Text>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <LinearGradient
              colors={["#FF4B2B", "#FF4B2B"]}
              style={styles.gradientBtn}
            >
              <Ionicons name="share-social-outline" size={20} color="#fff" />
              <Text style={styles.shareText}>Share Invite Link</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Links Section */}
        <View style={styles.linksContainer}>
          <LinkItem icon="time-outline" label="Referral History" />
          <LinkItem icon="information-circle-outline" label="About App" />
          <LinkItem icon="document-text-outline" label="Terms & Conditions" />
          <LinkItem icon="shield-checkmark-outline" label="Privacy Policy" />
        </View>

        {/* Account Management */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="#ff3b30" />
            <Text style={styles.deleteText}>Request Account Deletion</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const LinkItem = ({ icon, label }) => (
  <TouchableOpacity style={styles.linkItem}>
    <Ionicons name={icon} size={20} color="#333" />
    <Text style={styles.linkText}>{label}</Text>
    <Ionicons name="chevron-forward-outline" size={20} color="#999" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  header: {
    paddingVertical: 40,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#fff",
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginTop: 10,
  },
  email: {
    fontSize: 14,
    color: "#eaeaea",
  },
  card: {
    margin: 16,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  shareButton: {
    alignItems: "center",
  },
  gradientBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  shareText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  linksContainer: {
    marginTop: 10,
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  linkText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: "#333",
  },
  actionContainer: {
    marginTop: 20,
    marginHorizontal: 16,
    gap: 12,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    borderColor: "#ff3b30",
    borderRadius: 12,
    justifyContent: "center",
  },
  deleteText: {
    color: "#ff3b30",
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 6,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2575fc",
    borderRadius: 12,
    padding: 14,
  },
  logoutText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 6,
  },
});
