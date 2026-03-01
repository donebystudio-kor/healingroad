import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors } from '../constants/Colors';
import {
  getDetailCommon,
  getDetailIntro,
  getDetailImages,
  type WellnessDetailCommon,
  type WellnessDetailIntro,
  type WellnessImage,
} from '../services/api';
import { addRecentlyViewed } from '../services/recentlyViewed';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DetailScreen() {
  const { contentId, title, contentTypeId } = useLocalSearchParams<{ contentId: string; title: string; contentTypeId: string }>();
  const [common, setCommon] = useState<WellnessDetailCommon | null>(null);
  const [intro, setIntro] = useState<WellnessDetailIntro | null>(null);
  const [images, setImages] = useState<WellnessImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contentId) return;
    loadDetail();
  }, [contentId]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const [commonData, introData, imageData] = await Promise.all([
        getDetailCommon(contentId),
        getDetailIntro(contentId, contentTypeId ?? '12'),
        getDetailImages(contentId),
      ]);
      setCommon(commonData);
      setIntro(introData);
      setImages(imageData);

      addRecentlyViewed({
        contentId,
        contentTypeId: contentTypeId ?? '12',
        title: commonData?.title ?? title ?? '',
        baseAddr: commonData?.baseAddr ?? '',
        orgImage: commonData?.orgImage,
        viewedAt: Date.now(),
      });
    } catch (e) {
      console.error('상세 로드 실패:', e);
    } finally {
      setLoading(false);
    }
  };

  const openMap = (type: 'kakao' | 'naver') => {
    if (!common?.mapX || !common?.mapY) return;
    const lat = common.mapY;
    const lng = common.mapX;
    const name = encodeURIComponent(common.title ?? title ?? '');

    if (type === 'kakao') {
      Linking.openURL(`kakaomap://look?p=${lat},${lng}`).catch(() =>
        Linking.openURL(`https://map.kakao.com/link/map/${name},${lat},${lng}`)
      );
    } else {
      Linking.openURL(`nmap://place?lat=${lat}&lng=${lng}&name=${name}&appname=com.donebystudio.healingroad`).catch(() =>
        Linking.openURL(`https://map.naver.com/index.nhn?lng=${lng}&lat=${lat}&title=${name}`)
      );
    }
  };

  const openPhone = (tel: string) => {
    const cleaned = tel.replace(/\s/g, '');
    Linking.openURL(`tel:${cleaned}`);
  };

  const openHomepage = (url: string) => {
    Linking.openURL(url.startsWith('http') ? url : `https://${url}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const displayTitle = common?.title ?? title ?? '';
  const mainImages = images.length > 0
    ? images.map(img => img.orgImage)
    : common?.orgImage ? [common.orgImage] : [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {mainImages.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          >
            {mainImages.map((uri, i) => (
              <Image key={i} source={{ uri }} style={styles.mainImage} resizeMode="cover" />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={{ fontSize: 64 }}>🌿</Text>
          </View>
        )}

        <View style={styles.body}>
          <Text style={styles.title}>{displayTitle}</Text>

          {!!common?.baseAddr && (
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📍</Text>
              <Text style={styles.infoText}>
                {common.baseAddr}{common.detailAddr ? ` ${common.detailAddr}` : ''}
              </Text>
            </View>
          )}

          {!!common?.tel && (
            <TouchableOpacity style={styles.infoRow} onPress={() => openPhone(common.tel!)}>
              <Text style={styles.infoIcon}>📞</Text>
              <Text style={[styles.infoText, styles.link]}>{common.tel}</Text>
            </TouchableOpacity>
          )}

          {!!common?.homepage && (
            <TouchableOpacity
              style={styles.infoRow}
              onPress={() => openHomepage(common.homepage!.replace(/<[^>]*>/g, ''))}
            >
              <Text style={styles.infoIcon}>🌐</Text>
              <Text style={[styles.infoText, styles.link]} numberOfLines={1}>
                홈페이지 바로가기
              </Text>
            </TouchableOpacity>
          )}

          {!!intro && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>이용 정보</Text>
              {!!intro.usetime && <InfoItem label="운영시간" value={intro.usetime} />}
              {!!intro.restdate && <InfoItem label="휴무일" value={intro.restdate} />}
              {!!intro.infocenter && <InfoItem label="문의처" value={intro.infocenter} />}
              {!!intro.parking && <InfoItem label="주차" value={intro.parking} />}
              {!!intro.chkpet && <InfoItem label="반려동물" value={intro.chkpet} />}
            </View>
          )}

          {!!common?.overview && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>소개</Text>
              <Text style={styles.overview}>
                {common.overview.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()}
              </Text>
            </View>
          )}

          {common?.mapX && common?.mapY && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>길찾기</Text>
              <View style={styles.mapRow}>
                <TouchableOpacity
                  style={[styles.mapButton, { backgroundColor: '#FFDE00' }]}
                  onPress={() => openMap('kakao')}
                >
                  <Text style={styles.mapButtonText}>카카오맵</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.mapButton, { backgroundColor: '#03C75A' }]}
                  onPress={() => openMap('naver')}
                >
                  <Text style={[styles.mapButtonText, { color: '#fff' }]}>네이버맵</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  const cleaned = value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  if (!cleaned) return null;
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{cleaned}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  mainImage: {
    width: SCREEN_WIDTH,
    height: 260,
  },
  imagePlaceholder: {
    width: SCREEN_WIDTH,
    height: 200,
    backgroundColor: Colors.tag,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 30,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 6,
  },
  infoIcon: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  link: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  section: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  infoLabel: {
    width: 64,
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  overview: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  mapRow: {
    flexDirection: 'row',
    gap: 12,
  },
  mapButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  mapButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
});
