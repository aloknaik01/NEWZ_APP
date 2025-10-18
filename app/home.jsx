import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
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

const newsData = [
  {
    id: 1,
    source: "BBC",
    time: "2h ago",
    title: "Breaking News: Market hits all-time high",
    image: "https://via.placeholder.com/150",
    badge: "Top",
  },
  {
    id: 2,
    source: "CNN",
    time: "1h ago",
    title: "Sports: Local team wins championship",
    image: "https://via.placeholder.com/150",
    badge: "Sports",
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const [activeNav, setActiveNav] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
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
      <TouchableOpacity style={styles.newsCard} activeOpacity={0.95}>
        <View style={styles.newsHeader}>
          <Text style={styles.newsSource}>{item.source}</Text>
          <Text style={styles.newsTime}>{item.time}</Text>
        </View>
        <View style={styles.newsContent}>
          <View style={styles.imgWrapper}>
            <Image source={{ uri: item.image }} style={styles.newsImage} />
            <View style={styles.newsBadge}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          </View>
          <View style={styles.newsText}>
            <Text style={styles.newsTitle} numberOfLines={3}>
              {item.title}
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

      {/* Conditional content based on activeNav */}
      {activeNav === 0 && (
        <>
          {/* News Top Tabs */}
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

          {/* News List */}
          <FlatList
            data={newsData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderNewsCard}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
              />
            }
            contentContainerStyle={{ paddingBottom: totalBottomHeight }}
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

      {/* Bottom Navigation */}
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
