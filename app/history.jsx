import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import axiosClient from './api/axiosClient';
import useAuthStore from './store/authStore';
import useNewsStore from './store/newsStore';
import { colors } from './styles/colors';

export default function History() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { setSelectedNews } = useNewsStore();

  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch reading history
  const fetchHistory = async () => {
    if (!user) {
      router.replace('/');
      return;
    }

    try {
      setLoading(true);
      const response = await axiosClient.get('/news/user/stats');

      if (response.data.success) {
        setHistory(response.data.data.recentReading || []);
        setStats({
          wallet: response.data.data.wallet,
          profile: response.data.data.profile,
          today: response.data.data.today
        });
      }
    } catch (error) {
      console.error('Fetch history error:', error);
      Alert.alert('Error', 'Failed to load reading history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  }, []);

  // Handle article click
  const handleArticleClick = (item) => {
    if (item.link && item.link !== '#') {
      // Create a news item object from history data
      const newsItem = {
        article_id: item.id,
        title: item.title,
        description: item.description,
        link: item.link,
        image_url: item.image_url,
        source_name: item.source,
        category: [item.category],
        pubDate: item.reading_date
      };

      setSelectedNews(newsItem);
      router.push('/newsDetails');
    } else {
      Alert.alert('Unavailable', 'This article is no longer available');
    }
  };

  // Render history card
  const renderHistoryCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => handleArticleClick(item)}
    >
      <View style={styles.cardContent}>
        {/* Thumbnail */}
        <View style={styles.thumbnailContainer}>
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={styles.thumbnail}
            />
          ) : (
            <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
              <Ionicons name="newspaper-outline" size={30} color={colors.gray} />
            </View>
          )}
          
          {/* Category badge */}
          {item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.textContent}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={12} color={colors.gray} />
            <Text style={styles.metaText}>
              {new Date(item.reading_date).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={12} color={colors.gray} />
            <Text style={styles.metaText}>{item.time_spent}s read</Text>
          </View>

          {/* Coins earned */}
          {item.coins_earned > 0 && (
            <View style={styles.coinsContainer}>
              <Ionicons name="logo-bitcoin" size={14} color="#FFD700" />
              <Text style={styles.coinsText}>+{item.coins_earned} coins</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // Stats header
  const ListHeaderComponent = () => (
    <View style={styles.header}>
      {/* Stats cards */}
      {stats && (
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.statsCard}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {stats.profile.total_articles_read}
              </Text>
              <Text style={styles.statLabel}>Total Read</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {stats.wallet.total_earned}
              </Text>
              <Text style={styles.statLabel}>Coins Earned</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {stats.profile.current_streak}
              </Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>

          {/* Today's stats */}
          <View style={styles.todayCard}>
            <Text style={styles.todayTitle}>📚 Today's Progress</Text>
            <View style={styles.todayRow}>
              <Text style={styles.todayText}>
                {stats.today.articles_read}/50 articles
              </Text>
              <Text style={styles.todayCoins}>
                +{stats.today.coins_earned} coins
              </Text>
            </View>
          </View>
        </LinearGradient>
      )}

      <Text style={styles.sectionTitle}>Reading History</Text>
    </View>
  );

  // Empty state
  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="book-outline" size={80} color={colors.lightGray} />
      <Text style={styles.emptyText}>No reading history yet</Text>
      <Text style={styles.emptySubtext}>
        Start reading articles to see your history here
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => router.push('/home')}
      >
        <Text style={styles.exploreButtonText}>Explore News</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderHistoryCard}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
  },
  listContent: {
    paddingBottom: 100,
  },
  header: {
    padding: 16,
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  todayCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 12,
  },
  todayTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  todayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  todayText: {
    fontSize: 13,
    color: '#fff',
  },
  todayCoins: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFD700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.background,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  thumbnailContainer: {
    position: 'relative',
    marginRight: 12,
  },
  thumbnail: {
    width: 100,
    height: 80,
    borderRadius: 8,
  },
  placeholderThumbnail: {
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  textContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.gray,
    marginLeft: 4,
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  coinsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFD700',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 8,
    textAlign: 'center',
  },
  exploreButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});