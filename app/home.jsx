import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "./styles/colors";
import { styles } from "./styles/homeStyles";
import { bottomNavData } from "./utils/bottomNavData";
import { navigationTabs } from "./utils/navigationTabs";

const { width, height } = Dimensions.get("window");

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const [activeNav, setActiveNav] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [newsData, setNewsData] = useState([]);
  const insets = useSafeAreaInsets();

  // ✅ Fetch news from FCS API
  const fetchNews = async () => {
    try {
      const res = await fetch(
        "https://newsdata.io/api/1/latest?apikey=pub_ea79095eebaa4802a854e4d4a90726d2&language=en&country=in&timezone=Asia/Kolkata"
      );
      const data = await res.json();
      if (data.results && Array.isArray(data.results)) {
        setNewsData(data.results);
      } else {
        setNewsData([]);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      setNewsData([]);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNews().finally(() => setRefreshing(false));
  }, []);

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
        <View style={styles.newsHeader}>
          <Text style={styles.newsSource}>
            {item.source_name || "Unknown"}
          </Text>
          <Text style={styles.newsTime}>
            {item.pubDate
              ? new Date(item.pubDate).toLocaleDateString()
              : "Today"}
          </Text>
        </View>

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
            <View
              style={[
                styles.imgWrapper,
                { backgroundColor: colors.lightGray, justifyContent: "center", alignItems: "center" },
              ]}
            >
              <Text style={{ color: colors.gray, fontSize: 12 }}>No Image</Text>
            </View>
          )}

          <View style={styles.newsText}>
            <Text style={styles.newsTitle} numberOfLines={3}>
              {item.title || "Untitled Article"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    ),
    []
  );

  const bottomNavPadding = Math.max(insets.bottom, 0);
  const totalBottomHeight = 70 + bottomNavPadding;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={[styles.statusBar, { paddingTop: insets.top }]}
      />

      {/* ✅ Conditional content based on activeNav */}
      {activeNav === 0 && (
        <>
          {/* Tabs */}
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
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* ✅ News Feed */}
          <FlatList
            data={newsData}
            keyExtractor={(item, index) => item.article_id || index.toString()}
            renderItem={renderNewsCard}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
              />
            }
            contentContainerStyle={{ paddingBottom: totalBottomHeight }}
            ListEmptyComponent={() => (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>No news available</Text>
              </View>
            )}
          />
        </>
      )}

      {activeNav === 1 && (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>History Screen</Text>
        </View>
      )}

      {activeNav === 2 && (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Help Desk Screen</Text>
        </View>
      )}

      {activeNav === 3 && (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Profile Screen</Text>
        </View>
      )}

      {/* ✅ Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: bottomNavPadding }]}>
        <View style={styles.navWrapper}>
          {bottomNavData.map((nav, index) => (
            <TouchableOpacity
              key={index}
              style={styles.navItem}
              onPress={() => handleNavPress(index)}
            >
              {renderNavIcon(nav, index)}
              <Text
                style={[
                  styles.navLabel,
                  activeNav === index && styles.navLabelActive,
                ]}
              >
                {nav.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}
