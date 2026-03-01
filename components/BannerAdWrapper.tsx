import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const UNIT_ID = __DEV__
  ? TestIds.BANNER
  : 'ca-app-pub-9859685900931020/4856094324';

export default function BannerAdWrapper() {
  return <BannerAd unitId={UNIT_ID} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />;
}
