import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
  StatusBar,
} from "react-native";
import axiosClient from "./api/axiosClient";
import useAuthStore from "./store/authStore";

const colors = {
  primary: "#FF4B2B",
  secondary: "#FF416C",
  text: "#333333",
  gray: "#A9A9A9",
  lightGray: "#F5F5F5",
  background: "#FFFFFF",
};

export default function Redeem() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [giftCards, setGiftCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [deliveryEmail, setDeliveryEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userCoins, setUserCoins] = useState(0);

  useEffect(() => {
    if (!user) {
      router.replace("/");
      return;
    }
    fetchGiftCards();
    fetchUserWallet();
  }, []);

  const fetchGiftCards = async () => {
    try {
      const response = await axiosClient.get("/gift-cards");
      if (response.data.success) {
        setGiftCards(response.data.data.giftCards);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load gift cards");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserWallet = async () => {
    try {
      const response = await axiosClient.get("/user/wallet");
      if (response.data.success) {
        setUserCoins(response.data.data.available_coins);
      }
    } catch (error) {
      console.error("Fetch wallet error:", error);
    }
  };

  const handleSelectCard = (card) => {
    if (userCoins < card.coins_required) {
      Alert.alert(
        "Insufficient Coins",
        `You need ${card.coins_required} coins but have ${userCoins} coins`
      );
      return;
    }
    setSelectedCard(card);
    setDeliveryEmail(user?.email || "");
  };

  const handleRedeem = async () => {
    if (!selectedCard) {
      Alert.alert("Error", "Please select a gift card");
      return;
    }

    if (!deliveryEmail || !deliveryEmail.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    Alert.alert(
      "Confirm Redeem",
      `Redeem ${selectedCard.card_name} for ${selectedCard.coins_required} coins?\n\nGift code will be sent to: ${deliveryEmail}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            setSubmitting(true);
            try {
              const response = await axiosClient.post("/redeem", {
                cardId: selectedCard.card_id,
                deliveryEmail: deliveryEmail,
              });

              if (response.data.success) {
                Alert.alert(
                  "Success! 🎉",
                  response.data.message,
                  [
                    {
                      text: "View History",
                      onPress: () => router.push("/redeemHistory"),
                    },
                    {
                      text: "OK",
                      onPress: () => {
                        setSelectedCard(null);
                        setDeliveryEmail("");
                        fetchUserWallet();
                      },
                    },
                  ]
                );
              }
            } catch (error) {
              Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to create redeem request"
              );
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Redeem Coins</Text>
          <View style={styles.coinsDisplay}>
            <Ionicons name="wallet" size={20} color="#FFD700" />
            <Text style={styles.coinsText}>{userCoins}</Text>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color={colors.primary} />
            <Text style={styles.infoText}>
              Select a gift card and we'll send the code to your email within 24-48 hours
            </Text>
          </View>

          {/* Gift Cards */}
          <Text style={styles.sectionTitle}>Available Gift Cards</Text>

          {giftCards.map((card) => {
            const canAfford = userCoins >= card.coins_required;
            const isSelected = selectedCard?.card_id === card.card_id;

            return (
              <TouchableOpacity
                key={card.card_id}
                style={[
                  styles.giftCard,
                  isSelected && styles.giftCardSelected,
                  !canAfford && styles.giftCardDisabled,
                ]}
                onPress={() => handleSelectCard(card)}
                disabled={!canAfford}
              >
                <Image
                  source={{ uri: card.card_image }}
                  style={styles.cardImage}
                  resizeMode="contain"
                />
                <View style={styles.cardDetails}>
                  <Text style={styles.cardName}>{card.card_name}</Text>
                  <View style={styles.cardPriceRow}>
                    <Ionicons name="logo-bitcoin" size={16} color="#FFD700" />
                    <Text style={styles.cardPrice}>{card.coins_required} coins</Text>
                  </View>
                  {!canAfford && (
                    <Text style={styles.insufficientText}>Insufficient coins</Text>
                  )}
                </View>
                {isSelected && (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {/* Email Input (shown when card selected) */}
          {selectedCard && (
            <View style={styles.emailSection}>
              <Text style={styles.emailLabel}>
                📧 Delivery Email (Gift code will be sent here)
              </Text>
              <TextInput
                style={styles.emailInput}
                placeholder="Enter email address"
                placeholderTextColor={colors.gray}
                value={deliveryEmail}
                onChangeText={setDeliveryEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}

          {/* Redeem Button */}
          {selectedCard && (
            <TouchableOpacity
              style={styles.redeemButton}
              onPress={handleRedeem}
              disabled={submitting}
            >
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.gradientButton}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="gift" size={20} color="#fff" />
                    <Text style={styles.redeemButtonText}>
                      Redeem for {selectedCard.coins_required} coins
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* View History Link */}
          <TouchableOpacity
            style={styles.historyLink}
            onPress={() => router.push("/redeemHistory")}
          >
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <Text style={styles.historyLinkText}>View Redeem History</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  coinsDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  coinsText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#FFF3E0",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#E65100",
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  giftCard: {
    flexDirection: "row",
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
    elevation: 2,
  },
  giftCardSelected: {
    borderColor: colors.primary,
    elevation: 4,
  },
  giftCardDisabled: {
    opacity: 0.5,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  cardDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  cardName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  cardPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  insufficientText: {
    fontSize: 12,
    color: "#DC2626",
    marginTop: 4,
  },
  selectedBadge: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  emailSection: {
    marginTop: 20,
    marginBottom: 12,
  },
  emailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  emailInput: {
    backgroundColor: colors.background,
    padding: 14,
    borderRadius: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  redeemButton: {
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
  },
  redeemButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  historyLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 8,
  },
  historyLinkText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
});