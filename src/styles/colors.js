export const C = {
  PRIMARY:        '#6D28D9',
  PRIMARY_LIGHT:  '#EDE9FE',
  SECONDARY:      '#A78BFA',
  NAV_BG:         '#4C1D95',
  SUCCESS:        '#10B981',
  SUCCESS_BG:     '#ECFDF5',
  WARNING:        '#F59E0B',
  ERROR:          '#EF4444',
  ERROR_BG:       '#FEF2F2',
  WHITE:          '#FFFFFF',
  BG:             '#F5F3FF',
  CARD:           '#FFFFFF',
  TEXT1:          '#1E1B4B',
  TEXT2:          '#4C1D95',
  TEXT3:          '#7C3AED',
  BORDER:         '#DDD6FE',
  SHADOW:         'rgba(109,40,217,0.12)',
};

export const IMG = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `https://s3.ap-south-1.amazonaws.com/confirmslot.com/${path}`;
};
