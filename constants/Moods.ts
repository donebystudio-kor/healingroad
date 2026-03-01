export type MoodKey = 'stress' | 'tired' | 'sad' | 'burnout' | 'anxious' | 'healing';

export interface Mood {
  key: MoodKey;
  emoji: string;
  label: string;
  description: string;
  themaCode: string;
  bgColor: string;
  iconColor: string;
}

export const Moods: Mood[] = [
  {
    key: 'stress',
    emoji: '😤',
    label: '스트레스',
    description: '머리를 비우고 싶어요',
    themaCode: 'EX050600', // 치유의 숲 (25개)
    bgColor: '#FFF0F0',
    iconColor: '#E57373',
  },
  {
    key: 'tired',
    emoji: '😴',
    label: '피로',
    description: '몸을 쉬게 하고 싶어요',
    themaCode: 'EX050100', // 온천/스파 (99개)
    bgColor: '#FFF8E8',
    iconColor: '#FFB347',
  },
  {
    key: 'sad',
    emoji: '😔',
    label: '우울',
    description: '기운을 되찾고 싶어요',
    themaCode: 'EX050500', // 고급 스파 (14개)
    bgColor: '#EEF0FF',
    iconColor: '#7986CB',
  },
  {
    key: 'burnout',
    emoji: '🔥',
    label: '번아웃',
    description: '완전히 충전하고 싶어요',
    themaCode: 'EX050400', // 힐링센터/명상 (7개)
    bgColor: '#F3E5F5',
    iconColor: '#AB47BC',
  },
  {
    key: 'anxious',
    emoji: '😰',
    label: '불안',
    description: '마음을 안정시키고 싶어요',
    themaCode: 'EX050300', // 한방 (8개)
    bgColor: '#E8F5E9',
    iconColor: '#66BB6A',
  },
  {
    key: 'healing',
    emoji: '🌿',
    label: '그냥 힐링',
    description: '기분 전환하고 싶어요',
    themaCode: 'EX050200', // 워터파크/스파 (20개)
    bgColor: '#E0F7FA',
    iconColor: '#26C6DA',
  },
];
