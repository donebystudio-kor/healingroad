import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@healingroad_recently_viewed';
const MAX_ITEMS = 20;

export interface RecentItem {
  contentId: string;
  contentTypeId?: string;
  title: string;
  baseAddr: string;
  orgImage?: string;
  viewedAt: number;
}

export async function addRecentlyViewed(item: RecentItem): Promise<void> {
  try {
    const existing = await getRecentlyViewed();
    const filtered = existing.filter(r => r.contentId !== item.contentId);
    const updated = [item, ...filtered].slice(0, MAX_ITEMS);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('최근 본 여행지 저장 실패:', e);
  }
}

export async function getRecentlyViewed(): Promise<RecentItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('최근 본 여행지 불러오기 실패:', e);
    return [];
  }
}
