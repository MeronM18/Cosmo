// src/services/celestialEventsService.ts
// MVP Implementation: Hardcoded 2025-2026 Astronomical Events
// These events are predictable years in advance and provide reliable data

export interface CelestialEvent {
  id: string;
  name: string;
  type: 'eclipse' | 'retrograde' | 'station' | 'seasonal' | 'moon_phase' | 'meteor_shower' | 'supermoon';
  startDate: Date;
  endDate?: Date;
  description: string;
  impactLevel: 'high' | 'medium' | 'low';
  preparationTips: string[];
  affectedSigns: string[];
  isRealTime?: boolean;
}

export class CelestialEventsService {
  
  // Get upcoming celestial events (hardcoded 2025-2026 data)
  static async getUpcomingEvents(daysAhead: number = 365): Promise<CelestialEvent[]> {
    const now = new Date();
    
    // Get all hardcoded events for 2025-2026
    const allEvents = this.getHardcodedEvents();
    
    // Filter to upcoming events within the specified timeframe
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    
    return allEvents
      .filter(event => event.startDate > now && event.startDate <= futureDate)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, 15); // Show next 15 events
  }
  
  // Hardcoded 2025-2026 Astronomical Events
  private static getHardcodedEvents(): CelestialEvent[] {
    return [
      // ECLIPSES 2025
      {
        id: 'eclipse-2025-03-14',
        name: 'Total Lunar Eclipse',
        type: 'eclipse',
        startDate: new Date('2025-03-14'),
        description: 'A powerful total lunar eclipse in Virgo brings deep transformation and release. The moon will turn a dramatic red color.',
        impactLevel: 'high',
        preparationTips: [
          'Release old patterns and habits',
          'Practice deep meditation',
          'Avoid making major decisions',
          'Focus on emotional healing'
        ],
        affectedSigns: ['Virgo', 'Pisces', 'Gemini', 'Sagittarius'],
        isRealTime: false
      },
      {
        id: 'eclipse-2025-03-29',
        name: 'Partial Solar Eclipse',
        type: 'eclipse',
        startDate: new Date('2025-03-29'),
        description: 'A partial solar eclipse in Aries marks new beginnings and fresh starts. Perfect time for setting intentions.',
        impactLevel: 'high',
        preparationTips: [
          'Set new goals and intentions',
          'Start new projects',
          'Take inspired action',
          'Embrace change and growth'
        ],
        affectedSigns: ['Aries', 'Libra', 'Cancer', 'Capricorn'],
        isRealTime: false
      },
      {
        id: 'eclipse-2025-09-07',
        name: 'Total Lunar Eclipse',
        type: 'eclipse',
        startDate: new Date('2025-09-07'),
        description: 'A total lunar eclipse in Pisces brings emotional culmination and spiritual awakening.',
        impactLevel: 'high',
        preparationTips: [
          'Practice forgiveness and compassion',
          'Connect with your spiritual side',
          'Release emotional baggage',
          'Trust your intuition'
        ],
        affectedSigns: ['Pisces', 'Virgo', 'Sagittarius', 'Gemini'],
        isRealTime: false
      },
      {
        id: 'eclipse-2025-09-21',
        name: 'Partial Solar Eclipse',
        type: 'eclipse',
        startDate: new Date('2025-09-21'),
        description: 'A partial solar eclipse in Virgo brings focus on health, service, and practical improvements.',
        impactLevel: 'high',
        preparationTips: [
          'Focus on health and wellness',
          'Organize and declutter',
          'Help others and serve',
          'Improve daily routines'
        ],
        affectedSigns: ['Virgo', 'Pisces', 'Gemini', 'Sagittarius'],
        isRealTime: false
      },

      // SPECIAL MOONS 2025
      {
        id: 'moon-2025-01-13',
        name: 'Wolf Moon (Full)',
        type: 'moon_phase',
        startDate: new Date('2025-01-13'),
        description: 'The Wolf Moon in Cancer brings emotional intensity and family connections. Named for the wolves howling in winter.',
        impactLevel: 'medium',
        preparationTips: [
          'Connect with family and loved ones',
          'Trust your emotions and intuition',
          'Create a cozy, nurturing environment',
          'Practice self-care and emotional healing'
        ],
        affectedSigns: ['Cancer', 'Capricorn', 'Aries', 'Libra'],
        isRealTime: false
      },
      {
        id: 'moon-2025-02-12',
        name: 'Snow Moon (Full)',
        type: 'moon_phase',
        startDate: new Date('2025-02-12'),
        description: 'The Snow Moon in Leo brings creativity, confidence, and self-expression. Named for the heavy snowfall of February.',
        impactLevel: 'medium',
        preparationTips: [
          'Express your authentic self',
          'Engage in creative activities',
          'Build confidence and self-esteem',
          'Share your talents with others'
        ],
        affectedSigns: ['Leo', 'Aquarius', 'Taurus', 'Scorpio'],
        isRealTime: false
      },
      {
        id: 'moon-2025-03-14',
        name: 'Worm Moon (Full/Eclipse)',
        type: 'eclipse',
        startDate: new Date('2025-03-14'),
        description: 'The Worm Moon coincides with a total lunar eclipse, bringing powerful transformation and renewal.',
        impactLevel: 'high',
        preparationTips: [
          'Embrace transformation and change',
          'Release what no longer serves',
          'Prepare for new beginnings',
          'Trust the process of renewal'
        ],
        affectedSigns: ['Virgo', 'Pisces', 'Gemini', 'Sagittarius'],
        isRealTime: false
      },
      {
        id: 'moon-2025-04-13',
        name: 'Pink Moon (Full)',
        type: 'moon_phase',
        startDate: new Date('2025-04-13'),
        description: 'The Pink Moon in Libra brings balance, harmony, and relationship focus. Named for the pink wildflowers of spring.',
        impactLevel: 'medium',
        preparationTips: [
          'Focus on relationships and partnerships',
          'Seek balance in all areas of life',
          'Practice diplomacy and fairness',
          'Appreciate beauty and art'
        ],
        affectedSigns: ['Libra', 'Aries', 'Cancer', 'Capricorn'],
        isRealTime: false
      },
      {
        id: 'moon-2025-05-12',
        name: 'Flower Moon (Full)',
        type: 'moon_phase',
        startDate: new Date('2025-05-12'),
        description: 'The Flower Moon in Scorpio brings intensity, transformation, and deep emotional insights.',
        impactLevel: 'medium',
        preparationTips: [
          'Embrace transformation and rebirth',
          'Explore your deeper emotions',
          'Practice letting go and releasing',
          'Connect with your inner power'
        ],
        affectedSigns: ['Scorpio', 'Taurus', 'Leo', 'Aquarius'],
        isRealTime: false
      },
      {
        id: 'moon-2025-08-19',
        name: 'Sturgeon Moon (Full/Supermoon)',
        type: 'supermoon',
        startDate: new Date('2025-08-19'),
        description: 'The Sturgeon Moon is a supermoon in Aquarius, bringing innovation, humanitarian focus, and amplified lunar energy.',
        impactLevel: 'high',
        preparationTips: [
          'Focus on innovation and progress',
          'Connect with friends and community',
          'Embrace your unique individuality',
          'Work for humanitarian causes'
        ],
        affectedSigns: ['Aquarius', 'Leo', 'Taurus', 'Scorpio'],
        isRealTime: false
      },

      // METEOR SHOWERS 2025
      {
        id: 'meteor-2025-01-03',
        name: 'Quadrantids Meteor Shower',
        type: 'meteor_shower',
        startDate: new Date('2025-01-03'),
        endDate: new Date('2025-01-04'),
        description: 'The Quadrantids meteor shower peaks with up to 120 meteors per hour. One of the most intense annual meteor showers.',
        impactLevel: 'medium',
        preparationTips: [
          'Find a dark location away from city lights',
          'Look northeast after midnight',
          'Bring warm clothing and blankets',
          'Allow 30 minutes for eyes to adjust to darkness'
        ],
        affectedSigns: ['Capricorn', 'Cancer', 'Aries', 'Libra'],
        isRealTime: false
      },
      {
        id: 'meteor-2025-04-22',
        name: 'Lyrids Meteor Shower',
        type: 'meteor_shower',
        startDate: new Date('2025-04-22'),
        description: 'The Lyrids meteor shower peaks with up to 20 meteors per hour. Known for bright, fast meteors with persistent trains.',
        impactLevel: 'low',
        preparationTips: [
          'Look toward the constellation Lyra',
          'Best viewing after midnight',
          'Watch for bright, fast meteors',
          'Enjoy the spring night sky'
        ],
        affectedSigns: ['Taurus', 'Scorpio', 'Leo', 'Aquarius'],
        isRealTime: false
      },
      {
        id: 'meteor-2025-08-11',
        name: 'Perseids Meteor Shower',
        type: 'meteor_shower',
        startDate: new Date('2025-08-11'),
        endDate: new Date('2025-08-12'),
        description: 'The Perseids meteor shower peaks with up to 100 meteors per hour. One of the most popular meteor showers of the year.',
        impactLevel: 'high',
        preparationTips: [
          'Find a dark location with clear skies',
          'Look toward the constellation Perseus',
          'Best viewing after midnight',
          'Bring comfortable seating and snacks'
        ],
        affectedSigns: ['Leo', 'Aquarius', 'Taurus', 'Scorpio'],
        isRealTime: false
      },
      {
        id: 'meteor-2025-12-13',
        name: 'Geminids Meteor Shower',
        type: 'meteor_shower',
        startDate: new Date('2025-12-13'),
        endDate: new Date('2025-12-14'),
        description: 'The Geminids meteor shower peaks with up to 120 meteors per hour. Known for bright, colorful meteors.',
        impactLevel: 'high',
        preparationTips: [
          'Look toward the constellation Gemini',
          'Best viewing after 10 PM',
          'Dress warmly for winter weather',
          'Watch for bright, colorful meteors'
        ],
        affectedSigns: ['Sagittarius', 'Gemini', 'Virgo', 'Pisces'],
        isRealTime: false
      },

      // SEASONAL EVENTS 2025
      {
        id: 'seasonal-2025-03-20',
        name: 'Spring Equinox',
        type: 'seasonal',
        startDate: new Date('2025-03-20'),
        description: 'The spring equinox marks the beginning of Aries season and the astrological new year. Perfect time for new beginnings.',
        impactLevel: 'high',
        preparationTips: [
          'Set new intentions for the year',
          'Plant seeds for future goals',
          'Embrace fresh starts and new energy',
          'Take inspired action on your dreams'
        ],
        affectedSigns: ['Aries', 'Libra', 'Cancer', 'Capricorn'],
        isRealTime: false
      },
      {
        id: 'seasonal-2025-06-21',
        name: 'Summer Solstice',
        type: 'seasonal',
        startDate: new Date('2025-06-21'),
        description: 'The summer solstice marks the peak of solar energy and the beginning of Cancer season. Time for emotional nurturing.',
        impactLevel: 'high',
        preparationTips: [
          'Celebrate your achievements',
          'Spend time in nature',
          'Focus on emotional well-being',
          'Nurture your relationships'
        ],
        affectedSigns: ['Cancer', 'Capricorn', 'Aries', 'Libra'],
        isRealTime: false
      },
      {
        id: 'seasonal-2025-09-22',
        name: 'Autumn Equinox',
        type: 'seasonal',
        startDate: new Date('2025-09-22'),
        description: 'The autumn equinox marks the beginning of Libra season and the time of balance and harvest.',
        impactLevel: 'high',
        preparationTips: [
          'Seek balance in all areas of life',
          'Harvest the fruits of your labor',
          'Focus on relationships and partnerships',
          'Prepare for the introspective winter'
        ],
        affectedSigns: ['Libra', 'Aries', 'Cancer', 'Capricorn'],
        isRealTime: false
      },
      {
        id: 'seasonal-2025-12-21',
        name: 'Winter Solstice',
        type: 'seasonal',
        startDate: new Date('2025-12-21'),
        description: 'The winter solstice marks the beginning of Capricorn season and the return of light. Time for reflection and planning.',
        impactLevel: 'high',
        preparationTips: [
          'Reflect on the past year',
          'Plan for the future',
          'Focus on structure and discipline',
          'Celebrate the return of light'
        ],
        affectedSigns: ['Capricorn', 'Cancer', 'Aries', 'Libra'],
        isRealTime: false
      }
    ];
  }
  
  // Test the service
  static async testService(): Promise<{ success: boolean; eventCount: number; error?: string }> {
    try {
      const events = await this.getUpcomingEvents(30);
      return {
        success: true,
        eventCount: events.length
      };
    } catch (error: any) {
      return {
        success: false,
        eventCount: 0,
        error: error.message
      };
    }
  }
}
