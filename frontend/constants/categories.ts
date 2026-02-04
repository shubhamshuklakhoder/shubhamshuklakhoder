export const CATEGORIES = [
  { value: 'Food', label: 'Food', icon: '🍔', color: '#FF6B6B' },
  { value: 'Transport', label: 'Transport', icon: '🚗', color: '#4ECDC4' },
  { value: 'Shopping', label: 'Shopping', icon: '🛍️', color: '#FFE66D' },
  { value: 'Bills', label: 'Bills', icon: '💡', color: '#95E1D3' },
  { value: 'Entertainment', label: 'Entertainment', icon: '🎬', color: '#F38181' },
  { value: 'Health', label: 'Health', icon: '💊', color: '#AA96DA' },
  { value: 'Other', label: 'Other', icon: '📝', color: '#FCBAD3' },
] as const;

export type CategoryValue = typeof CATEGORIES[number]['value'];
