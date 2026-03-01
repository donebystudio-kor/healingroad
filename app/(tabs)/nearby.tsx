import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { getNearbyWellness, type WellnessItem } from '../../services/api';
import WellnessCard from '../../components/WellnessCard';
import BannerAdWrapper from '../../components/BannerAdWrapper';

const RADIUS_OPTIONS = [
  { label: '5km', value: 5000 },
  { label: '10km', value: 10000 },
  { label: '20km', value: 20000 },
  { label: '50km', value: 50000 },
];

export default function NearbyScreen() {
  const [items, setItems] = useState<WellnessItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [radius, setRadius] = useState(20000);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    requestLocationAndLoad();
  }, []);

  useEffect(() => {
    if (location) {
      setPage(1);
      setHasMore(true);
      loadNearby(location.lat, location.lng, radius, 1, true);
    }
  }, [radius]);

  const requestLocationAndLoad = async () => {
    setLoading(true);
    setLocationError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('위치 권한이 필요해요.\n설정에서 위치 권한을 허용해주세요.');
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
      setLocation(coords);
      await loadNearby(coords.lat, coords.lng, radius, 1, true);
    } catch (e) {
      setLocationError('위치를 가져오지 못했어요.\n잠시 후 다시 시도해주세요.');
      setLoading(false);
    }
  };

  const loadNearby = async (lat: number, lng: number, rad: number, pageNum: number, isNew: boolean) => {
    setLoading(true);
    try {
      const data = await getNearbyWellness(lat, lng, rad, pageNum, 15);
      if (isNew) {
        setItems(data);
      } else {
        setItems(prev => [...prev, ...data]);
      }
      setHasMore(data.length === 15);
      setPage(pageNum);
    } catch (e) {
      console.error('주변 조회 실패:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    requestLocationAndLoad();
  };

  const handleLoadMore = () => {
    if (!loading && hasMore && location) {
      loadNearby(location.lat, location.lng, radius, page + 1, false);
    }
  };

  const handleItemPress = (item: WellnessItem) => {
    router.push({
      pathname: '/detail',
      params: { contentId: item.contentId, title: item.title, contentTypeId: item.contentTypeId ?? '12' },
    });
  };

  if (locationError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>📍</Text>
          <Text style={styles.errorText}>{locationError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={requestLocationAndLoad}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>내 주변 웰니스</Text>
          {location && (
            <Text style={styles.headerSub}>📍 현재 위치 기준</Text>
          )}
        </View>
      </View>

      <View style={styles.radiusRow}>
        {RADIUS_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.radiusChip, radius === opt.value && styles.radiusChipSelected]}
            onPress={() => setRadius(opt.value)}
          >
            <Text style={[styles.radiusChipText, radius === opt.value && styles.radiusChipTextSelected]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.contentId}
        renderItem={({ item }) => (
          <WellnessCard
            item={item}
            onPress={() => handleItemPress(item)}
            showDistance
          />
        )}
        ListHeaderComponent={
          items.length > 0 ? (
            <Text style={styles.resultCount}>{items.length}개의 여행지</Text>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🌿</Text>
              <Text style={styles.emptyText}>주변에 웰니스 여행지가 없어요</Text>
              <Text style={styles.emptySubText}>반경을 넓혀보세요</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading ? <ActivityIndicator style={{ margin: 20 }} color={Colors.primary} /> : null
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  radiusRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  radiusChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  radiusChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  radiusChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  radiusChipTextSelected: {
    color: '#fff',
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 20,
    flexGrow: 1,
  },
  resultCount: {
    fontSize: 13,
    color: Colors.textMuted,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorEmoji: {
    fontSize: 52,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
