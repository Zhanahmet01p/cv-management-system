export const COUNTRIES = [
  'Казахстан',
  'Россия',
  'Беларусь',
  'Узбекистан',
  'Кыргызстан',
  'Армения',
  'Грузия',
  'Азербайджан',
  'Молдова',
  'Таджикистан',
  'Туркменистан',
  'Германия',
  'США',
  'Великобритания',
  'Турция',
  'ОАЭ',
  'Сербия',
  'Кипр',
  'Польша',
  'Чехия',
  'Испания',
  'Италия',
  'Франция',
  'Нидерланды',
  'Канада',
  'Австралия'
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
