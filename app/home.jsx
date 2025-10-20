import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useNewsStore from './store/newsStore.js';
import { colors } from "./styles/colors";
import { styles } from "./styles/homeStyles";
import { bottomNavData } from "./utils/bottomNavData";
import { navigationTabs } from "./utils/navigationTabs";
import History from "./history.jsx";
import Help from "./help.jsx";

const API_KEY = "pub_a81e8ada4daa4f15933fe3e2ece357e3";

export default function Home() {

  const router = useRouter();
  const { setSelectedNews } = useNewsStore();

  const [activeTab, setActiveTab] = useState(0);
  const [activeNav, setActiveNav] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPage, setNextPage] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const insets = useSafeAreaInsets();

  // ✅ Fetch news based on category
  const fetchNews = async (category, pageId = null, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      let categoryParam;

      // ✅ "All" tab fetches multiple categories
      if (category === "All") {
        categoryParam = "sports,entertainment,politics,crime,technology";
      } else if (category === "top") {
        categoryParam = "top";
      } else {
        categoryParam = category;
      }

      // ✅ Build URL with pagination
      let url = `https://newsdata.io/api/1/latest?apikey=${API_KEY}&language=en&country=in&timezone=Asia/Kolkata&image=1&removeduplicate=1&category=${categoryParam}`;

      // ✅ Add page parameter if pageId exists
      if (pageId) {
        url += `&page=${pageId}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.results && Array.isArray(data.results)) {
        if (isLoadMore) {
          // ✅ Append new data to existing
          setNewsData(prev => [...prev, ...data.results]);
        } else {
          // ✅ Replace with fresh data
          setNewsData(data.results);
        }

        // ✅ Store nextPage ID for pagination
        if (data.nextPage) {
          setNextPage(data.nextPage);
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
      console.error("Error fetching news:", error);
      if (!isLoadMore) {
        setNewsData([]);
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

  // ✅ Initial load
  useEffect(() => {
    fetchNews(navigationTabs[activeTab]);
  }, []);

  // ✅ Refetch when tab changes (reset pagination)
  useEffect(() => {
    setNewsData([]);
    setNextPage(null);
    setHasMore(true);
    fetchNews(navigationTabs[activeTab]);
  }, [activeTab]);

  // ✅ Pull to refresh (reset pagination)
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setNextPage(null);
    setHasMore(true);
    fetchNews(navigationTabs[activeTab]).finally(() => setRefreshing(false));
  }, [activeTab]);

  // ✅ Load more when reaching end
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && nextPage) {
      fetchNews(navigationTabs[activeTab], nextPage, true);
    }
  }, [loadingMore, hasMore, nextPage, activeTab]);

  // ✅ Share news function
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
        onPress={() =>  handlePress(item)}
      >
        {/* Header with Source & Share */}
        <View style={styles.newsHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.newsSource}>
              {item.source_name || "Unknown"}
            </Text>
            <Text style={styles.newsTime}>
              {item.pubDate
                ? new Date(item.pubDate).toLocaleDateString()
                : "Today"}
            </Text>
          </View>

          {/* ✅ Share Button */}
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => handleShare(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="share-social" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
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
                    {item.category[0]}
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

        {/* ✅ Coins Badge */}
        <View style={styles.coinsContainer}>
          <LinearGradient
            colors={["#FFD700", "#FFA500"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.coinsBadge}
          >
            <Ionicons name="logo-bitcoin" size={16} color="#fff" />
            <Text style={styles.coinsText}>+50 Coins</Text>
          </LinearGradient>
          <Text style={styles.readMoreText}>Tap to read & earn</Text>
        </View>
      </TouchableOpacity>
    ),
    []
  );

  // ✅ Footer loader for infinite scroll
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
      {/* ✅ Enhanced Header */}
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
            <Text style={styles.coinsHeaderText}>500,000</Text>
          </View>
        </View>
      </LinearGradient>

      {activeNav === 0 && (
        <>
          {/* ✅ Enhanced Category Tabs */}
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
                    {tab === "All" ? "🔥 All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* ✅ News Feed with Infinite Scroll */}
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
              // ✅ Infinite scroll triggers
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

      {activeNav === 1 && (
        <History/>
      )}

      {activeNav === 2 && (
        <Help/>
      )}

      {activeNav === 3 && (
        <View style={styles.placeholder}>
          <Ionicons name="person-circle-outline" size={80} color={colors.gray} />
          <Text style={styles.placeholderText}>Your Profile</Text>
          <Text style={styles.placeholderSubtext}>Manage your account</Text>
        </View>
      )}

      {/* ✅ Enhanced Bottom Navigation */}
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