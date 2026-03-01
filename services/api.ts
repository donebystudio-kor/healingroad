const SERVICE_KEY = '726c80985f6abaead5820d0512cb8ba9e489be0d9d8dbff24001658139a5b767';
const BASE_URL = 'https://apis.data.go.kr/B551011/WellnessTursmService';

// 실제 API 응답 필드명 기준
export interface WellnessItem {
  contentId: string;
  contentTypeId?: string;
  title: string;
  baseAddr: string;
  detailAddr?: string;
  lDongRegnCd?: string;
  lDongSignguCd?: string;
  mapX?: string;
  mapY?: string;
  orgImage?: string;
  thumbImage?: string;
  tel?: string;
  mdfcnDt?: string;
  wellnessThemaCd?: string;
  dist?: number; // 위치기반 조회 시 거리(m)
}

export interface WellnessDetailCommon {
  contentId: string;
  title: string;
  baseAddr?: string;
  detailAddr?: string;
  tel?: string;
  telname?: string;
  homepage?: string;
  overview?: string;
  orgImage?: string;
  thumbImage?: string;
  mapX?: string;
  mapY?: string;
}

export interface WellnessDetailIntro {
  contentId: string;
  infocenter?: string;
  restdate?: string;
  usetime?: string;
  parking?: string;
  chkpet?: string;
  chkbabycarriage?: string;
}

export interface WellnessImage {
  contentId: string;
  imgname?: string;
  orgImage: string;
  thumbImage?: string;
  serialnum?: string;
}

interface ApiResponse<T> {
  response: {
    header: { resultCode: string; resultMsg: string };
    body: {
      items: { item: T[] } | '';
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

async function fetchApi<T>(endpoint: string, params: Record<string, string | number>): Promise<T[]> {
  const query = new URLSearchParams({
    serviceKey: SERVICE_KEY,
    MobileOS: 'AND',
    MobileApp: '힐링로드',
    langDivCd: 'KO',
    _type: 'json',
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  });

  const url = `${BASE_URL}/${endpoint}?${query.toString()}`;

  let res: Response;
  try {
    res = await fetch(url);
  } catch (e) {
    throw new Error(`네트워크 오류: ${e instanceof Error ? e.message : String(e)}`);
  }

  if (!res.ok) throw new Error(`API 오류: ${res.status}`);

  let json: any;
  try {
    json = await res.json();
  } catch (e) {
    throw new Error('JSON 파싱 실패');
  }

  // 에러 응답 구조: { responseTime, resultCode, resultMsg }
  if (json?.resultCode && json.resultCode !== '0000') {
    throw new Error(`API 오류 (${json.resultCode}): ${json.resultMsg}`);
  }

  // 정상 응답 구조: { response: { header, body } }
  if (!json?.response?.header) {
    throw new Error(`API 응답 구조 오류: ${JSON.stringify(json).slice(0, 200)}`);
  }

  const { resultCode } = json.response.header;
  if (resultCode !== '0000') {
    throw new Error(`API 결과 오류 (${resultCode}): ${json.response.header.resultMsg}`);
  }

  const items = json.response.body.items;
  if (!items || items === '') return [];
  if (Array.isArray(items.item)) return items.item;
  return [items.item as unknown as T];
}

/** 키워드 검색 */
export async function searchByKeyword(keyword: string, page = 1, numOfRows = 20): Promise<WellnessItem[]> {
  return fetchApi<WellnessItem>('searchKeyword', {
    keyword,
    pageNo: page,
    numOfRows,
    arrange: 'A',
  });
}

/** 위치기반 주변 웰니스 조회 */
export async function getNearbyWellness(
  lat: number,
  lng: number,
  radius = 20000,
  page = 1,
  numOfRows = 20
): Promise<WellnessItem[]> {
  return fetchApi<WellnessItem>('locationBasedList', {
    mapX: lng,
    mapY: lat,
    radius,
    pageNo: page,
    numOfRows,
    arrange: 'E',
  });
}

/** 지역기반 목록 조회 */
export async function getAreaBasedList(
  areaCode?: string,
  sigunguCode?: string,
  themaCode?: string,
  page = 1,
  numOfRows = 20
): Promise<WellnessItem[]> {
  const params: Record<string, string | number> = {
    pageNo: page,
    numOfRows,
    arrange: 'A',
  };
  if (areaCode) params.lDongRegnCd = areaCode;
  if (sigunguCode) params.lDongSignguCd = sigunguCode;
  if (themaCode) params.wellnessThemaCd = themaCode;
  return fetchApi<WellnessItem>('areaBasedList', params);
}

/** 공통 상세 정보 */
export async function getDetailCommon(contentId: string): Promise<WellnessDetailCommon | null> {
  const items = await fetchApi<WellnessDetailCommon>('detailCommon', { contentId });
  return items[0] ?? null;
}

/** 소개 상세 정보 */
export async function getDetailIntro(contentId: string, contentTypeId: string): Promise<WellnessDetailIntro | null> {
  const items = await fetchApi<WellnessDetailIntro>('detailIntro', { contentId, contentTypeId });
  return items[0] ?? null;
}

/** 이미지 목록 */
export async function getDetailImages(contentId: string): Promise<WellnessImage[]> {
  return fetchApi<WellnessImage>('detailImage', { contentId });
}
