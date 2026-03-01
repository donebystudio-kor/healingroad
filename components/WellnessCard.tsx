import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors } from '../constants/Colors';
import type { WellnessItem } from '../services/api';

interface Props {
  item: WellnessItem;
  onPress: () => void;
  showDistance?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: (item: WellnessItem) => void;
}

export default function WellnessCard({ item, onPress, showDistance }: Props) {
  const hasImage = !!item.orgImage;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {hasImage ? (
        <Image
          source={{ uri: item.orgImage }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>🌿</Text>
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        {item.baseAddr ? (
          <Text style={styles.address} numberOfLines={1}>
            📍 {item.baseAddr}
          </Text>
        ) : null}
        {showDistance && item.dist !== undefined ? (
          <Text style={styles.distance}>
            {item.dist >= 1000
              ? `${(item.dist / 1000).toFixed(1)}km`
              : `${Math.round(item.dist)}m`}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 180,
  },
  imagePlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: Colors.tag,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 48,
  },
  content: {
    padding: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  address: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  distance: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
});
