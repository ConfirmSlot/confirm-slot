// Palette aligned with the marketing/home theme: violet #511F9F + dimmed lavender #8B6BC7.
export const C = {
  PRIMARY:        '#511F9F',
  PRIMARY_LIGHT:  '#F1EBFA',
  SECONDARY:      '#8B6BC7',
  NAV_BG:         '#3F1780',
  SUCCESS:        '#10B981',
  SUCCESS_BG:     '#ECFDF5',
  WARNING:        '#F59E0B',
  ERROR:          '#EF4444',
  ERROR_BG:       '#FEF2F2',
  WHITE:          '#FFFFFF',
  BG:             '#FAF8FD',
  CARD:           '#FFFFFF',
  TEXT1:          '#2A1052',
  TEXT2:          '#511F9F',
  TEXT3:          '#665C7A',
  BORDER:         '#E5DFEE',
  SHADOW:         'rgba(81,31,159,0.12)',
};

const AZURE_BASE = 'https://onezyfiles.blob.core.windows.net/onezy';

export const IMG = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${AZURE_BASE}/${path}`;
};
