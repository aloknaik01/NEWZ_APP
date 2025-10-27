import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "react-native-web";
import axiosClient from "./api/axiosClient";
import useAuthStore from "./store/authStore";
import useNewsStore from "./store/newsStore";
import { styles } from "./styles/newsDeatalsStyles";

export default function NewsDetails() {
  const [latestNews, setLatestNews] = useState([]);
  const [loadingLatest, setLoadingLatest] = useState(false);
  const [readingStartTime] = useState(Date.now());
  const [hasTracked, setHasTracked] = useState(false);

  const API_KEY = "pub_a81e8ada4daa4f15933fe3e2ece357e3";

  const router = useRouter();
  const { selectedNews } = useNewsStore();
  const { user, updateUser } = useAuthStore();

  const fetchLatestNews = async () => {
    setLoadingLatest(true);
    try {
      const url = `https://newsdata.io/api/1/latest?apikey=${API_KEY}&language=en&country=in&timezone=Asia/Kolkata&image=1&removeduplicate=1&category=business,education,environment,food,health`;
      const res = await fetch(url);
      const data = await res.json();
      setLatestNews(data.results);
    } catch (err) {
      console.log("Error fetching latest news:", err);
    } finally {
      setLoadingLatest(false);
    }
  };

  // Track reading after 30 seconds
  useEffect(() => {
    if (!selectedNews || !user || hasTracked) return;

    const timer = setTimeout(async () => {
      await trackReading();
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, [selectedNews, user, hasTracked]);

  const trackReading = async () => {
    try {
      const timeSpent = Math.floor((Date.now() - readingStartTime) / 1000);

      if (timeSpent < 30) return;

      const response = await axiosClient.post(
        `/news/${selectedNews.article_id}/read`,
        { timeSpent }
      );

      if (response.data.success) {
        const earned = response.data.data.coinsEarned;
        setHasTracked(true);

        if (earned > 0) {
          // Update user coins in store
          updateUser({
            wallet: {
              ...user.wallet,
              availableCoins: (user.wallet?.availableCoins || 0) + earned,
              totalEarned: (user.wallet?.totalEarned || 0) + earned,
            },
          });

          Alert.alert(
            "🎉 Coins Earned!",
            `You earned ${earned} coins for reading this article!\n\nArticles read today: ${response.data.data.articlesReadToday}/${response.data.data.dailyLimit}`,
            [{ text: "Awesome!", style: "default" }]
          );

          // Check for streak bonus
          if (response.data.data.streakBonus > 0) {
            Alert.alert(
              "🔥 Streak Bonus!",
              `You earned ${response.data.data.streakBonus} bonus coins for your 7-day reading streak!`,
              [{ text: "Amazing!", style: "default" }]
            );
          }
        }
      }
    } catch (error) {
      console.error("Track reading error:", error);
      if (error.response?.status === 400) {
        // Already read or daily limit reached
        console.log(error.response?.data?.message);
      }
    }
  };

  useEffect(() => {
    fetchLatestNews();
  }, []);

  if (!selectedNews) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noDataText}>No news data found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.goBackBtn}>
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.statusBar}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#FF4B2B" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>News Details</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Article Image */}
          {selectedNews.image_url && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedNews.image_url }} style={styles.image} />
            </View>
          )}

          {/* Title */}
          <Text style={styles.title}>{selectedNews.title}</Text>

          {/* Creator & Date */}
          <Text style={styles.meta}>
            By {(selectedNews.creator || []).join(", ")} |{" "}
            {selectedNews.pubDate
              ? new Date(selectedNews.pubDate).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Date not available"}
          </Text>

          {/* Coins Info Banner */}
          {user && !hasTracked && (
            <View style={styles.card}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Ionicons name="time-outline" size={24} color="#FF4B2B" />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#FF4B2B" }}>
                    📖 Read for 30+ seconds to earn 10 coins!
                  </Text>
                  <Text style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                    Stay on this page and read the full article
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Description Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {selectedNews.description || "No description available."}
            </Text>
          </View>

          {/* Content Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Content</Text>
            <Text style={styles.description}>
              {selectedNews.content || "Full content is available only in paid plans."}
            </Text>
          </View>

          {/* Source Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Source</Text>
            <View style={styles.sourceRow}>
              {selectedNews.source_icon && (
                <Image source={{ uri: selectedNews.source_icon }} style={styles.sourceIcon} />
              )}
              <TouchableOpacity onPress={() => Linking.openURL(selectedNews.source_url)}>
                <Text style={styles.sourceText}>{selectedNews.source_name}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Keywords */}
          {(selectedNews.keywords || []).length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Keywords</Text>
              <View style={styles.tagsContainer}>
                {(selectedNews.keywords || []).map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Categories */}
          {(selectedNews.category || []).length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <View style={styles.tagsContainer}>
                {(selectedNews.category || []).map((cat, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{cat}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Latest News */}
          {latestNews.length > 0 && (
            <View style={{ marginTop: 20, paddingHorizontal: 16 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#ee0101ff",
                  marginBottom: 10,
                }}
              >
                📰 Latest News
              </Text>

              {latestNews.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    marginBottom: 20,
                    borderRadius: 16,
                    backgroundColor: "#1c1c1c",
                    overflow: "hidden",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 5 },
                    shadowOpacity: 0.4,
                    shadowRadius: 6,
                    elevation: 5,
                  }}
                  activeOpacity={0.9}
                  onPress={() => {
                    useNewsStore.getState().setSelectedNews(item);
                    router.push("/newsDetails");
                  }}
                >
                  <View style={{ position: "relative" }}>
                    {item.image_url ? (
                      <Image
                        source={{ uri: item.image_url }}
                        style={{ width: "100%", height: 200 }}
                      />
                    ) : (
                      <View
                        style={{
                          width: "100%",
                          height: 200,
                          backgroundColor: "#333",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Ionicons name="image-outline" size={40} color="#888" />
                      </View>
                    )}

                    <View
                      style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0,0,0,0.35)",
                      }}
                    />

                    {item.category && item.category[0] && (
                      <View
                        style={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          backgroundColor: "#FF4B2B",
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 12,
                        }}
                      >
                        <Text
                          style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}
                        >
                          {item.category[0]}
                        </Text>
                      </View>
                    )}

                    <View
                      style={{
                        position: "absolute",
                        bottom: 12,
                        left: 12,
                        right: 12,
                        backgroundColor: "rgba(0,0,0,0.45)",
                        padding: 8,
                        borderRadius: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 18,
                          fontWeight: "700",
                          lineHeight: 22,
                        }}
                        numberOfLines={2}
                      >
                        {item.title}
                      </Text>
                    </View>
                  </View>

                  <View style={{ padding: 12 }}>
                    {item.description && (
                      <Text
                        style={{
                          color: "#ccc",
                          fontSize: 14,
                          lineHeight: 20,
                          marginBottom: 8,
                        }}
                        numberOfLines={3}
                      >
                        {item.description}
                      </Text>
                    )}

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "#aaa", fontSize: 12 }}>
                        {item.source_name || "Unknown"} •{" "}
                        {item.pubDate
                          ? new Date(item.pubDate).toLocaleDateString()
                          : ""}
                      </Text>
                      <Ionicons
                        name="chevron-forward-outline"
                        size={20}
                        color="#FF4B2B"
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}