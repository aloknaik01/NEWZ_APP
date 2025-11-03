// app/home.jsx
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import axiosClient from "./api/axiosClient";
import Help from "./help.jsx";
import History from "./history.jsx";
import Profile from "./profile.jsx";
import useAuthStore from './store/authStore.js';
import useNewsStore from './store/newsStore.js';
import { colors } from "./styles/colors";
import { styles } from "./styles/homeStyles";
import { bottomNavData } from "./utils/bottomNavData";
import { navigationTabs } from "./utils/navigationTabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
 

export default function Home() {
  const router = useRouter();
  const { setSelectedNews } = useNewsStore();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState(0);
  const [activeNav, setActiveNav] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPage, setNextPage] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const insets = useSafeAreaInsets();


 
  useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [user]);


  // ✅ Get coins from user state
  const availableCoins = user?.wallet?.availableCoins || 0;

  // ✅ Fetch news from backend (auto-hides read articles)
  const fetchNews = async (category, pageId = null, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      let url = `/news/db?category=${category}&limit=10`;

      if (pageId) {
        url += `&page=${pageId}`;
      }

      console.log('Fetching from backend:', url);

      const res = await axiosClient.get(url);
      const data = res.data;

      if (data.success && data.data.results) {
        if (isLoadMore) {
          setNewsData(prev => [...prev, ...data.data.results]);
        } else {
          setNewsData(data.data.results);
        }

        if (data.data.nextPage) {
          setNextPage(data.data.nextPage);
          setHasMore(true);
        } else {
          setNextPage(null);
          setHasMore(false);
        }
      } else {
        if (!isLoadMore) {
          setNewsData([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error("Backend news fetch error:", error);

      if (!isLoadMore) {
        setNewsData([{
          "article_id": "00000",
          "title": "Connection Issue - Try Again",
          "link": "#",
          "keywords": [""],
          "creator": ["News Team"],
          "description": "Unable to fetch news from server. Please check your connection.",
          "content": "Please check your connection and try again",
          "pubDate": new Date().toISOString(),
          "image_url": "https://img.freepik.com/premium-vector/modern-design-concept-result-found_637684-282.jpg",
          "source_name": "System",
          "category": ["general"]
        }]);
      }
      setHasMore(false);
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchNews(navigationTabs[activeTab]);
  }, []);

  useEffect(() => {
    setNewsData([]);
    setNextPage(null);
    setHasMore(true);
    fetchNews(navigationTabs[activeTab]);
  }, [activeTab]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setNextPage(null);
    setHasMore(true);
    fetchNews(navigationTabs[activeTab]).finally(() => setRefreshing(false));
  }, [activeTab]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && nextPage) {
      fetchNews(navigationTabs[activeTab], nextPage, true);
    }
  }, [loadingMore, hasMore, nextPage, activeTab]);

  const handleShare = async (item) => {
    try {
      await Share.share({
        message: `📰 ${item.title}\n\n${item.description || ""}\n\nRead more: ${item.link}`,
        url: item.link,
        title: item.title,
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  const renderNavIcon = useCallback(
    (item, index) => {
      const isActive = activeNav === index;
      const iconColor = isActive ? colors.primary : colors.gray;
      if (item.iconType === "ionicon") {
        return <Ionicons name={item.icon} size={26} color={iconColor} />;
      } else {
        return <MaterialIcons name={item.icon} size={26} color={iconColor} />;
      }
    },
    [activeNav]
  );

  const handleNavPress = useCallback((index) => {
    setActiveNav(index);
  }, []);

  const handlePress = (newsItem) => {
    setSelectedNews(newsItem);
    router.push("/newsDetails");
  };

  const renderNewsCard = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.newsCard}
        activeOpacity={0.95}
        onPress={() => handlePress(item)}
      >
        <View style={styles.newsHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.newsSource}>
              {item.source_name || "Unknown"}
            </Text>
            <Text style={styles.newsTime}>
              {item.pubDate
                ? new Date(item.pubDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })
                : "Today"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => handleShare(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="share-social" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.newsContent}>
          {item.image_url ? (
            <View style={styles.imgWrapper}>
              <Image
                source={{ uri: item.image_url }}
                style={styles.newsImage}
              />
              {item.category && item.category[0] && (
                <View style={styles.newsBadge}>
                  <Text style={styles.badgeText}>
                    {item.category[0].toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={[styles.imgWrapper, styles.noImageWrapper]}>
              <Ionicons name="image-outline" size={40} color={colors.gray} />
            </View>
          )}

          <View style={styles.newsText}>
            <Text style={styles.newsTitle} numberOfLines={3}>
              {item.title || "Untitled Article"}
            </Text>
            {item.description && (
              <Text style={styles.newsDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.coinsContainer}>
          <LinearGradient
            colors={["#FFD700", "#FFA500"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.coinsBadge}
          >
            <Ionicons name="logo-bitcoin" size={16} color="#fff" />
            <Text style={styles.coinsText}>+10 Coins</Text>
          </LinearGradient>
          <Text style={styles.readMoreText}>Tap to read & earn</Text>
        </View>
      </TouchableOpacity>
    ),
    []
  );

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.footerLoaderText}>Loading more news...</Text>
      </View>
    );
  }, [loadingMore]);

  const bottomNavPadding = Math.max(insets.bottom, 0);
  const totalBottomHeight = 70 + bottomNavPadding;

  return (
    <View style={styles.container}>
      {/* Header with LIVE wallet balance */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={[styles.statusBar, { paddingTop: insets.top }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Ionicons name="newspaper" size={28} color="#fff" />
            <Text style={styles.headerTitle}>NewsApp</Text>
          </View>
          <View style={styles.coinsHeader}>
            <Ionicons name="wallet" size={20} color="#FFD700" />
            <Text style={styles.coinsHeaderText}>
              {availableCoins.toLocaleString()}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {activeNav === 0 && (
        <>
          <View style={styles.tabsWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {navigationTabs.map((tab, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.tabItem,
                    activeTab === index && styles.tabItemActive,
                  ]}
                  onPress={() => setActiveTab(index)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === index && styles.tabTextActive,
                    ]}
                  >
                    {tab === "All" ? "🔥 All" : tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {loading && !refreshing && newsData.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Fetching latest news...</Text>
            </View>
          ) : (
            <FlatList
              data={newsData}
              keyExtractor={(item, index) => item.article_id || index.toString()}
              renderItem={renderNewsCard}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                />
              }
              contentContainerStyle={{ paddingBottom: totalBottomHeight }}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
              ListEmptyComponent={() => (
                <View style={styles.placeholder}>
                  <Ionicons name="newspaper-outline" size={80} color={colors.lightGray} />
                  <Text style={styles.placeholderText}>No news available</Text>
                  <Text style={styles.placeholderSubtext}>Pull to refresh</Text>
                </View>
              )}
            />
          )}
        </>
      )}

      {activeNav === 1 && <History />}
      {activeNav === 2 && <Help />}
      {activeNav === 3 && <Profile />}

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: bottomNavPadding }]}>
        <View style={styles.navWrapper}>
          {bottomNavData.map((nav, index) => {
            const isActive = activeNav === index;
            return (
              <TouchableOpacity
                key={index}
                style={styles.navItem}
                onPress={() => handleNavPress(index)}
              >
                {isActive && <View style={styles.activeIndicator} />}
                {renderNavIcon(nav, index)}
                <Text
                  style={[
                    styles.navLabel,
                    isActive && styles.navLabelActive,
                  ]}
                >
                  {nav.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}