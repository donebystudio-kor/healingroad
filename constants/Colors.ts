export const Colors = {
  primary: '#2D7D6F',      // 메인 초록 (자연/치유 느낌)
  primaryLight: '#4AA896',
  primaryDark: '#1E5C52',
  background: '#F7FAF9',
  surface: '#FFFFFF',
  textPrimary: '#1A2E2A',
  textSecondary: '#5A7A74',
  textMuted: '#9BB8B3',
  border: '#E0EDEA',
  error: '#D9534F',
  tag: '#E8F5F2',
  tagText: '#2D7D6F',
};

export const MoodColors: Record<string, { bg: string; icon: string; label: string }> = {
  stress:  { bg: '#FFF0F0', icon: '#E57373', label: '스트레스' },
  tired:   { bg: '#FFF8E8', icon: '#FFB347', label: '피로' },
  sad:     { bg: '#EEF0FF', icon: '#7986CB', label: '우울' },
  burnout: { bg: '#F3E5F5', icon: '#AB47BC', label: '번아웃' },
  anxious: { bg: '#E8F5E9', icon: '#66BB6A', label: '불안' },
  healing: { bg: '#E0F7FA', icon: '#26C6DA', label: '힐링' },
};
