// app/newsDetails.jsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import {
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import axiosClient from "./api/axiosClient";
import useAuthStore from "./store/authStore";
import useNewsStore from "./store/newsStore";
import { styles } from "./styles/newsDeatalsStyles";

export default function NewsDetails() {
  const [latestNews, setLatestNews] = useState([]);
  const [loadingLatest, setLoadingLatest] = useState(false);
  const [hasTracked, setHasTracked] = useState(false);
  const readingStartTime = useRef(Date.now());

  const router = useRouter();
  const { selectedNews, setSelectedNews } = useNewsStore();
  const { user, updateUser } = useAuthStore();

  const fetchLatestNews = async () => {
    if (!selectedNews) return;

    setLoadingLatest(true);
    try {
      const url = `/news/latest/feed?limit=30&excludeId=${selectedNews.article_id}`;
      const res = await axiosClient.get(url);
      
      if (res.data.success && res.data.data.results) {
        setLatestNews(res.data.data.results);
      }
    } catch (err) {
      console.log("Error fetching latest news:", err);
    } finally {
      setLoadingLatest(false);
    }
  };

  useEffect(() => {
    if (!selectedNews || !user || hasTracked) return;

    const timer = setTimeout(async () => {
      await trackReading();
    }, 30000);

    return () => clearTimeout(timer);
  }, [selectedNews, user, hasTracked]);

  const trackReading = async () => {
    try {
      const timeSpent = Math.floor((Date.now() - readingStartTime.current) / 1000);

      if (timeSpent < 30) return;

      const response = await axiosClient.post(
        `/news/${selectedNews.article_id}/read`,
        { timeSpent }
      );

      if (response.data.success) {
        const earned = response.data.data.coinsEarned;
        setHasTracked(true);

        if (earned > 0) {
          updateUser({
            wallet: {
              ...user.wallet,
              availableCoins: (user.wallet?.availableCoins || 0) + earned,
              totalEarned: (user.wallet?.totalEarned || 0) + earned,
            },
          });

          Alert.alert(
            "🎉 Coins Earned!",
            `You earned ${earned} coins!\n\n✅ Unlimited reading!`,
            [{ 
              text: "Continue Reading", 
              onPress: () => {
                // Remove from latest news
                setLatestNews(prev => prev.filter(item => item.article_id !== selectedNews.article_id));
              }
            }]
          );

          if (response.data.data.streakBonus > 0) {
            Alert.alert(
              "🔥 Streak Bonus!",
              `+${response.data.data.streakBonus} bonus coins for 7-day streak!`,
              [{ text: "Amazing!", style: "default" }]
            );
          }
        }
      }
    } catch (error) {
      if (error.response?.status === 400) {
        console.log("Already read today");
        setHasTracked(true);
      } else if (error.response?.status === 404) {
        console.log("Article not found");
      } else {
        console.error("Track reading error:", error);
      }
    }
  };

  useEffect(() => {
    fetchLatestNews();
    readingStartTime.current = Date.now();
    setHasTracked(false);
  }, [selectedNews]);

  if (!selectedNews) {
    return (
      <View style={styles.centered}>
        <Ionicons name="newspaper-outline" size={80} color="#ccc" />
        <Text style={styles.noDataText}>No news data found.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#FF4B2B", fontSize: 16, marginTop: 10, fontWeight: "600" }}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ✅ Handle latest news click with back navigation
  const handleLatestNewsClick = (item) => {
    // Go back first
    router.back();
    
    // Then update selected news after a short delay
    setTimeout(() => {
      setSelectedNews(item);
      router.push("/newsDetails");
    }, 100);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <StatusBar style="dark" backgroundColor="#ffffff" translucent={false} />
      <View style={styles.container}>
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

        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {selectedNews.image_url && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedNews.image_url }} style={styles.image} />
            </View>
          )}

          <Text style={styles.title}>{selectedNews.title}</Text>

          <Text style={styles.meta}>
            By {(selectedNews.creator || ["Unknown"]).join(", ")} |{" "}
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

          {user && !hasTracked && (
            <View style={styles.card}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Ionicons name="time-outline" size={24} color="#FF4B2B" />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#FF4B2B" }}>
                    📖 Read for 30+ seconds to earn 10 coins!
                  </Text>
                  <Text style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                    ✅ Unlimited reading - No daily limit!
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {selectedNews.description || "No description available."}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Content</Text>
            <Text style={styles.description}>
              {selectedNews.content || selectedNews.description || "Full content is available at the source."}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Source</Text>
            <View style={styles.sourceRow}>
              {selectedNews.source_icon && (
                <Image source={{ uri: selectedNews.source_icon }} style={styles.sourceIcon} />
              )}
              <TouchableOpacity onPress={() => selectedNews.link && Linking.openURL(selectedNews.link)}>
                <Text style={styles.sourceText}>{selectedNews.source_name || "Unknown Source"}</Text>
              </TouchableOpacity>
            </View>
          </View>

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

          {loadingLatest ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <ActivityIndicator size="large" color="#FF4B2B" />
              <Text style={{ color: "#666", marginTop: 10, fontSize: 14 }}>
                Loading latest news...
              </Text>
            </View>
          ) : latestNews.length > 0 ? (
            <View style={{ marginTop: 20, paddingHorizontal: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#FF4B2B", marginBottom: 10 }}>
                📰 Latest News ({latestNews.length} articles)
              </Text>

              {latestNews.map((item, index) => (
                <TouchableOpacity
                  key={`${item.article_id}-${index}`}
                  style={{
                    marginBottom: 20,
                    borderRadius: 16,
                    backgroundColor: "#fff",
                    overflow: "hidden",
                    elevation: 3,
                  }}
                  activeOpacity={0.9}
                  onPress={() => handleLatestNewsClick(item)}
                >
                  <View style={{ position: "relative" }}>
                    {item.image_url ? (
                      <Image source={{ uri: item.image_url }} style={{ width: "100%", height: 200, resizeMode: "cover" }} />
                    ) : (
                      <View style={{ width: "100%", height: 200, backgroundColor: "#f0f0f0", justifyContent: "center", alignItems: "center" }}>
                        <Ionicons name="image-outline" size={40} color="#ccc" />
                      </View>
                    )}

                    {item.category && item.category[0] && (
                      <View style={{ position: "absolute", top: 12, left: 12, backgroundColor: "#FF4B2B", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}>
                        <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
                          {item.category[0].toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={{ padding: 12 }}>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: "#333", marginBottom: 6 }} numberOfLines={2}>
                      {item.title}
                    </Text>

                    {item.description && (
                      <Text style={{ color: "#666", fontSize: 13, lineHeight: 18, marginBottom: 8 }} numberOfLines={2}>
                        {item.description}
                      </Text>
                    )}

                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={{ color: "#999", fontSize: 11 }}>
                        {item.source_name || "Unknown"} •{" "}
                        {item.pubDate ? new Date(item.pubDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
                      </Text>
                      <Ionicons name="chevron-forward-outline" size={20} color="#FF4B2B" />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Ionicons name="newspaper-outline" size={50} color="#ccc" />
              <Text style={{ color: "#999", marginTop: 10, fontSize: 14 }}>No more news available</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}