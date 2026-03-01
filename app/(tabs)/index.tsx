import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Image,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Moods, type Mood } from '../../constants/Moods';
import { getAreaBasedList, type WellnessItem } from '../../services/api';
import { getRecentlyViewed, type RecentItem } from '../../services/recentlyViewed';
import WellnessCard from '../../components/WellnessCard';
import BannerAdWrapper from '../../components/BannerAdWrapper';

export default function HomeScreen() {
  const [selectedMood, setSelectedMood] = useState<Mood>(Moods[5]);
  const [items, setItems] = useState<WellnessItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);

  const loadRecommendations = useCallback(async (mood: Mood, pageNum: number, isRefresh = false) => {
    if (loading && !isRefresh) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAreaBasedList(undefined, undefined, mood.themaCode, pageNum, 10);
      if (isRefresh || pageNum === 1) {
        setItems(data);
      } else {
        setItems(prev => [...prev, ...data]);
      }
      setHasMore(data.length === 10);
      setPage(pageNum);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('추천 로드 실패:', msg);
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loading]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    loadRecommendations(selectedMood, 1, true);
  }, [selectedMood]);

  useFocusEffect(
    useCallback(() => {
      getRecentlyViewed().then(setRecentItems);
    }, [])
  );

  const handleMoodSelect = (mood: Mood) => {
    if (mood.key === selectedMood.key) return;
    setSelectedMood(mood);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadRecommendations(selectedMood, 1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadRecommendations(selectedMood, page + 1);
    }
  };

  const handleItemPress = (item: WellnessItem) => {
    router.push({
      pathname: '/detail',
      params: { contentId: item.contentId, title: item.title, contentTypeId: item.contentTypeId ?? '12' },
    });
  };

  const handleRecentPress = (item: RecentItem) => {
    router.push({
      pathname: '/detail',
      params: { contentId: item.contentId, title: item.title, contentTypeId: item.contentTypeId ?? '12' },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>힐링로드</Text>
        <Text style={styles.headerSub}>오늘 당신에게 맞는 여행지</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.contentId}
        renderItem={({ item }) => (
          <WellnessCard
            item={item}
            onPress={() => handleItemPress(item)}
          />
        )}
        ListHeaderComponent={
          <View>
            <Text style={styles.sectionTitle}>오늘 기분이 어떠세요?</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.moodList}
            >
              {Moods.map((mood) => (
                <TouchableOpacity
                  key={mood.key}
                  style={[
                    styles.moodChip,
                    { backgroundColor: mood.bgColor },
                    selectedMood.key === mood.key && styles.moodChipSelected,
                  ]}
                  onPress={() => handleMoodSelect(mood)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text
                    style={[
                      styles.moodLabel,
                      selectedMood.key === mood.key && { color: Colors.primary, fontWeight: '700' },
                    ]}
                  >
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={[styles.moodBanner, { backgroundColor: selectedMood.bgColor }]}>
              <Text style={styles.moodBannerEmoji}>{selectedMood.emoji}</Text>
              <View>
                <Text style={styles.moodBannerTitle}>{selectedMood.label} 해소 여행</Text>
                <Text style={styles.moodBannerDesc}>{selectedMood.description}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>추천 웰니스 여행지</Text>
          </View>
        }
        ListEmptyComponent={
          loading ? null : error ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>⚠️</Text>
              <Text style={styles.emptyText}>데이터를 불러오지 못했어요</Text>
              <Text style={styles.emptyError}>{error}</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>추천 여행지가 없어요</Text>
            </View>
          )
        }
        ListFooterComponent={
          <View>
            {loading && <ActivityIndicator style={{ margin: 20 }} color={Colors.primary} />}
            {recentItems.length > 0 && (
              <View style={styles.recentSection}>
                <Text style={styles.sectionTitle}>최근 본 여행지</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.recentList}
                >
                  {recentItems.map((item) => (
                    <TouchableOpacity
                      key={item.contentId}
                      style={styles.recentCard}
                      onPress={() => handleRecentPress(item)}
                      activeOpacity={0.8}
                    >
                      {item.orgImage ? (
                        <Image source={{ uri: item.orgImage }} style={styles.recentImage} resizeMode="cover" />
                      ) : (
                        <View style={[styles.recentImage, styles.recentImagePlaceholder]}>
                          <Text style={{ fontSize: 28 }}>🌿</Text>
                        </View>
                      )}
                      <Text style={styles.recentTitle} numberOfLines={2}>{item.title}</Text>
                      {item.baseAddr ? (
                        <Text style={styles.recentAddr} numberOfLines={1}>{item.baseAddr}</Text>
                      ) : null}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        }
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      />
      <BannerAdWrapper />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  listContent: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  moodList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  moodChip: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodChipSelected: {
    borderColor: Colors.primary,
  },
  moodEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  moodBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  moodBannerEmoji: {
    fontSize: 36,
  },
  moodBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  moodBannerDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 12,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
    marginBottom: 8,
  },
  emptyError: {
    color: Colors.error,
    fontSize: 11,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 16,
  },
  recentSection: {
    marginTop: 8,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  recentList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  recentCard: {
    width: 140,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recentImage: {
    width: 140,
    height: 100,
  },
  recentImagePlaceholder: {
    backgroundColor: Colors.tag,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    paddingHorizontal: 10,
    paddingTop: 8,
    lineHeight: 18,
  },
  recentAddr: {
    fontSize: 11,
    color: Colors.textMuted,
    paddingHorizontal: 10,
    paddingBottom: 10,
    marginTop: 2,
  },
});
