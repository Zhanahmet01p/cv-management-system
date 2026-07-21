export const COUNTRIES = [
  'Kazakhstan',
  'Russia',
  'Belarus',
  'Uzbekistan',
  'Kyrgyzstan',
  'Armenia',
  'Georgia',
  'Azerbaijan',
  'Moldova',
  'Tajikistan',
  'Turkmenistan',
  'Germany',
  'USA',
  'United Kingdom',
  'Turkey',
  'UAE',
  'Serbia',
  'Cyprus',
  'Poland',
  'Czech Republic',
  'Spain',
  'Italy',
  'France',
  'Netherlands',
  'Canada',
  'Australia'
];

export const getLocationParts = (locStr = '') => {
  if (!locStr) return { country: '', city: '' };
  const parts = locStr.split(',').map(s => s.trim());
  if (parts.length > 1) {
    return { country: parts[0], city: parts.slice(1).join(', ') };
  }
  if (COUNTRIES.includes(parts[0])) {
    return { country: parts[0], city: '' };
  }
  return { country: '', city: parts[0] };
};
