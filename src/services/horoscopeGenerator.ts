import { HoroscopeData, User } from './horoscopesState';

// Astrological data and interpretations
interface PlanetaryPosition {
  planet: string;
  sign: string;
  house: number;
  degree: number;
  isRetrograde: boolean;
}

interface AstrologicalTransit {
  planet: string;
  aspect: string;
  targetPlanet: string;
  intensity: 'low' | 'medium' | 'high';
  influence: string;
}

// Zodiac sign characteristics
const ZODIAC_SIGN_DATA = {
  aries: {
    element: 'Fire',
    quality: 'Cardinal',
    ruler: 'Mars',
    traits: ['bold', 'energetic', 'pioneering', 'impulsive', 'competitive'],
    colors: ['red', 'crimson'],
    luckyNumbers: [1, 8, 17],
    compatibleSigns: ['leo', 'sagittarius', 'gemini', 'aquarius']
  },
  taurus: {
    element: 'Earth',
    quality: 'Fixed',
    ruler: 'Venus',
    traits: ['stable', 'practical', 'sensual', 'stubborn', 'loyal'],
    colors: ['green', 'pink'],
    luckyNumbers: [2, 6, 24],
    compatibleSigns: ['virgo', 'capricorn', 'cancer', 'pisces']
  },
  gemini: {
    element: 'Air',
    quality: 'Mutable',
    ruler: 'Mercury',
    traits: ['curious', 'communicative', 'versatile', 'restless', 'intellectual'],
    colors: ['yellow', 'silver'],
    luckyNumbers: [3, 12, 21],
    compatibleSigns: ['libra', 'aquarius', 'aries', 'leo']
  },
  cancer: {
    element: 'Water',
    quality: 'Cardinal',
    ruler: 'Moon',
    traits: ['nurturing', 'intuitive', 'protective', 'moody', 'emotional'],
    colors: ['white', 'silver'],
    luckyNumbers: [4, 13, 22],
    compatibleSigns: ['scorpio', 'pisces', 'taurus', 'virgo']
  },
  leo: {
    element: 'Fire',
    quality: 'Fixed',
    ruler: 'Sun',
    traits: ['dramatic', 'creative', 'generous', 'proud', 'confident'],
    colors: ['gold', 'orange'],
    luckyNumbers: [5, 14, 23],
    compatibleSigns: ['aries', 'sagittarius', 'gemini', 'libra']
  },
  virgo: {
    element: 'Earth',
    quality: 'Mutable',
    ruler: 'Mercury',
    traits: ['analytical', 'practical', 'modest', 'critical', 'helpful'],
    colors: ['brown', 'beige'],
    luckyNumbers: [6, 15, 24],
    compatibleSigns: ['taurus', 'capricorn', 'cancer', 'scorpio']
  },
  libra: {
    element: 'Air',
    quality: 'Cardinal',
    ruler: 'Venus',
    traits: ['diplomatic', 'charming', 'balanced', 'indecisive', 'social'],
    colors: ['pink', 'blue'],
    luckyNumbers: [7, 16, 25],
    compatibleSigns: ['gemini', 'aquarius', 'leo', 'sagittarius']
  },
  scorpio: {
    element: 'Water',
    quality: 'Fixed',
    ruler: 'Pluto',
    traits: ['intense', 'passionate', 'mysterious', 'jealous', 'transformative'],
    colors: ['black', 'red'],
    luckyNumbers: [8, 17, 26],
    compatibleSigns: ['cancer', 'pisces', 'virgo', 'capricorn']
  },
  sagittarius: {
    element: 'Fire',
    quality: 'Mutable',
    ruler: 'Jupiter',
    traits: ['adventurous', 'optimistic', 'philosophical', 'impatient', 'honest'],
    colors: ['purple', 'turquoise'],
    luckyNumbers: [9, 18, 27],
    compatibleSigns: ['aries', 'leo', 'libra', 'aquarius']
  },
  capricorn: {
    element: 'Earth',
    quality: 'Cardinal',
    ruler: 'Saturn',
    traits: ['ambitious', 'disciplined', 'practical', 'pessimistic', 'responsible'],
    colors: ['brown', 'black'],
    luckyNumbers: [10, 19, 28],
    compatibleSigns: ['taurus', 'virgo', 'scorpio', 'pisces']
  },
  aquarius: {
    element: 'Air',
    quality: 'Fixed',
    ruler: 'Uranus',
    traits: ['independent', 'innovative', 'humanitarian', 'rebellious', 'eccentric'],
    colors: ['blue', 'silver'],
    luckyNumbers: [11, 20, 29],
    compatibleSigns: ['gemini', 'libra', 'sagittarius', 'aries']
  },
  pisces: {
    element: 'Water',
    quality: 'Mutable',
    ruler: 'Neptune',
    traits: ['compassionate', 'artistic', 'intuitive', 'escapist', 'dreamy'],
    colors: ['sea green', 'lavender'],
    luckyNumbers: [12, 21, 30],
    compatibleSigns: ['cancer', 'scorpio', 'capricorn', 'taurus']
  }
};

// Current planetary transits (simplified)
const CURRENT_TRANSITS: AstrologicalTransit[] = [
  {
    planet: 'Mercury',
    aspect: 'conjunction',
    targetPlanet: 'Venus',
    intensity: 'medium',
    influence: 'Enhanced communication in relationships and creative expression'
  },
  {
    planet: 'Mars',
    aspect: 'trine',
    targetPlanet: 'Jupiter',
    intensity: 'high',
    influence: 'Increased motivation and opportunities for growth'
  },
  {
    planet: 'Saturn',
    aspect: 'square',
    targetPlanet: 'Neptune',
    intensity: 'low',
    influence: 'Need for balance between dreams and reality'
  }
];

// Life area themes
const LIFE_AREAS = {
  love: {
    themes: ['relationships', 'romance', 'partnership', 'intimacy', 'connection'],
    keywords: ['heart', 'soulmate', 'passion', 'commitment', 'harmony']
  },
  career: {
    themes: ['work', 'ambition', 'success', 'leadership', 'achievement'],
    keywords: ['opportunity', 'growth', 'recognition', 'progress', 'innovation']
  },
  health: {
    themes: ['wellness', 'vitality', 'balance', 'healing', 'energy'],
    keywords: ['strength', 'renewal', 'harmony', 'restoration', 'vitality']
  },
  growth: {
    themes: ['learning', 'wisdom', 'transformation', 'spirituality', 'self-discovery'],
    keywords: ['evolution', 'enlightenment', 'awareness', 'expansion', 'transcendence']
  }
};

export class HoroscopeGenerator {
  static generatePersonalizedHoroscope(
    user: User,
    period: 'today' | 'yesterday' | 'tomorrow' | 'weekly' | 'monthly'
  ): HoroscopeData {
    const signData = ZODIAC_SIGN_DATA[user.zodiacSign.toLowerCase() as keyof typeof ZODIAC_SIGN_DATA];
    const currentDate = new Date();
    const cosmicEnergy = this.calculateCosmicEnergy(user, currentDate);
    
    // Generate main reading
    const mainReading = this.generateMainReading(user, signData, period, cosmicEnergy);
    
    // Generate category-specific readings
    const categories = this.generateCategoryReadings(user, signData, period, cosmicEnergy);
    
    // Generate lucky elements
    const luckyElements = this.generateLuckyElements(signData, currentDate);
    
    // Get key planets
    const keyPlanets = this.getKeyPlanets(user, currentDate);
    
    // Generate mood and word of day
    const mood = this.generateMood(signData, cosmicEnergy);
    const wordOfDay = this.generateWordOfDay(signData, period);
    
    return {
      id: `horoscope_${user.zodiacSign}_${period}_${currentDate.toISOString().split('T')[0]}`,
      content: {
        main: mainReading,
        categories,
        cosmicEnergy,
        luckyElements,
        keyPlanets,
        mood,
        wordOfDay
      },
      metadata: {
        generatedAt: currentDate,
        period,
        expiresAt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
      }
    };
  }

  private static generateMainReading(
    user: User,
    signData: any,
    period: string,
    cosmicEnergy: number
  ): string {
    const currentDate = new Date();
    const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
    const month = currentDate.toLocaleDateString('en-US', { month: 'long' });
    
    const energyLevel = cosmicEnergy > 4 ? 'high' : cosmicEnergy > 2 ? 'moderate' : 'low';
    const dominantTrait = signData.traits[Math.floor(Math.random() * signData.traits.length)];
    
    const periodText = {
      today: 'Today',
      yesterday: 'Yesterday',
      tomorrow: 'Tomorrow',
      weekly: 'This week',
      monthly: 'This month'
    }[period] || 'Today';

    const readings = {
      high: [
        `${periodText} brings powerful cosmic energy that amplifies your natural ${dominantTrait} nature, ${user.zodiacSign}. The stars align to support your boldest ambitions and deepest desires. Trust your intuition as it's particularly sharp under these celestial influences.`,
        `The universe is conspiring in your favor, ${user.zodiacSign}. ${periodText}'s high cosmic energy creates opportunities for significant breakthroughs in areas where you've been working diligently. Your ${signData.element.toLowerCase()} energy is at its peak.`,
        `Powerful planetary alignments enhance your ${signData.ruler}-ruled nature, ${user.zodiacSign}. ${periodText} is marked by exceptional clarity and the ability to manifest your deepest intentions. The cosmos supports your highest aspirations.`
      ],
      moderate: [
        `${periodText} offers a balanced cosmic climate, ${user.zodiacSign}. Your ${signData.element.toLowerCase()} energy flows steadily, creating opportunities for steady progress. The stars encourage patience and thoughtful action.`,
        `The celestial energies are harmonious, ${user.zodiacSign}. ${periodText} provides a stable foundation for your ${dominantTrait} tendencies to flourish. Trust in the natural rhythm of cosmic timing.`,
        `Moderate cosmic energy creates an ideal environment for reflection and planning, ${user.zodiacSign}. Your ${signData.quality.toLowerCase()} nature finds comfort in the steady pace of ${periodText}'s influences.`
      ],
      low: [
        `${periodText} calls for introspection and inner work, ${user.zodiacSign}. The lower cosmic energy provides space for healing and preparation. Your ${signData.element.toLowerCase()} nature benefits from this quieter period.`,
        `The stars suggest a time of rest and renewal, ${user.zodiacSign}. ${periodText}'s gentle cosmic energy supports your ${dominantTrait} nature through quiet strength rather than bold action.`,
        `Lower cosmic energy creates opportunities for deep reflection, ${user.zodiacSign}. Your ${signData.ruler}-ruled nature finds wisdom in the stillness of ${periodText}'s influences.`
      ]
    };

    const selectedReading = readings[energyLevel][Math.floor(Math.random() * readings[energyLevel].length)];
    
    // Add personalized elements
    const personalElements = this.getPersonalElements(user, signData, currentDate);
    
    return `${selectedReading} ${personalElements}`;
  }

  private static generateCategoryReadings(
    user: User,
    signData: any,
    period: string,
    cosmicEnergy: number
  ): any {
    const categories = {};
    
    Object.keys(LIFE_AREAS).forEach(area => {
      const areaData = LIFE_AREAS[area as keyof typeof LIFE_AREAS];
      const theme = areaData.themes[Math.floor(Math.random() * areaData.themes.length)];
      const keyword = areaData.keywords[Math.floor(Math.random() * areaData.keywords.length)];
      
      const readings = {
        love: [
          `Your ${signData.element.toLowerCase()} energy brings ${keyword} to your relationships. The stars encourage open communication and deeper emotional connections.`,
          `Venus influences enhance your natural ${signData.traits[0]} nature in matters of the heart. Trust your instincts about partnership and romance.`,
          `The cosmic energies support new beginnings in love and strengthen existing bonds through ${keyword} and understanding.`
        ],
        career: [
          `Your ${signData.quality.toLowerCase()} approach to work brings ${keyword} and recognition. The stars align to support your professional ambitions.`,
          `Mercury's influence enhances your communication skills, making this an ideal time for important meetings and presentations.`,
          `The cosmic climate favors innovation and leadership. Your ${signData.traits[1]} nature will be particularly valuable in professional settings.`
        ],
        health: [
          `Your ${signData.element.toLowerCase()} constitution benefits from ${keyword} and balance. Focus on activities that restore your natural energy.`,
          `The stars encourage attention to your physical and emotional well-being. Your ${signData.traits[2]} nature thrives with proper self-care.`,
          `Cosmic energies support healing and renewal. Trust your body's wisdom and give it the rest and nourishment it needs.`
        ],
        growth: [
          `Your ${signData.ruler}-ruled nature seeks ${keyword} and deeper understanding. The stars support your spiritual and intellectual development.`,
          `The cosmic energies encourage exploration of new ideas and perspectives. Your ${signData.traits[3]} nature is particularly receptive to growth.`,
          `This is an ideal time for ${keyword} and self-discovery. The universe provides opportunities for meaningful transformation.`
        ]
      };
      
      categories[area] = readings[area as keyof typeof readings][Math.floor(Math.random() * readings[area as keyof typeof readings].length)];
    });
    
    return categories;
  }

  private static generateLuckyElements(signData: any, date: Date): any {
    const colors = signData.colors;
    const numbers = signData.luckyNumbers;
    
    return {
      color: colors[Math.floor(Math.random() * colors.length)],
      number: numbers[Math.floor(Math.random() * numbers.length)],
      time: this.generateLuckyTime(date),
      direction: this.generateLuckyDirection(signData.element)
    };
  }

  private static generateLuckyTime(date: Date): string {
    const hours = ['6:00 AM', '9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM', '9:00 PM'];
    return hours[Math.floor(Math.random() * hours.length)];
  }

  private static generateLuckyDirection(element: string): string {
    const directions = {
      Fire: 'East',
      Earth: 'North',
      Air: 'West',
      Water: 'South'
    };
    return directions[element as keyof typeof directions] || 'East';
  }

  private static getKeyPlanets(user: User, date: Date): string[] {
    const signData = ZODIAC_SIGN_DATA[user.zodiacSign.toLowerCase() as keyof typeof ZODIAC_SIGN_DATA];
    const planets = [signData.ruler, 'Moon', 'Mercury', 'Venus', 'Mars'];
    
    // Add current transiting planets
    const transitingPlanets = CURRENT_TRANSITS.map(t => t.planet);
    
    return [...new Set([...planets, ...transitingPlanets])].slice(0, 5);
  }

  private static generateMood(signData: any, cosmicEnergy: number): string {
    const moods = {
      high: ['confident', 'energetic', 'optimistic', 'inspired', 'powerful'],
      moderate: ['balanced', 'content', 'hopeful', 'steady', 'peaceful'],
      low: ['reflective', 'calm', 'introspective', 'gentle', 'serene']
    };
    
    const energyLevel = cosmicEnergy > 4 ? 'high' : cosmicEnergy > 2 ? 'moderate' : 'low';
    const moodList = moods[energyLevel];
    
    return moodList[Math.floor(Math.random() * moodList.length)];
  }

  private static generateWordOfDay(signData: any, period: string): string {
    const words = {
      today: ['manifest', 'believe', 'trust', 'create', 'shine'],
      yesterday: ['reflect', 'learn', 'grow', 'understand', 'accept'],
      tomorrow: ['prepare', 'anticipate', 'plan', 'envision', 'hope'],
      weekly: ['progress', 'develop', 'expand', 'evolve', 'transform'],
      monthly: ['achieve', 'accomplish', 'master', 'excel', 'succeed']
    };
    
    const wordList = words[period as keyof typeof words] || words.today;
    return wordList[Math.floor(Math.random() * wordList.length)];
  }

  private static calculateCosmicEnergy(user: User, date: Date): number {
    // Simplified cosmic energy calculation based on date and zodiac sign
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const signNumber = Object.keys(ZODIAC_SIGN_DATA).indexOf(user.zodiacSign.toLowerCase()) + 1;
    
    // Create a pseudo-random but consistent energy level
    const energySeed = (dayOfYear + signNumber + date.getFullYear()) % 5;
    return Math.max(1, Math.min(5, energySeed + 1));
  }

  private static getPersonalElements(user: User, signData: any, date: Date): string {
    const elements = [
      `Your birth chart's ${signData.ruler} influence is particularly strong today.`,
      `The ${signData.element.toLowerCase()} element in your chart creates powerful opportunities for growth.`,
      `Your ${signData.quality.toLowerCase()} nature finds perfect expression in today's cosmic climate.`,
      `The stars honor your ${signData.traits[0]} nature with special blessings.`
    ];
    
    return elements[Math.floor(Math.random() * elements.length)];
  }
}
