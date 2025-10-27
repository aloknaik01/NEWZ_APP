import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import axiosClient from "./api/axiosClient";
import BottomNav from "./component/BottomNav";
import useAuthStore from "./store/authStore";

export default function Profile() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuthStore();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.replace("/");
      return;
    }

    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await axiosClient.get("/user/profile");

      if (response.data.success) {
        setProfileData(response.data.data);
        // Update user in store
        updateUser({
          ...response.data.data.user,
          ...response.data.data.profile,
          wallet: response.data.data.wallet,
        });
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const referralCode = profileData?.referral?.myReferralCode || "INVITE";
      await Share.share({
        message: `🎁 Join this app and earn rewards! Use my referral code: ${referralCode}\n\nDownload now: https://yourapp.link`,
      });
    } catch (error) {
      Alert.alert("Error", "Unable to share link");
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/");
        },
      },
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4B2B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header Section */}
        <LinearGradient colors={["#FF416C", "#000000ff"]} style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profileData?.profile?.fullName?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
          <Text style={styles.name}>
            {profileData?.profile?.fullName || "User"}
          </Text>
          <Text style={styles.email}>{profileData?.user?.email || "user@example.com"}</Text>
          <View style={styles.coinsDisplay}>
            <Ionicons name="wallet" size={20} color="#FFD700" />
            <Text style={styles.coinsText}>
              {profileData?.wallet?.availableCoins || 0} Coins
            </Text>
          </View>
        </LinearGradient>

        {/* Stats Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Your Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {profileData?.profile?.totalArticlesRead || 0}
              </Text>
              <Text style={styles.statLabel}>Articles Read</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {profileData?.referral?.totalReferrals || 0}
              </Text>
              <Text style={styles.statLabel}>Referrals</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {profileData?.wallet?.totalEarned || 0}
              </Text>
              <Text style={styles.statLabel}>Total Earned</Text>
            </View>
          </View>
        </View>

        {/* Refer & Earn */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎁 Refer & Earn</Text>
          <Text style={styles.cardText}>
            Invite your friends and earn exciting rewards!
          </Text>
          <View style={styles.referralCodeBox}>
            <Text style={styles.referralLabel}>Your Referral Code:</Text>
            <Text style={styles.referralCode}>
              {profileData?.referral?.myReferralCode || "LOADING"}
            </Text>
          </View>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <LinearGradient colors={["#FF4B2B", "#FF4B2B"]} style={styles.gradientBtn}>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FF4B2B",
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
  coinsDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  coinsText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
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
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FF4B2B",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#ddd",
  },
  cardText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  referralCodeBox: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  referralLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  referralCode: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FF4B2B",
    letterSpacing: 2,
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