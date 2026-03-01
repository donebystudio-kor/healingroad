import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WellnessItem } from './api';

const STORAGE_KEY = '@healingroad_favorites';

export interface FavoriteItem {
  contentId: string;
  contentTypeId?: string;
  title: string;
  baseAddr: string;
  orgImage?: string;
  savedAt: number;
}

export async function getFavorites(): Promise<FavoriteItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function getFavoriteIds(): Promise<Set<string>> {
  const list = await getFavorites();
  return new Set(list.map(f => f.contentId));
}

export async function toggleFavorite(item: FavoriteItem): Promise<boolean> {
  try {
    const list = await getFavorites();
    const idx = list.findIndex(f => f.contentId === item.contentId);
    if (idx >= 0) {
      list.splice(idx, 1);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return false; // 즐겨찾기 해제
    } else {
      const updated = [item, ...list];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return true; // 즐겨찾기 추가
    }
  } catch {
    return false;
  }
}
