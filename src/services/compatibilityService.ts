// src/services/compatibilityService.ts
import { AstronomicalService } from './astronomicalService';

export interface BirthData {
  name: string;
  birthDate: Date;
  birthTime?: Date;
  birthLocation: {
    latitude: number;
    longitude: number;
  };
}

export interface PlanetaryPosition {
  planet: string;
  zodiacSign: string;
  rightAscension: number;
  declination: number;
  distance: number;
}

export interface CompatibilityScore {
  category: string;
  score: number; // 0-100
  description: string;
  planets: string[];
  aspects: string[];
}

export interface CompatibilityResult {
  overallScore: number;
  categories: CompatibilityScore[];
  insights: string[];
  challenges: string[];
  dynamicInsights: {
    current: string[];
    daily: string[];
    weekly: string[];
    transitBased: string[];
  };
  synastryAspects: Array<{
    planet1: string;
    planet2: string;
    aspect: string;
    orb: number;
    description: string;
  }>;
  recommendations: string[];
  lastUpdated: Date;
  insightRotationIndex: number;
}

export class CompatibilityService {
  private static readonly PLANET_CODES = {
    sun: '10',
    moon: '301',
    mercury: '199',
    venus: '299',
    mars: '499',
    jupiter: '599',
    saturn: '699',
    uranus: '799',
    neptune: '899',
    pluto: '999'
  };

  // Get planetary positions for a birth chart
  static async getBirthChart(birthData: BirthData): Promise<PlanetaryPosition[]> {
    const positions: PlanetaryPosition[] = [];
    
    for (const [planetName, code] of Object.entries(this.PLANET_CODES)) {
      try {
        const position = await AstronomicalService.getPlanetaryPositionFromSupabase(
          code,
          birthData.birthLocation.latitude,
          birthData.birthLocation.longitude,
          birthData.birthDate
        );
        
        if (position && position.zodiacSign) {
          positions.push({
            planet: planetName,
            zodiacSign: position.zodiacSign,
            rightAscension: parseFloat(position.rightAscension),
            declination: parseFloat(position.declination),
            distance: position.distance
          });
        }
      } catch (error) {
        console.error(`Error getting ${planetName} position:`, error);
      }
    }
    
    return positions;
  }

  // Calculate compatibility between two birth charts
  static async calculateCompatibility(
    person1: BirthData,
    person2: BirthData,
    userData?: any,
    relationshipHistory?: any[]
  ): Promise<CompatibilityResult> {
    try {
      console.log('🔮 Calculating real astrological compatibility...');
      
      // Get birth charts for both people
      const [chart1, chart2] = await Promise.all([
        this.getBirthChart(person1),
        this.getBirthChart(person2)
      ]);

      if (chart1.length === 0 || chart2.length === 0) {
        throw new Error('Unable to generate birth charts');
      }

      // Calculate synastry aspects
      const synastryAspects = this.calculateSynastryAspects(chart1, chart2);
      
      // Calculate compatibility scores by category
      const categories = this.calculateCompatibilityCategories(chart1, chart2, synastryAspects);
      
      // Calculate overall score with realistic bounds
      const rawOverallScore = categories.reduce((sum, cat) => sum + cat.score, 0) / categories.length;
      
      // Apply realistic compatibility range: 28% to 89%
      // Add slight randomization for more natural feel (±3%)
      const randomFactor = (Math.random() - 0.5) * 6; // -3 to +3
      const adjustedScore = rawOverallScore + randomFactor;
      
      const overallScore = Math.max(28, Math.min(89, Math.round(adjustedScore)));
      
      // Get zodiac signs for compatibility analysis
      const userSign = userData?.zodiacSign;
      const partnerSign = this.getZodiacSignFromDate(person2.birthDate);
      
      // Generate insights with zodiac sign compatibility
      const insights = this.generateInsights(chart1, chart2, synastryAspects, userSign, partnerSign);
      
      // Generate growth areas (challenges) based on zodiac compatibility
      const growthAreas = this.generateGrowthAreas(userSign, partnerSign);

      // Generate recommendations
      const recommendations = this.generateRecommendations(categories, synastryAspects);

      // Generate dynamic insights
      const dynamicInsights = await this.generateDynamicInsights(chart1, chart2, synastryAspects);

      // Generate personalized insights if user data is provided
      let personalizedInsights: string[] = [];
      if (userData && person2) {
        personalizedInsights = this.generatePersonalizedInsights(
          userData,
          { birthDate: person2.birthDate },
          relationshipHistory || []
        );
      }

      // Generate contextual insights based on relationship phase
      const contextualInsights = this.generateContextualInsights(
        userData?.relationshipType || 'dating',
        userData?.relationshipDuration,
        overallScore
      );

      // Combine insights with personalized and contextual insights
      const combinedInsights = [...insights, ...personalizedInsights, ...contextualInsights];

      return {
        overallScore,
        categories,
        insights: combinedInsights,
        challenges: growthAreas, // Growth areas become challenges
        dynamicInsights,
        synastryAspects,
        recommendations,
        lastUpdated: new Date(),
        insightRotationIndex: 0
      };
      
    } catch (error) {
      console.error('Error calculating compatibility:', error);
      throw error;
    }
  }

  // Calculate synastry aspects between two charts
  private static calculateSynastryAspects(
    chart1: PlanetaryPosition[],
    chart2: PlanetaryPosition[]
  ): Array<{
    planet1: string;
    planet2: string;
    aspect: string;
    orb: number;
    description: string;
  }> {
    const aspects: Array<{
      planet1: string;
      planet2: string;
      aspect: string;
      orb: number;
      description: string;
    }> = [];

    // Create a map for quick planet lookup
    const chart2Map = new Map(chart2.map(p => [p.planet, p]));

    for (const planet1 of chart1) {
      for (const planet2 of chart2) {
        const aspect = this.calculateAspect(planet1, planet2);
        if (aspect) {
          aspects.push({
            planet1: planet1.planet,
            planet2: planet2.planet,
            aspect: aspect.name,
            orb: aspect.orb,
            description: this.getAspectDescription(planet1.planet, planet2.planet, aspect.name)
          });
        }
      }
    }

    return aspects;
  }

  // Calculate aspect between two planets
  private static calculateAspect(
    planet1: PlanetaryPosition,
    planet2: PlanetaryPosition
  ): { name: string; orb: number } | null {
    // Convert zodiac signs to degrees
    const degree1 = this.zodiacSignToDegrees(planet1.zodiacSign);
    const degree2 = this.zodiacSignToDegrees(planet2.zodiacSign);
    
    // Calculate angular separation
    let separation = Math.abs(degree1 - degree2);
    if (separation > 180) {
      separation = 360 - separation;
    }

    // Check for major aspects
    const aspects = [
      { name: 'Conjunction', angle: 0, orb: 8 },
      { name: 'Sextile', angle: 60, orb: 6 },
      { name: 'Square', angle: 90, orb: 8 },
      { name: 'Trine', angle: 120, orb: 6 },
      { name: 'Opposition', angle: 180, orb: 8 }
    ];

    for (const aspect of aspects) {
      if (Math.abs(separation - aspect.angle) <= aspect.orb) {
        return {
          name: aspect.name,
          orb: Math.abs(separation - aspect.angle)
        };
      }
    }

    return null;
  }

  // Convert zodiac sign to degrees (simplified)
  private static zodiacSignToDegrees(sign: string): number {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    
    const index = signs.indexOf(sign);
    return index >= 0 ? index * 30 : 0;
  }

  // Calculate compatibility categories
  private static calculateCompatibilityCategories(
    chart1: PlanetaryPosition[],
    chart2: PlanetaryPosition[],
    aspects: Array<{ planet1: string; planet2: string; aspect: string; orb: number }>
  ): CompatibilityScore[] {
    const categories: CompatibilityScore[] = [];

    // Love & Romance (Venus aspects)
    const venusAspects = aspects.filter(a => 
      a.planet1 === 'venus' || a.planet2 === 'venus'
    );
    const loveScore = this.calculateCategoryScore(venusAspects, 'love');
    categories.push({
      category: 'Love & Romance',
      score: loveScore,
      description: this.getLoveDescription(loveScore, venusAspects),
      planets: ['venus'],
      aspects: venusAspects.map(a => a.aspect)
    });

    // Communication (Mercury aspects)
    const mercuryAspects = aspects.filter(a => 
      a.planet1 === 'mercury' || a.planet2 === 'mercury'
    );
    const communicationScore = this.calculateCategoryScore(mercuryAspects, 'communication');
    categories.push({
      category: 'Communication',
      score: communicationScore,
      description: this.getCommunicationDescription(communicationScore, mercuryAspects),
      planets: ['mercury'],
      aspects: mercuryAspects.map(a => a.aspect)
    });

    // Passion & Intimacy (Mars aspects)
    const marsAspects = aspects.filter(a => 
      a.planet1 === 'mars' || a.planet2 === 'mars'
    );
    const passionScore = this.calculateCategoryScore(marsAspects, 'passion');
    categories.push({
      category: 'Passion & Intimacy',
      score: passionScore,
      description: this.getPassionDescription(passionScore, marsAspects),
      planets: ['mars'],
      aspects: marsAspects.map(a => a.aspect)
    });

    // Emotional Connection (Moon aspects)
    const moonAspects = aspects.filter(a => 
      a.planet1 === 'moon' || a.planet2 === 'moon'
    );
    const emotionalScore = this.calculateCategoryScore(moonAspects, 'emotional');
    categories.push({
      category: 'Emotional Connection',
      score: emotionalScore,
      description: this.getEmotionalDescription(emotionalScore, moonAspects),
      planets: ['moon'],
      aspects: moonAspects.map(a => a.aspect)
    });

    // Long-term Compatibility (Saturn aspects)
    const saturnAspects = aspects.filter(a => 
      a.planet1 === 'saturn' || a.planet2 === 'saturn'
    );
    const longTermScore = this.calculateCategoryScore(saturnAspects, 'longterm');
    categories.push({
      category: 'Long-term Compatibility',
      score: longTermScore,
      description: this.getLongTermDescription(longTermScore, saturnAspects),
      planets: ['saturn'],
      aspects: saturnAspects.map(a => a.aspect)
    });

    return categories;
  }

  // Calculate score for a category based on aspects - with realistic bounds
  private static calculateCategoryScore(
    aspects: Array<{ aspect: string; orb: number }>,
    category: string
  ): number {
    if (aspects.length === 0) return 55; // Slightly positive neutral score

    let score = 55; // Base score - slightly optimistic
    
    for (const aspect of aspects) {
      const orbQuality = Math.max(0, 8 - aspect.orb) / 8; // Better orbs = higher quality
      
      switch (aspect.aspect) {
        case 'Conjunction':
          score += category === 'love' ? 12 * orbQuality : 8 * orbQuality;
          break;
        case 'Trine':
          score += 16 * orbQuality;
          break;
        case 'Sextile':
          score += 12 * orbQuality;
          break;
        case 'Square':
          score -= 8 * orbQuality;
          break;
        case 'Opposition':
          score += category === 'passion' ? 8 * orbQuality : -4 * orbQuality;
          break;
      }
    }

    // Realistic compatibility range: 25% to 92%
    // No relationship is completely incompatible (0%) or perfect (100%)
    return Math.max(25, Math.min(92, Math.round(score)));
  }

  // Generate insights based on charts and aspects with zodiac sign compatibility
  private static generateInsights(
    chart1: PlanetaryPosition[],
    chart2: PlanetaryPosition[],
    aspects: Array<{ planet1: string; planet2: string; aspect: string; orb: number }>,
    userSign?: string,
    partnerSign?: string
  ): string[] {
    const insights: string[] = [];

    // If we have zodiac signs, generate sign-based compatibility insights (limit to 3-4)
    if (userSign && partnerSign) {
      const signInsights = this.generateZodiacCompatibilityInsights(userSign, partnerSign);
      insights.push(...signInsights.slice(0, 4)); // Limit to maximum 4 insights
      return insights;
    }

    // Fallback to planetary aspects if no zodiac signs available
    const aspectInsights: string[] = [];

    // Sun-Moon aspects (emotional compatibility)
    const sunMoonAspects = aspects.filter(a => 
      (a.planet1 === 'sun' && a.planet2 === 'moon') ||
      (a.planet1 === 'moon' && a.planet2 === 'sun')
    );

    if (sunMoonAspects.length > 0) {
      const aspect = sunMoonAspects[0];
      if (aspect.aspect === 'Trine' || aspect.aspect === 'Sextile') {
        aspectInsights.push('🌟 Your Sun-Moon aspects create natural emotional harmony. The Sun represents your core identity while the Moon governs your emotional needs - when these align through harmonious aspects, you understand each other\'s fundamental nature.');
      } else if (aspect.aspect === 'Square' || aspect.aspect === 'Opposition') {
        aspectInsights.push('⚡ Your Sun-Moon aspects create dynamic tension that can lead to growth. While challenging aspects may cause initial friction, they often provide the catalyst for deeper understanding and personal evolution.');
      }
    }

    // Venus aspects (love style)
    const venusAspects = aspects.filter(a => 
      a.planet1 === 'venus' || a.planet2 === 'venus'
    );

    if (venusAspects.length > 0) {
      const trines = venusAspects.filter(a => a.aspect === 'Trine').length;
      const squares = venusAspects.filter(a => a.aspect === 'Square').length;
      
      if (trines > squares) {
        aspectInsights.push('💕 Venus governs love, beauty, and values. Your harmonious Venus aspects indicate compatible love languages, similar aesthetic preferences, and aligned relationship values that create natural romantic flow.');
      } else if (squares > trines) {
        aspectInsights.push('🔥 Your Venus aspects create passionate dynamics. While you may have different approaches to love and romance, these differences can create exciting tension and opportunities for mutual growth in your relationship.');
      }
    }

    // Mars aspects (sexual chemistry)
    const marsAspects = aspects.filter(a => 
      a.planet1 === 'mars' || a.planet2 === 'mars'
    );

    if (marsAspects.length > 0) {
      const conjunctions = marsAspects.filter(a => a.aspect === 'Conjunction').length;
      const oppositions = marsAspects.filter(a => a.aspect === 'Opposition').length;
      
      if (conjunctions > 0) {
        aspectInsights.push('⚡ Mars rules passion, desire, and action. Your Mars conjunction creates intense physical and sexual chemistry, with aligned energy levels and compatible approaches to pursuing goals and desires.');
      } else if (oppositions > 0) {
        aspectInsights.push('💥 Your Mars opposition creates magnetic sexual tension. While you may have different energy levels and approaches to conflict, this contrast can create exciting dynamics and help you balance each other\'s extremes.');
      }
    }

    // Mercury aspects (communication)
    const mercuryAspects = aspects.filter(a => 
      a.planet1 === 'mercury' || a.planet2 === 'mercury'
    );

    if (mercuryAspects.length > 0) {
      const trines = mercuryAspects.filter(a => a.aspect === 'Trine').length;
      const squares = mercuryAspects.filter(a => a.aspect === 'Square').length;
      
      if (trines > squares) {
        aspectInsights.push('🗣️ Mercury governs communication and mental processes. Your harmonious Mercury aspects indicate natural intellectual compatibility, similar communication styles, and easy mental connection that facilitates understanding.');
      } else if (squares > trines) {
        aspectInsights.push('💭 Your Mercury aspects create interesting communication dynamics. While you may process information differently or have distinct communication styles, these differences can lead to rich conversations and mutual learning.');
      }
    }

    // Return limited insights (3-4 maximum)
    return aspectInsights.slice(0, 4);
  }

  // Generate zodiac sign compatibility insights (3-4 strengths)
  private static generateZodiacCompatibilityInsights(userSign: string, partnerSign: string): string[] {
    const insights: string[] = [];
    
    // Get elements and modalities
    const userElement = this.getZodiacElement(userSign);
    const partnerElement = this.getZodiacElement(partnerSign);
    const userModality = this.getZodiacModality(userSign);
    const partnerModality = this.getZodiacModality(partnerSign);

    // Element compatibility insight
    if (userElement === partnerElement) {
      insights.push(`🔥 Both ${userSign} and ${partnerSign} share the ${userElement} element, creating natural understanding and similar approaches to life. You both express energy in compatible ways and instinctively "get" each other's motivations.`);
    } else if (this.areElementsCompatible(userElement, partnerElement)) {
      insights.push(`⚖️ ${userSign} (${userElement}) and ${partnerSign} (${partnerElement}) have complementary elements that create beautiful balance. ${userElement} energy ${this.getElementInteraction(userElement, partnerElement)} ${partnerElement} energy, fostering mutual growth.`);
    } else {
      insights.push(`🌊 ${userSign} (${userElement}) and ${partnerSign} (${partnerElement}) bring different elemental energies that can create exciting dynamics. While ${userElement} and ${partnerElement} express differently, these contrasts offer opportunities for learning and expansion.`);
    }

    // Modality compatibility insight
    if (userModality === partnerModality) {
      insights.push(`🎯 Both ${userSign} and ${partnerSign} share the ${userModality} modality, meaning you approach life changes and challenges with similar timing and energy. This creates natural synchronization in your relationship rhythm.`);
    } else {
      insights.push(`⏰ ${userSign} (${userModality}) and ${partnerSign} (${partnerModality}) bring different approaches to life's changes. ${userModality} energy ${this.getModalityInteraction(userModality, partnerModality)} ${partnerModality} energy, creating dynamic balance.`);
    }

    // Specific sign compatibility insights
    const specificInsights = this.getSpecificSignCompatibility(userSign, partnerSign);
    insights.push(...specificInsights);

    return insights.slice(0, 4); // Ensure maximum 4 insights
  }

  // Get specific compatibility insights between two signs
  private static getSpecificSignCompatibility(userSign: string, partnerSign: string): string[] {
    const insights: string[] = [];
    
    // High compatibility pairs
    const highCompatibilityPairs: { [key: string]: string[] } = {
      'Aries': ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'],
      'Taurus': ['Virgo', 'Capricorn', 'Cancer', 'Pisces'],
      'Gemini': ['Libra', 'Aquarius', 'Aries', 'Leo'],
      'Cancer': ['Scorpio', 'Pisces', 'Taurus', 'Virgo'],
      'Leo': ['Aries', 'Sagittarius', 'Gemini', 'Libra'],
      'Virgo': ['Taurus', 'Capricorn', 'Cancer', 'Scorpio'],
      'Libra': ['Gemini', 'Aquarius', 'Leo', 'Sagittarius'],
      'Scorpio': ['Cancer', 'Pisces', 'Virgo', 'Capricorn'],
      'Sagittarius': ['Aries', 'Leo', 'Libra', 'Aquarius'],
      'Capricorn': ['Taurus', 'Virgo', 'Scorpio', 'Pisces'],
      'Aquarius': ['Gemini', 'Libra', 'Aries', 'Sagittarius'],
      'Pisces': ['Cancer', 'Scorpio', 'Taurus', 'Capricorn']
    };

    if (highCompatibilityPairs[userSign]?.includes(partnerSign)) {
      insights.push(`✨ ${userSign} and ${partnerSign} are naturally compatible signs! Your personalities complement each other beautifully, with ${userSign}'s ${this.getSignTraits(userSign)} harmonizing perfectly with ${partnerSign}'s ${this.getSignTraits(partnerSign)}.`);
    }

    // Opposite sign dynamics (can be very compatible)
    const oppositeSignPairs: { [key: string]: string } = {
      'Aries': 'Libra', 'Taurus': 'Scorpio', 'Gemini': 'Sagittarius',
      'Cancer': 'Capricorn', 'Leo': 'Aquarius', 'Virgo': 'Pisces'
    };

    if (oppositeSignPairs[userSign] === partnerSign || oppositeSignPairs[partnerSign] === userSign) {
      insights.push(`🌗 ${userSign} and ${partnerSign} are opposite signs, creating magnetic attraction and perfect balance. You each possess what the other needs, making for a relationship that's both challenging and deeply fulfilling.`);
    }

    return insights.slice(0, 2); // Maximum 2 specific insights
  }

  // Get element interaction description
  private static getElementInteraction(element1: string, element2: string): string {
    const interactions: { [key: string]: string } = {
      'Fire-Air': 'ignites and energizes',
      'Air-Fire': 'fuels and inspires',
      'Earth-Water': 'nurtures and grounds',
      'Water-Earth': 'nourishes and supports'
    };
    return interactions[`${element1}-${element2}`] || 'interacts with';
  }

  // Get modality interaction description
  private static getModalityInteraction(modality1: string, modality2: string): string {
    const interactions: { [key: string]: string } = {
      'Cardinal-Fixed': 'initiates while',
      'Fixed-Cardinal': 'stabilizes while',
      'Cardinal-Mutable': 'leads while',
      'Mutable-Cardinal': 'adapts while',
      'Fixed-Mutable': 'provides stability while',
      'Mutable-Fixed': 'brings flexibility while'
    };
    return interactions[`${modality1}-${modality2}`] || 'complements';
  }

  // Get key traits for each sign
  private static getSignTraits(sign: string): string {
    const traits: { [key: string]: string } = {
      'Aries': 'bold leadership and passionate energy',
      'Taurus': 'steady devotion and sensual nature',
      'Gemini': 'intellectual curiosity and adaptability',
      'Cancer': 'emotional depth and nurturing spirit',
      'Leo': 'generous heart and creative flair',
      'Virgo': 'thoughtful care and practical wisdom',
      'Libra': 'diplomatic grace and romantic idealism',
      'Scorpio': 'intense loyalty and transformative power',
      'Sagittarius': 'adventurous spirit and philosophical mind',
      'Capricorn': 'ambitious drive and reliable strength',
      'Aquarius': 'innovative thinking and humanitarian values',
      'Pisces': 'intuitive compassion and artistic soul'
    };
    return traits[sign] || 'unique qualities';
  }

  // Generate growth areas based on zodiac sign challenges (2-3 areas)
  private static generateGrowthAreas(userSign?: string, partnerSign?: string): string[] {
    if (!userSign || !partnerSign) {
      // Default growth areas if no signs available
      return [
        'Communication styles may require patience and understanding to bridge different approaches to expressing thoughts and feelings.',
        'Balancing individual needs with relationship goals can create opportunities for mutual growth and deeper connection.',
        'Different pacing in life decisions may need conscious coordination to maintain harmony and forward momentum.'
      ].slice(0, 3);
    }

    const growthAreas: string[] = [];
    
    // Get elements and modalities
    const userElement = this.getZodiacElement(userSign);
    const partnerElement = this.getZodiacElement(partnerSign);
    const userModality = this.getZodiacModality(userSign);
    const partnerModality = this.getZodiacModality(partnerSign);

    // Element-based growth areas
    if (userElement !== partnerElement && !this.areElementsCompatible(userElement, partnerElement)) {
      growthAreas.push(`${userSign}'s ${userElement} energy and ${partnerSign}'s ${partnerElement} energy express quite differently. Learning to appreciate and integrate these contrasting approaches can deepen your understanding of each other.`);
    } else if (userElement === partnerElement) {
      growthAreas.push(`Both being ${userElement} signs, you may sometimes amplify each other's challenges. Developing awareness of when you're both stuck in the same patterns can help you support each other's growth.`);
    }

    // Modality-based growth areas
    if (userModality !== partnerModality) {
      const modalityChallenges: { [key: string]: string } = {
        'Cardinal-Fixed': `${userSign}'s desire to initiate new directions may sometimes clash with ${partnerSign}'s need for stability. Finding balance between change and consistency will strengthen your bond.`,
        'Fixed-Cardinal': `${userSign}'s preference for steady progress may feel restrictive to ${partnerSign}'s need for new beginnings. Learning to blend security with adventure is key.`,
        'Cardinal-Mutable': `${userSign}'s leadership style may overwhelm ${partnerSign}'s adaptable nature. Creating space for both direction and flexibility will enhance your partnership.`,
        'Mutable-Cardinal': `${userSign}'s go-with-the-flow approach may frustrate ${partnerSign}'s goal-oriented nature. Balancing spontaneity with planning is essential.`,
        'Fixed-Mutable': `${userSign}'s need for routine may conflict with ${partnerSign}'s desire for variety. Embracing both stability and change will enrich your relationship.`,
        'Mutable-Fixed': `${userSign}'s changing interests may challenge ${partnerSign}'s consistent approach. Finding common ground between variety and commitment is important.`
      };
      
      const modalityKey = `${userModality}-${partnerModality}`;
      if (modalityChallenges[modalityKey]) {
        growthAreas.push(modalityChallenges[modalityKey]);
      }
    }

    // Sign-specific growth areas
    const specificGrowthAreas = this.getSignSpecificGrowthAreas(userSign, partnerSign);
    growthAreas.push(...specificGrowthAreas);

    // Return maximum 3 growth areas
    return growthAreas.slice(0, 3);
  }

  // Get sign-specific growth areas
  private static getSignSpecificGrowthAreas(userSign: string, partnerSign: string): string[] {
    const growthAreas: string[] = [];

    // Common challenging combinations and their growth opportunities
    const challengingCombinations: { [key: string]: string[] } = {
      'Aries-Cancer': [`${userSign}'s direct approach may sometimes feel overwhelming to ${partnerSign}'s sensitive nature. Learning gentleness and emotional timing will deepen intimacy.`],
      'Cancer-Aries': [`${userSign}'s emotional depth may feel too intense for ${partnerSign}'s straightforward style. Finding balance between feelings and action strengthens connection.`],
      'Taurus-Aquarius': [`${userSign}'s traditional values may clash with ${partnerSign}'s innovative ideas. Embracing both stability and progress creates beautiful harmony.`],
      'Aquarius-Taurus': [`${userSign}'s need for freedom may challenge ${partnerSign}'s desire for security. Balancing independence with commitment is essential.`],
      'Gemini-Virgo': [`${userSign}'s scattered interests may frustrate ${partnerSign}'s focused approach. Learning to appreciate both breadth and depth enhances understanding.`],
      'Virgo-Gemini': [`${userSign}'s attention to detail may overwhelm ${partnerSign}'s big-picture thinking. Combining precision with flexibility strengthens your bond.`],
      'Leo-Scorpio': [`${userSign}'s need for attention may compete with ${partnerSign}'s desire for privacy. Respecting both visibility and intimacy is key.`],
      'Scorpio-Leo': [`${userSign}'s intensity may overshadow ${partnerSign}'s natural radiance. Learning to share the spotlight deepens mutual appreciation.`],
      'Sagittarius-Pisces': [`${userSign}'s blunt honesty may hurt ${partnerSign}'s sensitive feelings. Developing compassionate communication strengthens emotional connection.`],
      'Pisces-Sagittarius': [`${userSign}'s emotional needs may feel restrictive to ${partnerSign}'s adventurous spirit. Balancing dreams with exploration enriches your journey.`],
      'Capricorn-Libra': [`${userSign}'s work focus may neglect ${partnerSign}'s relationship needs. Prioritizing both achievement and harmony creates lasting success.`],
      'Libra-Capricorn': [`${userSign}'s need for balance may slow down ${partnerSign}'s ambitious pace. Finding rhythm between reflection and action is important.`]
    };

    const combinationKey = `${userSign}-${partnerSign}`;
    if (challengingCombinations[combinationKey]) {
      growthAreas.push(...challengingCombinations[combinationKey]);
    }

    // If no specific combination, add a general growth area
    if (growthAreas.length === 0) {
      growthAreas.push(`Understanding how ${userSign} and ${partnerSign} express love differently can help you both feel more appreciated and valued in your unique ways.`);
    }

    return growthAreas.slice(0, 1); // Maximum 1 specific growth area
  }

  // Generate recommendations based on compatibility analysis
  private static generateRecommendations(
    categories: CompatibilityScore[],
    aspects: Array<{ planet1: string; planet2: string; aspect: string; orb: number }>
  ): string[] {
    const recommendations: string[] = [];

    // Find lowest scoring category
    const lowestCategory = categories.reduce((min, cat) => 
      cat.score < min.score ? cat : min
    );

    if (lowestCategory.score < 40) {
      switch (lowestCategory.category) {
        case 'Communication':
          recommendations.push('Focus on active listening and expressing your thoughts clearly.');
          recommendations.push('Consider different communication styles and find common ground.');
          break;
        case 'Love & Romance':
          recommendations.push('Explore each other\'s love languages and romantic preferences.');
          recommendations.push('Plan regular date nights to nurture your romantic connection.');
          break;
        case 'Passion & Intimacy':
          recommendations.push('Communicate openly about your physical needs and desires.');
          recommendations.push('Create opportunities for intimate connection and shared experiences.');
          break;
        case 'Emotional Connection':
          recommendations.push('Practice emotional vulnerability and empathy.');
          recommendations.push('Create safe spaces for sharing feelings and experiences.');
          break;
        case 'Long-term Compatibility':
          recommendations.push('Discuss your long-term goals and values openly.');
          recommendations.push('Work together on building shared dreams and commitments.');
          break;
      }
    }

    // Add general recommendations based on aspects
    const challengingAspects = aspects.filter(a => 
      a.aspect === 'Square' && a.orb < 5
    );

    if (challengingAspects.length > 0) {
      recommendations.push('Embrace your differences as opportunities for growth and learning.');
      recommendations.push('Use challenging aspects as motivation to work together and compromise.');
    }

    return recommendations;
  }

  // Helper methods for category descriptions with educational context
  private static getLoveDescription(score: number, aspects: any[]): string {
    if (score >= 80) return '💕 Exceptional romantic harmony! Venus aspects create natural attraction, compatible love languages, and aligned relationship values. Your approaches to romance, beauty, and partnership flow together effortlessly.';
    if (score >= 60) return '💖 Strong romantic potential! Your Venus aspects indicate good compatibility in love styles, with similar approaches to romance and relationships. There\'s natural chemistry and mutual understanding.';
    if (score >= 40) return '💝 Moderate romantic compatibility with growth potential. Your Venus aspects show some differences in love styles that can be balanced through understanding and appreciation of each other\'s unique romantic needs.';
    return '💔 Different approaches to love that require conscious effort. Your Venus aspects indicate contrasting love languages and romantic styles, but these differences can create exciting dynamics and opportunities for mutual growth.';
  }

  private static getCommunicationDescription(score: number, aspects: any[]): string {
    if (score >= 80) return '🗣️ Excellent communication flow! Mercury aspects create natural mental connection, compatible thinking styles, and effortless understanding. You speak the same "mental language" and process information similarly.';
    if (score >= 60) return '💭 Good communication potential! Your Mercury aspects indicate compatible thinking patterns and communication styles. You can understand each other\'s perspectives and engage in meaningful conversations.';
    if (score >= 40) return '🤔 Moderate communication compatibility. Your Mercury aspects show some differences in how you process and express information, but these can be navigated with patience and active listening.';
    return '💬 Different communication styles that require conscious effort. Your Mercury aspects indicate contrasting approaches to thinking and expressing ideas, but these differences can lead to rich, diverse conversations and mutual learning.';
  }

  private static getPassionDescription(score: number, aspects: any[]): string {
    if (score >= 80) return '🔥 Intense physical and sexual chemistry! Mars aspects create powerful attraction, aligned energy levels, and compatible approaches to passion and desire. Your sexual energies are perfectly matched.';
    if (score >= 60) return '⚡ Strong passion and sexual compatibility! Your Mars aspects indicate good energy flow and compatible approaches to physical intimacy. There\'s natural chemistry and mutual attraction.';
    if (score >= 40) return '💫 Moderate passion with growth potential. Your Mars aspects show some differences in energy levels and approaches to physical connection, but these can be balanced through understanding and compromise.';
    return '⚖️ Different energy levels that require balance. Your Mars aspects indicate contrasting approaches to passion and physical expression, but these differences can create exciting dynamics and help you balance each other\'s extremes.';
  }

  private static getEmotionalDescription(score: number, aspects: any[]): string {
    if (score >= 80) return '🌙 Deep emotional connection! Moon aspects create natural empathy, emotional understanding, and intuitive connection. You instinctively understand each other\'s emotional needs and provide mutual support.';
    if (score >= 60) return '💖 Good emotional compatibility! Your Moon aspects indicate supportive emotional connection and understanding of each other\'s feelings. You can provide comfort and emotional security to each other.';
    if (score >= 40) return '🌊 Moderate emotional connection with room for growth. Your Moon aspects show some differences in emotional expression and needs, but these can be harmonized through patience and emotional intelligence.';
    return '🌓 Different emotional needs that require understanding. Your Moon aspects indicate contrasting emotional styles and needs, but these differences can be balanced through empathy, communication, and mutual emotional support.';
  }

  private static getLongTermDescription(score: number, aspects: any[]): string {
    if (score >= 80) return '🏗️ Excellent long-term potential! Saturn aspects create strong foundation for lasting commitment, compatible approaches to responsibility, and aligned values around structure and long-term planning.';
    if (score >= 60) return '⏰ Good long-term compatibility! Your Saturn aspects indicate solid potential for lasting relationship with compatible approaches to commitment, responsibility, and building a future together.';
    if (score >= 40) return '🔧 Moderate long-term potential with areas to strengthen. Your Saturn aspects show some differences in approaches to commitment and structure, but these can be aligned through shared goals and mutual understanding.';
    return '⚖️ Different approaches to commitment that require alignment. Your Saturn aspects indicate contrasting views on responsibility and long-term planning, but these differences can be harmonized through open communication and shared vision for the future.';
  }

  private static getAspectDescription(planet1: string, planet2: string, aspect: string): string {
    const descriptions: { [key: string]: string } = {
      'Conjunction': 'Intense connection and blending of energies',
      'Trine': 'Harmonious flow and natural compatibility',
      'Sextile': 'Positive potential with gentle support',
      'Square': 'Challenging dynamic that promotes growth',
      'Opposition': 'Complementary forces that can create balance or tension'
    };
    
    return descriptions[aspect] || 'Unique planetary interaction';
  }

  // Generate dynamic insights that change over time
  private static async generateDynamicInsights(
    chart1: PlanetaryPosition[],
    chart2: PlanetaryPosition[],
    aspects: Array<{ planet1: string; planet2: string; aspect: string; orb: number }>
  ): Promise<{
    current: string[];
    daily: string[];
    weekly: string[];
    transitBased: string[];
  }> {
    const currentDate = new Date();
    const dayOfYear = Math.floor((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const weekOfYear = Math.floor(dayOfYear / 7);
    
    // Current insights (change every few hours)
    const currentInsights = this.generateCurrentInsights(chart1, chart2, aspects, currentDate);
    
    // Daily insights (change daily)
    const dailyInsights = this.generateDailyInsights(chart1, chart2, aspects, dayOfYear);
    
    // Weekly insights (change weekly)
    const weeklyInsights = this.generateWeeklyInsights(chart1, chart2, aspects, weekOfYear);
    
    // Transit-based insights (based on current planetary positions)
    const transitBasedInsights = await this.generateTransitBasedInsights(chart1, chart2, currentDate);

    return {
      current: currentInsights,
      daily: dailyInsights,
      weekly: weeklyInsights,
      transitBased: transitBasedInsights
    };
  }

  // Generate insights that change every few hours
  private static generateCurrentInsights(
    chart1: PlanetaryPosition[],
    chart2: PlanetaryPosition[],
    aspects: Array<{ planet1: string; planet2: string; aspect: string; orb: number }>,
    currentDate: Date
  ): string[] {
    const insights: string[] = [];
    const hour = currentDate.getHours();
    const timeOfDay = hour < 6 ? 'dawn' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    
    // Time-based insights
    const timeInsights = {
      dawn: [
        '🌅 The dawn energy brings fresh perspective to your connection. This is an ideal time for new beginnings and setting intentions together.',
        '✨ As the sun rises, your relationship has the potential to grow stronger with each new day. Embrace the morning energy for positive communication.',
        '🌄 The early morning hours are perfect for deep, meaningful conversations that strengthen your bond.'
      ],
      morning: [
        '☀️ Morning energy amplifies your natural compatibility. This is the perfect time for planning and goal-setting as a couple.',
        '🌞 The sun\'s energy enhances your communication and brings clarity to any relationship matters that need attention.',
        '💫 Morning is ideal for expressing appreciation and gratitude for each other\'s unique qualities.'
      ],
      afternoon: [
        '🌤️ Afternoon energy brings balance to your relationship dynamics. This is a great time for compromise and finding middle ground.',
        '☀️ The midday sun illuminates your shared values and helps you see eye-to-eye on important matters.',
        '🌟 Afternoon is perfect for collaborative activities and working together toward common goals.'
      ],
      evening: [
        '🌙 Evening energy deepens your emotional connection. This is the ideal time for intimate conversations and reflection.',
        '🌆 As the day winds down, your relationship benefits from quiet moments of togetherness and understanding.',
        '✨ Evening brings out the romantic and spiritual aspects of your connection. Embrace the peaceful energy.'
      ]
    };

    insights.push(timeInsights[timeOfDay][Math.floor(Math.random() * timeInsights[timeOfDay].length)]);

    // Add planetary hour insights
    const planetaryHour = this.getPlanetaryHour(currentDate);
    if (planetaryHour) {
      insights.push(`🪐 The current planetary hour is ruled by ${planetaryHour}, enhancing ${this.getPlanetaryHourInfluence(planetaryHour)} in your relationship.`);
    }

    return insights;
  }

  // Generate insights that change daily
  private static generateDailyInsights(
    chart1: PlanetaryPosition[],
    chart2: PlanetaryPosition[],
    aspects: Array<{ planet1: string; planet2: string; aspect: string; orb: number }>,
    dayOfYear: number
  ): string[] {
    const insights: string[] = [];
    
    // Daily themes based on day of year
    const dailyThemes = [
      '🌱 Today\'s cosmic energy favors new beginnings in your relationship. Consider starting a new tradition together.',
      '💫 The stars align for deep conversations about your future together. Share your dreams and aspirations.',
      '🌟 Today brings opportunities for healing and forgiveness. Address any lingering issues with compassion.',
      '✨ The cosmic energy supports creative expression in your relationship. Try something new and exciting together.',
      '🌙 Today\'s energy enhances your intuitive connection. Trust your instincts about each other.',
      '☀️ The sun\'s influence brings warmth and joy to your relationship. Focus on the positive aspects of your bond.',
      '🌊 Today\'s energy supports emotional flow and understanding. Be open and vulnerable with each other.',
      '🔥 Passion and desire are heightened today. Embrace the romantic energy between you.',
      '🌍 The cosmic energy encourages you to explore new places and experiences together.',
      '💎 Today brings clarity to your relationship goals. Take time to align your visions for the future.'
    ];

    const themeIndex = dayOfYear % dailyThemes.length;
    insights.push(dailyThemes[themeIndex]);

    // Add moon phase insights
    const moonPhase = this.getMoonPhase(dayOfYear);
    insights.push(`🌙 The ${moonPhase} moon influences your emotional connection today, bringing ${this.getMoonPhaseInfluence(moonPhase)}.`);

    return insights;
  }

  // Generate contextual insights based on relationship phase
  static generateContextualInsights(
    relationshipType: string,
    relationshipDuration?: number,
    compatibilityScore?: number
  ): string[] {
    const insights: string[] = [];
    
    // Determine relationship phase based on type and duration
    const phase = this.determineRelationshipPhase(relationshipType, relationshipDuration);
    
    // Generate phase-specific insights
    const phaseInsights = this.getPhaseSpecificInsights(phase, relationshipType, compatibilityScore);
    insights.push(...phaseInsights);
    
    // Add compatibility-based contextual insights
    if (compatibilityScore !== undefined) {
      const compatibilityInsights = this.getCompatibilityContextualInsights(compatibilityScore, phase);
      insights.push(...compatibilityInsights);
    }
    
    return insights;
  }

  // Determine relationship phase
  private static determineRelationshipPhase(relationshipType: string, duration?: number): string {
    if (!duration) {
      // Default phases based on relationship type
      switch (relationshipType) {
        case 'dating':
          return 'early_dating';
        case 'marriage':
          return 'committed';
        case 'friendship':
          return 'established';
        case 'family':
          return 'lifelong';
        case 'colleagues':
          return 'professional';
        default:
          return 'exploring';
      }
    }
    
    // Duration-based phases (in days)
    if (duration < 30) return 'new';
    if (duration < 90) return 'early';
    if (duration < 365) return 'developing';
    if (duration < 1095) return 'established'; // 3 years
    return 'mature';
  }

  // Get phase-specific insights
  private static getPhaseSpecificInsights(phase: string, relationshipType: string, compatibilityScore?: number): string[] {
    const insights: string[] = [];
    
    switch (phase) {
      case 'new':
        insights.push('🌱 This is the exciting beginning phase! The stars encourage you to explore each other\'s worlds with curiosity and openness.');
        insights.push('💫 Early relationship energy is about discovery. Pay attention to how you feel when you\'re together - your intuition is your guide.');
        break;
        
      case 'early':
        insights.push('🌿 Your connection is deepening! This phase is about building trust and understanding each other\'s communication styles.');
        insights.push('✨ The cosmic energy supports honest conversations about your values, goals, and what you\'re looking for in a relationship.');
        break;
        
      case 'developing':
        insights.push('🌳 Your relationship is growing stronger! This phase brings opportunities to navigate challenges together and build deeper intimacy.');
        insights.push('🌟 The stars encourage you to create shared experiences and traditions that strengthen your bond.');
        break;
        
      case 'established':
        insights.push('🏗️ You\'ve built a solid foundation! This phase is about maintaining connection while allowing for individual growth.');
        insights.push('💎 The cosmic energy supports deepening your emotional and spiritual connection through shared values and goals.');
        break;
        
      case 'mature':
        insights.push('🌲 Your relationship has weathered many seasons! This phase is about appreciation, wisdom, and continued growth together.');
        insights.push('⭐ The stars celebrate your journey and encourage you to share your wisdom with others while continuing to evolve together.');
        break;
        
      case 'early_dating':
        insights.push('💕 The dating phase is about exploration and fun! Enjoy getting to know each other through shared activities and conversations.');
        insights.push('🎭 This is the perfect time to discover each other\'s interests, values, and what makes you both unique.');
        break;
        
      case 'committed':
        insights.push('💍 Commitment brings its own cosmic energy! The stars support your dedication to building a life together.');
        insights.push('🤝 This phase is about partnership, shared responsibilities, and creating a home together in every sense of the word.');
        break;
        
      case 'lifelong':
        insights.push('👨‍👩‍👧‍👦 Family bonds are sacred cosmic connections! The stars honor your commitment to each other and your shared legacy.');
        insights.push('🌍 Your relationship serves as a foundation for others, creating ripples of love and stability in your family and community.');
        break;
        
      case 'professional':
        insights.push('💼 Professional relationships have their own cosmic dynamics! The stars encourage mutual respect and clear communication.');
        insights.push('🤝 This phase is about collaboration, supporting each other\'s growth, and maintaining healthy boundaries.');
        break;
        
      default:
        insights.push('🌟 Every relationship phase has its own cosmic wisdom. Trust the journey and stay open to the lessons each phase brings.');
    }
    
    return insights;
  }

  // Get compatibility-based contextual insights
  private static getCompatibilityContextualInsights(score: number, phase: string): string[] {
    const insights: string[] = [];
    
    if (score >= 90) {
      insights.push('🌟 Exceptional compatibility! The stars have aligned perfectly for your relationship. Trust in your cosmic connection.');
    } else if (score >= 80) {
      insights.push('✨ High compatibility creates a strong foundation! Your cosmic connection supports growth and harmony in this phase.');
    } else if (score >= 70) {
      insights.push('💫 Good compatibility provides a solid base! The stars encourage you to work together to maximize your potential.');
    } else if (score >= 60) {
      insights.push('🌱 Moderate compatibility offers growth opportunities! This phase is perfect for learning and evolving together.');
    } else {
      insights.push('🌊 Different energies can create beautiful dynamics! The stars encourage you to embrace your differences as strengths.');
    }
    
    return insights;
  }

  // Generate insights that change weekly
  private static generateWeeklyInsights(
    chart1: PlanetaryPosition[],
    chart2: PlanetaryPosition[],
    aspects: Array<{ planet1: string; planet2: string; aspect: string; orb: number }>,
    weekOfYear: number
  ): string[] {
    const insights: string[] = [];
    
    // Weekly themes
    const weeklyThemes = [
      '🌟 This week\'s cosmic energy emphasizes communication and understanding in your relationship.',
      '💕 The stars align for romance and deepening your emotional connection this week.',
      '🌱 This week brings opportunities for growth and expansion in your relationship.',
      '⚖️ The cosmic energy this week supports balance and harmony in your partnership.',
      '🔥 This week\'s energy amplifies passion and desire in your relationship.',
      '🌙 The stars encourage introspection and spiritual connection this week.',
      '☀️ This week\'s energy brings joy and celebration to your relationship.',
      '🌊 The cosmic energy this week supports emotional healing and renewal.',
      '💫 This week brings opportunities for adventure and new experiences together.',
      '🏗️ The stars align for building and strengthening your relationship foundation this week.'
    ];

    const themeIndex = weekOfYear % weeklyThemes.length;
    insights.push(weeklyThemes[themeIndex]);

    return insights;
  }

  // Generate insights based on current planetary transits
  private static async generateTransitBasedInsights(
    chart1: PlanetaryPosition[],
    chart2: PlanetaryPosition[],
    currentDate: Date
  ): Promise<string[]> {
    const insights: string[] = [];
    
    try {
      // Get current planetary positions for transit analysis
      const currentPositions = await this.getCurrentPlanetaryPositions(currentDate);
      
      // Analyze transits to natal planets
      const transits = this.analyzeTransits(chart1, currentPositions);
      
      if (transits.length > 0) {
        insights.push(`🪐 Current planetary transits are influencing your relationship: ${transits[0].description}`);
        
        if (transits.length > 1) {
          insights.push(`✨ Additional cosmic influences: ${transits[1].description}`);
        }
      } else {
        insights.push('🌟 The current cosmic climate is stable, providing a harmonious backdrop for your relationship.');
      }
    } catch (error) {
      console.error('Error generating transit-based insights:', error);
      insights.push('🌌 The cosmic energies are flowing smoothly, supporting your relationship\'s natural rhythm.');
    }

    return insights;
  }

  // Generate personalized insights based on user data and relationship history
  static generatePersonalizedInsights(
    userData: any,
    partnerData: any,
    relationshipHistory: any[] = []
  ): string[] {
    const insights: string[] = [];
    
    // Analyze user's zodiac sign for personalized insights
    const userSign = userData.zodiacSign;
    const partnerSign = this.getZodiacSignFromDate(new Date(partnerData.birthDate));
    
    // Personalized insights based on zodiac compatibility
    const personalizedInsights = this.getZodiacPersonalizedInsights(userSign, partnerSign);
    insights.push(...personalizedInsights);
    
    // Relationship history insights
    if (relationshipHistory.length > 0) {
      const historyInsights = this.getRelationshipHistoryInsights(relationshipHistory);
      insights.push(...historyInsights);
    }
    
    // User preference insights
    const preferenceInsights = this.getUserPreferenceInsights(userData);
    insights.push(...preferenceInsights);
    
    return insights;
  }

  // Get personalized insights based on zodiac signs
  private static getZodiacPersonalizedInsights(userSign: string, partnerSign: string): string[] {
    const insights: string[] = [];
    
    // Element compatibility
    const userElement = this.getZodiacElement(userSign);
    const partnerElement = this.getZodiacElement(partnerSign);
    
    if (userElement === partnerElement) {
      insights.push(`🔥 Both ${userSign} and ${partnerSign} share the ${userElement} element, creating natural understanding and similar approaches to life.`);
    } else if (this.areElementsCompatible(userElement, partnerElement)) {
      insights.push(`⚖️ ${userSign} (${userElement}) and ${partnerSign} (${partnerElement}) have compatible elements that balance and complement each other beautifully.`);
    } else {
      insights.push(`🌊 ${userSign} (${userElement}) and ${partnerSign} (${partnerElement}) have contrasting elements that can create exciting dynamics and opportunities for growth.`);
    }
    
    // Modality compatibility
    const userModality = this.getZodiacModality(userSign);
    const partnerModality = this.getZodiacModality(partnerSign);
    
    if (userModality === partnerModality) {
      insights.push(`🎯 Both signs share the ${userModality} modality, meaning you approach life with similar energy and timing.`);
    } else {
      insights.push(`⏰ Your different modalities (${userModality} vs ${partnerModality}) can create a dynamic balance in your relationship.`);
    }
    
    return insights;
  }

  // Get insights based on relationship history
  private static getRelationshipHistoryInsights(history: any[]): string[] {
    const insights: string[] = [];
    
    if (history.length === 0) return insights;
    
    // Analyze patterns in relationship history
    const avgScore = history.reduce((sum, item) => sum + item.score, 0) / history.length;
    const relationshipTypes = [...new Set(history.map(item => item.relationshipType))];
    
    if (avgScore > 80) {
      insights.push('🌟 Your relationship history shows consistently high compatibility scores, indicating strong cosmic alignment in your connections.');
    } else if (avgScore > 60) {
      insights.push('💫 Your relationship history reveals good compatibility patterns, with room for growth and deeper connection.');
    } else {
      insights.push('🌱 Your relationship history shows diverse compatibility experiences, suggesting opportunities for learning and evolution.');
    }
    
    if (relationshipTypes.length > 1) {
      insights.push(`🎭 You've explored ${relationshipTypes.length} different types of relationships, showing versatility in your cosmic connections.`);
    }
    
    return insights;
  }

  // Get insights based on user preferences
  private static getUserPreferenceInsights(userData: any): string[] {
    const insights: string[] = [];
    
    // Reading streak insights
    if (userData.readingStreak > 7) {
      insights.push('📚 Your consistent engagement with cosmic guidance shows deep commitment to understanding your relationships through the stars.');
    }
    
    // Cosmic rating insights
    if (userData.cosmicRating > 4) {
      insights.push('⭐ Your high cosmic rating reflects your natural attunement to celestial energies and relationship dynamics.');
    }
    
    // Lucky numbers insights
    if (userData.luckyNumbers && userData.luckyNumbers.length > 0) {
      const luckyNumber = userData.luckyNumbers[0];
      insights.push(`🔢 Your lucky number ${luckyNumber} influences your relationship timing and compatibility patterns.`);
    }
    
    return insights;
  }

  // Helper methods for zodiac analysis
  private static getZodiacElement(sign: string): string {
    const elements: { [key: string]: string } = {
      'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
      'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
      'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
      'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
    };
    return elements[sign] || 'Unknown';
  }

  private static getZodiacModality(sign: string): string {
    const modalities: { [key: string]: string } = {
      'Aries': 'Cardinal', 'Cancer': 'Cardinal', 'Libra': 'Cardinal', 'Capricorn': 'Cardinal',
      'Taurus': 'Fixed', 'Leo': 'Fixed', 'Scorpio': 'Fixed', 'Aquarius': 'Fixed',
      'Gemini': 'Mutable', 'Virgo': 'Mutable', 'Sagittarius': 'Mutable', 'Pisces': 'Mutable'
    };
    return modalities[sign] || 'Unknown';
  }

  private static areElementsCompatible(element1: string, element2: string): boolean {
    const compatiblePairs = [
      ['Fire', 'Air'],
      ['Earth', 'Water'],
      ['Air', 'Fire'],
      ['Water', 'Earth']
    ];
    
    return compatiblePairs.some(pair => 
      (pair[0] === element1 && pair[1] === element2) ||
      (pair[0] === element2 && pair[1] === element1)
    );
  }

  // Get zodiac sign from birth date
  private static getZodiacSignFromDate(date: Date): string {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
    return 'Pisces';
  }

  // Refresh insights for existing compatibility result
  static async refreshInsights(
    existingResult: CompatibilityResult,
    userData?: any,
    relationshipHistory?: any[]
  ): Promise<CompatibilityResult> {
    try {
      const currentDate = new Date();
      
      // Check if insights need refreshing
      const lastUpdated = new Date(existingResult.lastUpdated);
      const daysSinceUpdate = Math.floor((currentDate.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
      
      // Generate fresh dynamic insights
      const freshDynamicInsights = await this.generateDynamicInsights(
        [], // We don't have the original charts, so we'll generate general insights
        [],
        []
      );
      
      // Generate fresh personalized insights if user data is provided
      let freshPersonalizedInsights: string[] = [];
      if (userData) {
        freshPersonalizedInsights = this.generatePersonalizedInsights(
          userData,
          { birthDate: new Date() }, // Placeholder
          relationshipHistory || []
        );
      }
      
      // Generate fresh contextual insights
      const freshContextualInsights = this.generateContextualInsights(
        userData?.relationshipType || 'dating',
        userData?.relationshipDuration,
        existingResult.overallScore
      );
      
      // Update the result with fresh insights
      const updatedResult = {
        ...existingResult,
        dynamicInsights: freshDynamicInsights,
        insights: [...existingResult.insights, ...freshPersonalizedInsights, ...freshContextualInsights],
        lastUpdated: currentDate,
        insightRotationIndex: (existingResult.insightRotationIndex + 1) % 4
      };
      
      return updatedResult;
    } catch (error) {
      console.error('Error refreshing insights:', error);
      return existingResult; // Return original result if refresh fails
    }
  }

  // Check if insights should be refreshed
  static shouldRefreshInsights(lastUpdated: Date): boolean {
    const currentDate = new Date();
    const hoursSinceUpdate = (currentDate.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
    
    // Refresh current insights every 4 hours, daily insights every 24 hours
    return hoursSinceUpdate >= 4;
  }

  // Helper methods for dynamic insights
  private static getPlanetaryHour(currentDate: Date): string | null {
    const hour = currentDate.getHours();
    const dayOfWeek = currentDate.getDay();
    
    // Planetary hours (simplified)
    const planetaryHours = [
      ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'], // Sunday
      ['Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury'], // Monday
      ['Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter'], // Tuesday
      ['Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus'], // Wednesday
      ['Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn'], // Thursday
      ['Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun'], // Friday
      ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon']  // Saturday
    ];
    
    const hourIndex = Math.floor(hour / 3.43); // Approximate planetary hour
    return planetaryHours[dayOfWeek][hourIndex] || null;
  }

  private static getPlanetaryHourInfluence(planet: string): string {
    const influences: { [key: string]: string } = {
      'Sun': 'leadership and vitality',
      'Moon': 'emotions and intuition',
      'Mercury': 'communication and intellect',
      'Venus': 'love and harmony',
      'Mars': 'passion and action',
      'Jupiter': 'growth and wisdom',
      'Saturn': 'structure and commitment'
    };
    
    return influences[planet] || 'cosmic energy';
  }

  private static getMoonPhase(dayOfYear: number): string {
    const moonPhases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 
                       'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
    const phaseIndex = Math.floor((dayOfYear / 365) * 8) % 8;
    return moonPhases[phaseIndex];
  }

  private static getMoonPhaseInfluence(phase: string): string {
    const influences: { [key: string]: string } = {
      'New Moon': 'new beginnings and fresh starts',
      'Waxing Crescent': 'growth and intention setting',
      'First Quarter': 'action and decision making',
      'Waxing Gibbous': 'refinement and adjustment',
      'Full Moon': 'culmination and emotional intensity',
      'Waning Gibbous': 'gratitude and sharing',
      'Last Quarter': 'release and letting go',
      'Waning Crescent': 'rest and reflection'
    };
    
    return influences[phase] || 'lunar energy';
  }

  private static async getCurrentPlanetaryPositions(currentDate: Date): Promise<PlanetaryPosition[]> {
    // This would ideally fetch current planetary positions from an astronomical API
    // For now, we'll return a simplified version
    const positions: PlanetaryPosition[] = [];
    
    // Simplified current positions (in a real implementation, this would call an astronomical API)
    const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    
    planets.forEach(planet => {
      const signIndex = (currentDate.getDate() + planets.indexOf(planet)) % 12;
      positions.push({
        planet,
        zodiacSign: signs[signIndex],
        rightAscension: 0,
        declination: 0,
        distance: 0
      });
    });
    
    return positions;
  }

  private static analyzeTransits(
    natalCharts: PlanetaryPosition[],
    currentPositions: PlanetaryPosition[]
  ): Array<{ planet: string; aspect: string; description: string }> {
    const transits: Array<{ planet: string; aspect: string; description: string }> = [];
    
    // Simplified transit analysis
    for (const current of currentPositions) {
      for (const natal of natalCharts) {
        if (current.planet === natal.planet) {
          const aspect = this.calculateAspect(current, natal);
          if (aspect) {
            transits.push({
              planet: current.planet,
              aspect: aspect.name,
              description: `${current.planet} ${aspect.name} your natal ${natal.planet} brings ${this.getTransitInfluence(current.planet, aspect.name)}`
            });
          }
        }
      }
    }
    
    return transits;
  }

  private static getTransitInfluence(planet: string, aspect: string): string {
    const influences: { [key: string]: { [key: string]: string } } = {
      'sun': {
        'Conjunction': 'vitality and self-expression',
        'Trine': 'confidence and creativity',
        'Square': 'challenges that lead to growth',
        'Opposition': 'balance between self and others'
      },
      'moon': {
        'Conjunction': 'emotional intensity and intuition',
        'Trine': 'emotional harmony and nurturing',
        'Square': 'emotional challenges and growth',
        'Opposition': 'emotional balance and understanding'
      },
      'venus': {
        'Conjunction': 'love and beauty',
        'Trine': 'harmony and attraction',
        'Square': 'relationship challenges',
        'Opposition': 'balance in love and values'
      }
    };
    
    return influences[planet]?.[aspect] || 'cosmic influence';
  }
}

