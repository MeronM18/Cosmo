import { ZodiacSigns } from './constants';

export interface ZodiacData {
  sign: string;
  symbol: string;
  element: string;
  quality: string;
  rulingPlanet: string;
  dates: string;
}

export interface ZodiacSignInfo {
  name: string;
  symbol: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  quality: 'Cardinal' | 'Fixed' | 'Mutable';
  rulingPlanet: string;
  dateRange: string;
  traits: string[];
  compatibleSigns: string[];
}

// Complete zodiac sign data
export const ZODIAC_SIGNS: Record<string, ZodiacSignInfo> = {
  Aries: {
    name: 'Aries',
    symbol: '♈',
    element: 'Fire',
    quality: 'Cardinal',
    rulingPlanet: 'Mars',
    dateRange: 'March 21 - April 19',
    traits: ['Bold', 'Adventurous', 'Independent', 'Energetic'],
    compatibleSigns: ['Leo', 'Sagittarius', 'Gemini', 'Aquarius']
  },
  Taurus: {
    name: 'Taurus',
    symbol: '♉',
    element: 'Earth',
    quality: 'Fixed',
    rulingPlanet: 'Venus',
    dateRange: 'April 20 - May 20',
    traits: ['Reliable', 'Patient', 'Practical', 'Devoted'],
    compatibleSigns: ['Virgo', 'Capricorn', 'Cancer', 'Pisces']
  },
  Gemini: {
    name: 'Gemini',
    symbol: '♊',
    element: 'Air',
    quality: 'Mutable',
    rulingPlanet: 'Mercury',
    dateRange: 'May 21 - June 20',
    traits: ['Versatile', 'Expressive', 'Curious', 'Kind'],
    compatibleSigns: ['Libra', 'Aquarius', 'Aries', 'Leo']
  },
  Cancer: {
    name: 'Cancer',
    symbol: '♋',
    element: 'Water',
    quality: 'Cardinal',
    rulingPlanet: 'Moon',
    dateRange: 'June 21 - July 22',
    traits: ['Intuitive', 'Sentimental', 'Compassionate', 'Protective'],
    compatibleSigns: ['Scorpio', 'Pisces', 'Taurus', 'Virgo']
  },
  Leo: {
    name: 'Leo',
    symbol: '♌',
    element: 'Fire',
    quality: 'Fixed',
    rulingPlanet: 'Sun',
    dateRange: 'July 23 - August 22',
    traits: ['Dramatic', 'Creative', 'Self-confident', 'Dominant'],
    compatibleSigns: ['Aries', 'Sagittarius', 'Gemini', 'Libra']
  },
  Virgo: {
    name: 'Virgo',
    symbol: '♍',
    element: 'Earth',
    quality: 'Mutable',
    rulingPlanet: 'Mercury',
    dateRange: 'August 23 - September 22',
    traits: ['Loyal', 'Analytical', 'Kind', 'Hardworking'],
    compatibleSigns: ['Taurus', 'Capricorn', 'Cancer', 'Scorpio']
  },
  Libra: {
    name: 'Libra',
    symbol: '♎',
    element: 'Air',
    quality: 'Cardinal',
    rulingPlanet: 'Venus',
    dateRange: 'September 23 - October 22',
    traits: ['Diplomatic', 'Graceful', 'Fair-minded', 'Social'],
    compatibleSigns: ['Gemini', 'Aquarius', 'Leo', 'Sagittarius']
  },
  Scorpio: {
    name: 'Scorpio',
    symbol: '♏',
    element: 'Water',
    quality: 'Fixed',
    rulingPlanet: 'Pluto',
    dateRange: 'October 23 - November 21',
    traits: ['Resourceful', 'Brave', 'Passionate', 'Stubborn'],
    compatibleSigns: ['Cancer', 'Pisces', 'Virgo', 'Capricorn']
  },
  Sagittarius: {
    name: 'Sagittarius',
    symbol: '♐',
    element: 'Fire',
    quality: 'Mutable',
    rulingPlanet: 'Jupiter',
    dateRange: 'November 22 - December 21',
    traits: ['Generous', 'Idealistic', 'Great sense of humor'],
    compatibleSigns: ['Aries', 'Leo', 'Libra', 'Aquarius']
  },
  Capricorn: {
    name: 'Capricorn',
    symbol: '♑',
    element: 'Earth',
    quality: 'Cardinal',
    rulingPlanet: 'Saturn',
    dateRange: 'December 22 - January 19',
    traits: ['Responsible', 'Disciplined', 'Self-control', 'Good managers'],
    compatibleSigns: ['Taurus', 'Virgo', 'Scorpio', 'Pisces']
  },
  Aquarius: {
    name: 'Aquarius',
    symbol: '♒',
    element: 'Air',
    quality: 'Fixed',
    rulingPlanet: 'Uranus',
    dateRange: 'January 20 - February 18',
    traits: ['Progressive', 'Independent', 'Humanitarian', 'Inventive'],
    compatibleSigns: ['Gemini', 'Libra', 'Aries', 'Sagittarius']
  },
  Pisces: {
    name: 'Pisces',
    symbol: '♓',
    element: 'Water',
    quality: 'Mutable',
    rulingPlanet: 'Neptune',
    dateRange: 'February 19 - March 20',
    traits: ['Compassionate', 'Artistic', 'Intuitive', 'Gentle'],
    compatibleSigns: ['Cancer', 'Scorpio', 'Taurus', 'Capricorn']
  }
};

/**
 * Calculate zodiac sign from birth date
 */
export const calculateZodiacSign = (birthDate: string | Date): ZodiacData => {
  const date = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  const day = date.getDate();
  
  let signName: string;
  
  // Zodiac date ranges
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    signName = 'Aries';
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    signName = 'Taurus';
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    signName = 'Gemini';
  } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    signName = 'Cancer';
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    signName = 'Leo';
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    signName = 'Virgo';
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    signName = 'Libra';
  } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    signName = 'Scorpio';
  } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    signName = 'Sagittarius';
  } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    signName = 'Capricorn';
  } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    signName = 'Aquarius';
  } else {
    signName = 'Pisces';
  }
  
  const signInfo = ZODIAC_SIGNS[signName];
  return {
    sign: signInfo.name,
    symbol: signInfo.symbol,
    element: signInfo.element,
    quality: signInfo.quality,
    rulingPlanet: signInfo.rulingPlanet,
    dates: signInfo.dateRange
  };
};

/**
 * Get zodiac sign information by name
 */
export const getZodiacSignInfo = (signName: string): ZodiacSignInfo | null => {
  return ZODIAC_SIGNS[signName] || null;
};

/**
 * Get compatible signs for a given zodiac sign
 */
export const getCompatibleSigns = (signName: string): string[] => {
  const signInfo = ZODIAC_SIGNS[signName];
  return signInfo ? signInfo.compatibleSigns : [];
};

/**
 * Check if two zodiac signs are compatible
 */
export const areSignsCompatible = (sign1: string, sign2: string): boolean => {
  const compatibleSigns = getCompatibleSigns(sign1);
  return compatibleSigns.includes(sign2);
};

/**
 * Get zodiac sign traits
 */
export const getZodiacTraits = (signName: string): string[] => {
  const signInfo = ZODIAC_SIGNS[signName];
  return signInfo ? signInfo.traits : [];
};

/**
 * Get zodiac sign element
 */
export const getZodiacElement = (signName: string): string => {
  const signInfo = ZODIAC_SIGNS[signName];
  return signInfo ? signInfo.element : 'Unknown';
};

/**
 * Get zodiac sign quality (Cardinal, Fixed, Mutable)
 */
export const getZodiacQuality = (signName: string): string => {
  const signInfo = ZODIAC_SIGNS[signName];
  return signInfo ? signInfo.quality : 'Unknown';
};

/**
 * Get ruling planet for a zodiac sign
 */
export const getRulingPlanet = (signName: string): string => {
  const signInfo = ZODIAC_SIGNS[signName];
  return signInfo ? signInfo.rulingPlanet : 'Unknown';
};

/**
 * Format zodiac sign display text
 */
export const formatZodiacDisplay = (signName: string): string => {
  const signInfo = ZODIAC_SIGNS[signName];
  if (!signInfo) return signName;
  return `${signInfo.symbol} ${signInfo.name}`;
};

/**
 * Get zodiac sign by element
 */
export const getSignsByElement = (element: 'Fire' | 'Earth' | 'Air' | 'Water'): string[] => {
  return Object.values(ZODIAC_SIGNS)
    .filter(sign => sign.element === element)
    .map(sign => sign.name);
};

/**
 * Get zodiac sign by quality
 */
export const getSignsByQuality = (quality: 'Cardinal' | 'Fixed' | 'Mutable'): string[] => {
  return Object.values(ZODIAC_SIGNS)
    .filter(sign => sign.quality === quality)
    .map(sign => sign.name);
};
