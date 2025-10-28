import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, ImageBackground, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import axiosClient from "./api/axiosClient";
import BottomNav from "./component/BottomNav";
import useNewsStore from "./store/newsStore";

export default function History() {
  const router = useRouter();
  const { setSelectedNews } = useNewsStore();
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/news/user/stats');

      if (response.data.success) {
        const recentReading = response.data.data.recentReading || [];

        // Transform to match existing UI structure
        const transformedData = recentReading.map((item) => ({
          article_id: item.id?.toString() || `history-${Date.now()}-${Math.random()}`,
          title: item.title || "Article Title",
          link: "#",
          creator: ["News Team"],
          description: `Read on ${new Date(item.reading_date).toLocaleDateString()} • Earned ${item.coins_earned} coins`,
          pubDate: item.reading_date,
          image_url: item.image_url || "https://via.placeholder.com/400x300/FF4B2B/FFFFFF?text=News+Article",
          source_icon: "https://via.placeholder.com/50/FF4B2B/FFFFFF?text=N",
          category: [item.category || 'general'],
          time_spent: item.time_spent,
          coins_earned: item.coins_earned
        }));

        setHistoryData(transformedData);
      }
    } catch (error) {
      console.error("History fetch error:", error);
      setHistoryData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistory();
  }, []);

  const handleArticlePress = (item) => {
    // Since it's history, we can't navigate to full article
    // But we maintain the tap behavior
    console.log("History item tapped:", item.title);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => handleArticlePress(item)}
    >
      <ImageBackground
        source={{ uri: item.image_url }}
        style={styles.image}
        imageStyle={{ borderRadius: 15 }}
      >
        <View style={styles.gradientOverlay} />
        <Text style={styles.title}>{item.title}</Text>
      </ImageBackground>
      <View style={styles.content}>
        <Text style={styles.description} numberOfLines={3}>
          {item.description}
        </Text>
        <View style={styles.bottomRow}>
          <View style={styles.sourceRow}>
            <Image source={{ uri: item.source_icon }} style={styles.sourceIcon} />
            <Text style={styles.source}>{item.creator[0]}</Text>
          </View>
          <Text style={styles.date}>
            {new Date(item.pubDate).toLocaleDateString()}
          </Text>
        </View>

        {/* Coins earned badge */}
        {item.coins_earned > 0 && (
          <View style={styles.coinsBadge}>
            <Text style={styles.coinsText}>+{item.coins_earned} coins earned</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>📚 No Reading History</Text>
      <Text style={styles.emptySubtext}>Start reading articles to see your history here</Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4B2B" />
          <Text style={styles.loadingText}>Loading your history...</Text>
        </View>
        <BottomNav />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <FlatList
        data={historyData}
        keyExtractor={(item) => item.article_id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF4B2B"]}
            tintColor="#FF4B2B"
          />
        }
        ListEmptyComponent={renderEmpty}
      />
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  image: {
    height: 180,
    justifyContent: "flex-end",
    padding: 12,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    zIndex: 2,
  },
  content: {
    padding: 12,
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sourceIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  source: {
    fontSize: 12,
    color: "#888",
  },
  date: {
    fontSize: 12,
    color: "#888",
  },
  coinsBadge: {
    marginTop: 10,
    backgroundColor: "#FFD700",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  coinsText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
});