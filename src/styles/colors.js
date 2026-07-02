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

export const IMG = (path) => {
  if (!path) return null;
  // Normalize old confirmslot virtual-hosted URLs → path-style
  if (path.includes('confirmslot.com.s3.amazonaws.com/')) {
    const key = path.split('confirmslot.com.s3.amazonaws.com/')[1];
    return `https://s3.ap-south-1.amazonaws.com/onezy.net/${key}`;
  }
  // Rewrite old bucket path-style URLs to new bucket
  if (path.includes('s3.ap-south-1.amazonaws.com/confirmslot.com/')) {
    return path.replace('s3.ap-south-1.amazonaws.com/confirmslot.com/', 's3.ap-south-1.amazonaws.com/onezy.net/');
  }
  // Normalize new bucket virtual-hosted URLs → path-style (dots in name break virtual-hosting)
  if (/onezy\.net\.s3[^/]*\.amazonaws\.com\//.test(path)) {
    const key = path.split(/onezy\.net\.s3[^/]*\.amazonaws\.com\//)[1];
    return `https://s3.ap-south-1.amazonaws.com/onezy.net/${key}`;
  }
  if (path.startsWith('http')) return path;
  return `https://s3.ap-south-1.amazonaws.com/onezy.net/${path}`;
};
