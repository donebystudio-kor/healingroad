import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { getFavorites, toggleFavorite, type FavoriteItem } from '../../services/favorites';
import WellnessCard from '../../components/WellnessCard';
import BannerAdWrapper from '../../components/BannerAdWrapper';
import type { WellnessItem } from '../../services/api';

export default function FavoritesScreen() {
  const [items, setItems] = useState<FavoriteItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      getFavorites().then(setItems);
    }, [])
  );

  const handlePress = (item: FavoriteItem) => {
    router.push({
      pathname: '/detail',
      params: { contentId: item.contentId, title: item.title, contentTypeId: item.contentTypeId ?? '12' },
    });
  };

  const handleFavoriteToggle = async (item: WellnessItem) => {
    await toggleFavorite({
      contentId: item.contentId,
      contentTypeId: item.contentTypeId,
      title: item.title,
      baseAddr: item.baseAddr,
      orgImage: item.orgImage,
      savedAt: Date.now(),
    });
    getFavorites().then(setItems);
  };

  // FavoriteItem → WellnessItem 변환
  const toWellnessItem = (item: FavoriteItem): WellnessItem => ({
    contentId: item.contentId,
    contentTypeId: item.contentTypeId,
    title: item.title,
    baseAddr: item.baseAddr,
    orgImage: item.orgImage,
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>즐겨찾기</Text>
        {items.length > 0 && (
          <Text style={styles.headerCount}>{items.length}개</Text>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.contentId}
        renderItem={({ item }) => (
          <WellnessCard
            item={toWellnessItem(item)}
            onPress={() => handlePress(item)}
            isFavorite
            onFavoriteToggle={handleFavoriteToggle}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🤍</Text>
            <Text style={styles.emptyText}>저장한 여행지가 없어요</Text>
            <Text style={styles.emptySubText}>마음에 드는 여행지의 하트를 눌러보세요</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerCount: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 20,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 52,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  emptySubText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
