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
