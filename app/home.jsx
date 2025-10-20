import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
import { colors } from "./styles/colors";
import { styles } from "./styles/homeStyles";
import { bottomNavData } from "./utils/bottomNavData";
import { navigationTabs } from "./utils/navigationTabs";

const API_KEY = "pub_65094308236047cdbbd364a05e75b898";

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const [activeNav, setActiveNav] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  // Fetch news based on category
  const fetchNews = async (category) => {
    setLoading(true);
    try {
      let categoryParam;

      // "All" tab fetches multiple categories
      if (category === "All") {
        categoryParam = "sports,entertainment,politics,crime,technology";
      } else if (category === "top") {
        categoryParam = "top";
      } else {
        categoryParam = category;
      }

      const url = `https://newsdata.io/api/1/latest?apikey=${API_KEY}&language=en&country=in&timezone=Asia/Kolkata&image=1&removeduplicate=1&category=${categoryParam}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.results && Array.isArray(data.results)) {
        setNewsData(data.results);
      } else {
        setNewsData([]);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      setNewsData([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchNews(navigationTabs[activeTab]);
  }, []);

  // Refetch when tab changes
  useEffect(() => {
    fetchNews(navigationTabs[activeTab]);
  }, [activeTab]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNews(navigationTabs[activeTab]).finally(() => setRefreshing(false));
  }, [activeTab]);

  // Share news function
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

  const renderNewsCard = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.newsCard}
        activeOpacity={0.95}
        onPress={() => item.link && Linking.openURL(item.link)}
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

          {/* Share Button */}
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
              <View style={styles.newsBadge}>
                <Text style={styles.badgeText}>
                  {(item.category && item.category[0]) || "Top"}
                </Text>
              </View>
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

        {/*  Coins Badge */}
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

  const bottomNavPadding = Math.max(insets.bottom, 0);
  const totalBottomHeight = 70 + bottomNavPadding;

  return (
    <View style={styles.container}>
      {/*   Header */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={[styles.statusBar, { paddingTop: insets.top }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            {/* <Ionicons name="newspaper" size={28} color="#fff" />*/}
            <Text style={styles.headerTitle}>Read&Earn</Text>
          </View>
          <View style={styles.coinsHeader}>
            <Ionicons name="wallet" size={20} color="#FFD700" />
            <Text style={styles.coinsHeaderText}>500,000</Text>
          </View>
        </View>
      </LinearGradient>

      {activeNav === 0 && (
        <>
          {/*  Category Tabs */}
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
                  {activeTab === index && (
                    <View style={styles.tabIndicator} />
                  )}
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

          {/* News Feed with  Loading */}
          {loading && !refreshing ? (
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
        <View style={styles.placeholder}>
          <Ionicons name="time-outline" size={80} color={colors.gray} />
          <Text style={styles.placeholderText}>Reading History</Text>
          <Text style={styles.placeholderSubtext}>Your read articles will appear here</Text>
        </View>
      )}

      {activeNav === 2 && (
        <View style={styles.placeholder}>
          <Ionicons name="help-circle-outline" size={80} color={colors.gray} />
          <Text style={styles.placeholderText}>Help & Support</Text>
          <Text style={styles.placeholderSubtext}>Get assistance anytime</Text>
        </View>
      )}

      {activeNav === 3 && (
        <View style={styles.placeholder}>
          <Ionicons name="person-circle-outline" size={80} color={colors.gray} />
          <Text style={styles.placeholderText}>Your Profile</Text>
          <Text style={styles.placeholderSubtext}>Manage your account</Text>
        </View>
      )}

      {/*  Bottom Navigation */}
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