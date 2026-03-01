import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { searchByKeyword, getAreaBasedList, type WellnessItem } from '../../services/api';
import WellnessCard from '../../components/WellnessCard';
import BannerAdWrapper from '../../components/BannerAdWrapper';

const AREA_CODES = [
  { code: '', name: '전체' },
  { code: '11', name: '서울' },
  { code: '28', name: '인천' },
  { code: '30', name: '대전' },
  { code: '27', name: '대구' },
  { code: '29', name: '광주' },
  { code: '26', name: '부산' },
  { code: '31', name: '울산' },
  { code: '36', name: '세종' },
  { code: '41', name: '경기' },
  { code: '51', name: '강원' },
  { code: '43', name: '충북' },
  { code: '44', name: '충남' },
  { code: '47', name: '경북' },
  { code: '48', name: '경남' },
  { code: '52', name: '전북' },
  { code: '46', name: '전남' },
  { code: '50', name: '제주' },
];

export default function ExploreScreen() {
  const [keyword, setKeyword] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [items, setItems] = useState<WellnessItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (kw: string, area: string, pageNum: number, isNew: boolean) => {
    setLoading(true);
    try {
      let data: WellnessItem[];
      if (kw.trim()) {
        data = await searchByKeyword(kw.trim(), pageNum, 15);
      } else {
        data = await getAreaBasedList(area || undefined, undefined, undefined, pageNum, 15);
      }
      if (isNew) {
        setItems(data);
      } else {
        setItems(prev => [...prev, ...data]);
      }
      setHasMore(data.length === 15);
      setPage(pageNum);
      setSearched(true);
    } catch (e) {
      console.error('검색 실패:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = () => {
    doSearch(keyword, selectedArea, 1, true);
  };

  const handleAreaSelect = (code: string) => {
    setSelectedArea(code);
    setKeyword('');
    doSearch('', code, 1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      doSearch(keyword, selectedArea, page + 1, false);
    }
  };

  const handleItemPress = (item: WellnessItem) => {
    router.push({
      pathname: '/detail',
      params: { contentId: item.contentId, title: item.title, contentTypeId: item.contentTypeId ?? '12' },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 검색바 */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="지역, 이름으로 검색"
          placeholderTextColor={Colors.textMuted}
          value={keyword}
          onChangeText={setKeyword}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {keyword.length > 0 && (
          <TouchableOpacity onPress={() => setKeyword('')}>
            <Text style={styles.clearButton}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 지역 필터 */}
      <View style={styles.areaScroll}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.areaList}
        >
          {AREA_CODES.map((area) => (
            <TouchableOpacity
              key={area.code}
              style={[
                styles.areaChip,
                selectedArea === area.code && styles.areaChipSelected,
              ]}
              onPress={() => handleAreaSelect(area.code)}
            >
              <Text
                style={[
                  styles.areaChipText,
                  selectedArea === area.code && styles.areaChipTextSelected,
                ]}
              >
                {area.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 결과 목록 */}
      <FlatList
        style={{ flex: 1 }}
        data={items}
        keyExtractor={(item) => item.contentId}
        renderItem={({ item }) => (
          <WellnessCard
            item={item}
            onPress={() => handleItemPress(item)}
          />
        )}
        ListHeaderComponent={
          searched ? (
            <Text style={styles.resultCount}>
              {items.length}개의 여행지
            </Text>
          ) : null
        }
        ListEmptyComponent={
          !loading && searched ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>검색 결과가 없어요</Text>
              <Text style={styles.emptySubText}>다른 키워드나 지역을 선택해보세요</Text>
            </View>
          ) : !searched ? (
            <View style={styles.hintContainer}>
              <Text style={styles.hintEmoji}>🔍</Text>
              <Text style={styles.hintText}>키워드나 지역을 선택해서{'\n'}웰니스 여행지를 찾아보세요</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading ? <ActivityIndicator style={{ margin: 20 }} color={Colors.primary} /> : null
        }
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  clearButton: {
    fontSize: 14,
    color: Colors.textMuted,
    paddingHorizontal: 4,
  },
  areaScroll: {
    height: 36,
    flexShrink: 0,
    overflow: 'hidden',
  },
  areaList: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  areaChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 6,
  },
  areaChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  areaChipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  areaChipTextSelected: {
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
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptySubText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  hintContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  hintEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  hintText: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
