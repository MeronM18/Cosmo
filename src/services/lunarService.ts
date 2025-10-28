import * as SunCalc from 'suncalc';
import * as Location from 'expo-location';

export interface MoonPhaseData {
  phase: string;
  illumination: number;
  daysUntilNext: number;
  hoursUntilNext: number;
  zodiacPosition: string;
  zodiacSymbol: string;
  element: string;
  nextPhase: string;
  nextPhaseDate: Date;
}

export interface MoonriseData {
  moonrise: string;
  moonset: string;
  nextMoonrise: string;
  moonriseDate: Date | null;
  moonsetDate: Date | null;
}

export interface LunarEnergy {
  level: number;
  mood: string;
  recommendation: string;
  doToday: string;
  avoidToday: string;
  meditationFocus: string;
  ritualSuggestion: string;
  ritualGuidance: {
    primary: {
      title: string;
      icon: string;
      color: string;
      steps: string[];
      description: string;
    };
    secondary: {
      title: string;
      icon: string;
      color: string;
      steps: string[];
      description: string;
    };
    tertiary: {
      title: string;
      icon: string;
      color: string;
      steps: string[];
      description: string;
    };
  };
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

class LunarService {
  private static instance: LunarService;
  private userLocation: UserLocation | null = null;
  private locationPermissionGranted: boolean = false;

  private constructor() {}

  public static getInstance(): LunarService {
    if (!LunarService.instance) {
      LunarService.instance = new LunarService();
    }
    return LunarService.instance;
  }

  // Request location permission and get user coordinates
  public async requestLocationPermission(): Promise<boolean> {
    try {
      // First check if we already have permission
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      
      if (existingStatus === 'granted') {
        this.locationPermissionGranted = true;
        await this.getCurrentLocation();
        return true;
      }
      
      // Request permission if we don't have it
      const { status } = await Location.requestForegroundPermissionsAsync();
      this.locationPermissionGranted = status === 'granted';
      
      if (this.locationPermissionGranted) {
        await this.getCurrentLocation();
      }
      
      return this.locationPermissionGranted;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      this.locationPermissionGranted = false;
      return false;
    }
  }

  // Get current user location
  private async getCurrentLocation(): Promise<void> {
    // Check device location services status
    await this.checkLocationServicesStatus();
    
    // Try multiple location attempts with different accuracy settings
    const locationAttempts = [
      {
        name: 'High Accuracy GPS',
        options: {
          accuracy: Location.Accuracy.BestForNavigation,
          timeout: 30000, // 30 second timeout for GPS satellite fix
          maximumAge: 5000, // Use very recent data only
        }
      },
      {
        name: 'Balanced GPS',
        options: {
          accuracy: Location.Accuracy.Balanced,
          timeout: 20000, // 20 second timeout
          maximumAge: 10000, // Accept up to 10 seconds old
        }
      },
      {
        name: 'Low Accuracy Fallback',
        options: {
          accuracy: Location.Accuracy.Lowest,
          timeout: 15000, // 15 second timeout
          maximumAge: 30000, // Accept up to 30 seconds old
        }
      }
    ];

    let lastError: Error | null = null;

    for (let i = 0; i < locationAttempts.length; i++) {
      const attempt = locationAttempts[i];
      
      try {
        const location = await Location.getCurrentPositionAsync(attempt.options);
        
        // Validate coordinates are reasonable and not default values
        if (!this.isValidCoordinates(location.coords.latitude, location.coords.longitude)) {
          throw new Error(`Invalid coordinates received: ${location.coords.latitude}, ${location.coords.longitude}`);
        }
        
        this.userLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        // Get city name (optional)
        await this.getCityName();
        
        return; // Success, exit the function
        
      } catch (error) {
        lastError = error as Error;
        
        if (i < locationAttempts.length - 1) {
          continue; // Try next attempt
        }
      }
    }
    
    // All attempts failed
    throw lastError || new Error('Unable to get GPS location after multiple attempts');
  }

  // Check device location services status
  private async checkLocationServicesStatus(): Promise<void> {
    try {
      const isEnabled = await Location.hasServicesEnabledAsync();
      
      if (!isEnabled) {
        throw new Error('Location services are disabled on this device. Please enable location services in device settings.');
      }
      
      const permissions = await Location.getForegroundPermissionsAsync();
      
      if (permissions.status !== 'granted') {
        throw new Error('Location permission not granted. Please grant location permission to the app.');
      }
      
    } catch (error) {
      console.error('Location services check failed:', error);
      throw error;
    }
  }

  // Get city name via reverse geocoding
  private async getCityName(): Promise<void> {
    if (!this.userLocation) return;
    
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: this.userLocation.latitude,
        longitude: this.userLocation.longitude,
      });
      
      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        this.userLocation.city = address.city || address.subregion || address.region || undefined;
        this.userLocation.country = address.country || undefined;
      }
    } catch (geocodeError) {
      // Silently fail - city name is optional
    }
  }

  // Validate coordinates are within reasonable bounds
  private isValidCoordinates(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180 &&
      !isNaN(latitude) && !isNaN(longitude)
    );
  }


  // Get real moon phase data
  public getMoonPhaseData(date: Date = new Date()): MoonPhaseData {
    const moonIllumination = SunCalc.getMoonIllumination(date);
    const phase = this.getMoonPhaseName(moonIllumination.phase);
    const nextPhase = this.getNextMoonPhase(date);
    const nextPhaseDate = this.getNextMoonPhaseDate(date);
    
    // Calculate total time difference in milliseconds
    const totalTimeDiff = nextPhaseDate.getTime() - date.getTime();
    
    // Convert to days and hours with proper breakdown
    const totalDays = Math.floor(totalTimeDiff / (1000 * 60 * 60 * 24));
    const remainingHours = Math.floor((totalTimeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    const daysUntilNext = totalDays;
    const hoursUntilNext = remainingHours;

    return {
      phase,
      illumination: Math.round(moonIllumination.fraction * 100),
      daysUntilNext,
      hoursUntilNext,
      zodiacPosition: this.getMoonZodiacPosition(date),
      zodiacSymbol: this.getMoonZodiacPosition(date),
      element: this.getZodiacElement(this.getMoonZodiacPosition(date)),
      nextPhase,
      nextPhaseDate,
    };
  }

  // Get moonrise/moonset times
  public getMoonriseData(date: Date = new Date()): MoonriseData {
    if (!this.userLocation) {
      throw new Error('User location is required to calculate moonrise/moonset times. Please enable location services.');
    }

    try {
      const moonTimes = SunCalc.getMoonTimes(date, this.userLocation.latitude, this.userLocation.longitude);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextMoonTimes = SunCalc.getMoonTimes(nextDay, this.userLocation.latitude, this.userLocation.longitude);

      return {
        moonrise: moonTimes.rise ? this.formatTime(moonTimes.rise) : 'No moonrise',
        moonset: moonTimes.set ? this.formatTime(moonTimes.set) : 'No moonset',
        nextMoonrise: nextMoonTimes.rise ? this.formatTime(nextMoonTimes.rise) : 'No moonrise',
        moonriseDate: moonTimes.rise,
        moonsetDate: moonTimes.set,
      };
    } catch (error) {
      console.error('Error calculating moonrise/moonset:', error);
      throw new Error(`Failed to calculate moon times for your location: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Calculate lunar energy based on moon phase
  public getLunarEnergy(moonPhaseData: MoonPhaseData): LunarEnergy {
    const { phase, illumination } = moonPhaseData;
    
    let level: number;
    let mood: string;
    let recommendation: string;
    let doToday: string;
    let avoidToday: string;
    let meditationFocus: string;
    let ritualSuggestion: string;
    let ritualGuidance: any;

    switch (phase) {
      case 'New Moon':
        level = 3.0;
        mood = 'Introspective';
        recommendation = 'Perfect time for new beginnings and setting intentions.';
        doToday = 'Write in a journal';
        avoidToday = 'Making big decisions';
        meditationFocus = 'New beginnings';
        ritualSuggestion = 'Light a candle';
        ritualGuidance = {
          primary: {
            title: 'Intention Setting',
            icon: '🕯️',
            color: '#2F2F2F',
            steps: [
              'Light a white candle in a quiet space',
              'Write down 3 intentions for the lunar cycle',
              'Speak each intention aloud with conviction',
              'Visualize your intentions manifesting',
              'Blow out the candle and seal your intentions'
            ],
            description: 'Set powerful intentions during the dark moon for maximum manifestation potential.'
          },
          secondary: {
            title: 'Vision Board Creation',
            icon: '🎯',
            color: '#4A4A4A',
            steps: [
              'Gather magazines, images, and art supplies',
              'Create a visual representation of your goals',
              'Include words and phrases that inspire you',
              'Place in a prominent location for daily viewing',
              'Update monthly with new aspirations'
            ],
            description: 'Create a visual roadmap for your dreams and aspirations.'
          },
          tertiary: {
            title: 'New Moon Bath',
            icon: '🛁',
            color: '#6B6B6B',
            steps: [
              'Draw a warm bath with Epsom salts',
              'Add a few drops of lavender essential oil',
              'Light candles around the bathroom',
              'Soak for 20-30 minutes in silence',
              'Visualize washing away old patterns'
            ],
            description: 'Cleanse your energy and prepare for new beginnings.'
          }
        };
        break;
      case 'Waxing Crescent':
        level = 4.5;
        mood = 'Hopeful';
        recommendation = 'Focus on growth and taking action toward your goals.';
        doToday = 'Take a walk outside';
        avoidToday = 'Overwhelming yourself';
        meditationFocus = 'Growth & progress';
        ritualSuggestion = 'Plant something';
        break;
      case 'First Quarter':
        level = 6.0;
        mood = 'Determined';
        recommendation = 'Push through challenges and make important decisions.';
        doToday = 'Exercise or run';
        avoidToday = 'Procrastinating';
        meditationFocus = 'Strength & courage';
        ritualSuggestion = 'Make a decision';
        break;
      case 'Waxing Gibbous':
        level = 7.5;
        mood = 'Motivated';
        recommendation = 'Refine your plans and stay committed to your path.';
        doToday = 'Work on your goals';
        avoidToday = 'Being too critical';
        meditationFocus = 'Commitment';
        ritualSuggestion = 'Review your plans';
        break;
      case 'Full Moon':
        level = 9.0;
        mood = 'Powerful';
        recommendation = 'Harness the peak energy for manifestation and release.';
        doToday = 'Run into the sun';
        avoidToday = 'Emotional overwhelm';
        meditationFocus = 'Peak energy';
        ritualSuggestion = 'Full moon ritual';
        ritualGuidance = {
          primary: {
            title: 'Full Moon Release',
            icon: '🌕',
            color: '#F5F5DC',
            steps: [
              'Write down what you want to release',
              'Light a fire or candle safely',
              'Burn the paper while stating your release',
              'Watch the smoke carry away your burdens',
              'Express gratitude for the lessons learned'
            ],
            description: 'Release what no longer serves you under the powerful full moon energy.'
          },
          secondary: {
            title: 'Crystal Charging',
            icon: '💎',
            color: '#FFD700',
            steps: [
              'Cleanse crystals with sage or salt water',
              'Arrange in a circle under moonlight',
              'Leave overnight for maximum charging',
              'Retrieve at sunrise for balanced energy',
              'Set intentions for each crystal'
            ],
            description: 'Charge your crystals with powerful lunar energy during peak illumination.'
          },
          tertiary: {
            title: 'Moon Water Creation',
            icon: '🌊',
            color: '#4FC3F7',
            steps: [
              'Fill a clear glass jar with filtered water',
              'Place under moonlight for 3-4 hours',
              'Set intention for healing and purification',
              'Store in refrigerator and use within 3 days',
              'Use for drinking, bathing, or plant watering'
            ],
            description: 'Create charged moon water for healing and spiritual cleansing.'
          }
        };
        break;
      case 'Waning Gibbous':
        level = 7.0;
        mood = 'Reflective';
        recommendation = 'Perfect time for introspection and releasing what no longer serves you.';
        doToday = 'Clean your space';
        avoidToday = 'Holding onto the past';
        meditationFocus = 'Letting go';
        ritualSuggestion = 'Release ceremony';
        break;
      case 'Last Quarter':
        level = 5.0;
        mood = 'Releasing';
        recommendation = 'Let go of what no longer serves and prepare for renewal.';
        doToday = 'Complete unfinished tasks';
        avoidToday = 'Starting new projects';
        meditationFocus = 'Completion';
        ritualSuggestion = 'Cleansing ritual';
        break;
      case 'Waning Crescent':
        level = 3.5;
        mood = 'Restful';
        recommendation = 'Rest, recharge, and prepare for the new cycle ahead.';
        doToday = 'Take a nap';
        avoidToday = 'Overexertion';
        meditationFocus = 'Rest & renewal';
        ritualSuggestion = 'Take a bath';
        break;
      default:
        level = 5.0;
        mood = 'Balanced';
        recommendation = 'Stay centered and trust the natural flow of lunar energy.';
        doToday = 'Stay centered';
        avoidToday = 'Extreme actions';
        meditationFocus = 'Balance';
        ritualSuggestion = 'Centering practice';
        ritualGuidance = {
          primary: {
            title: 'Lunar Meditation',
            icon: '🧘‍♀️',
            color: '#8A4FFF',
            steps: [
              'Find a quiet space with moonlight visibility',
              'Light a white or silver candle',
              'Focus on your breath for 5 minutes',
              'Visualize lunar energy filling your body',
              'Set intentions for the lunar cycle'
            ],
            description: 'Connect with lunar energy through guided meditation and intention setting.'
          },
          secondary: {
            title: 'Moon Gazing',
            icon: '🌙',
            color: '#4FC3F7',
            steps: [
              'Find a comfortable spot with clear moon view',
              'Sit or lie down and relax your body',
              'Gaze softly at the moon for 10-15 minutes',
              'Notice any thoughts or feelings that arise',
              'Express gratitude for the lunar energy'
            ],
            description: 'Simple practice of connecting with lunar energy through mindful observation.'
          },
          tertiary: {
            title: 'Lunar Journaling',
            icon: '📝',
            color: '#6B6B6B',
            steps: [
              'Write the current moon phase and date',
              'Reflect on your current emotional state',
              'Note any patterns or insights',
              'Set intentions for the coming days',
              'Express gratitude for lunar guidance'
            ],
            description: 'Track your lunar journey and emotional patterns through regular journaling.'
          }
        };
    }

    return {
      level: Math.round(level * 10) / 10,
      mood,
      recommendation,
      doToday,
      avoidToday,
      meditationFocus,
      ritualSuggestion,
      ritualGuidance,
    };
  }

  // Get moon phase name from phase value
  private getMoonPhaseName(phase: number): string {
    if (phase < 0.125) return 'New Moon';
    if (phase < 0.25) return 'Waxing Crescent';
    if (phase < 0.375) return 'First Quarter';
    if (phase < 0.5) return 'Waxing Gibbous';
    if (phase < 0.625) return 'Full Moon';
    if (phase < 0.75) return 'Waning Gibbous';
    if (phase < 0.875) return 'Last Quarter';
    return 'Waning Crescent';
  }

  // Get next moon phase
  private getNextMoonPhase(date: Date): string {
    const phases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 
                   'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
    const currentPhase = this.getMoonPhaseName(SunCalc.getMoonIllumination(date).phase);
    const currentIndex = phases.indexOf(currentPhase);
    return phases[(currentIndex + 1) % phases.length];
  }

  // Get next moon phase date (accurate calculation)
  private getNextMoonPhaseDate(date: Date): Date {
    const currentPhase = SunCalc.getMoonIllumination(date).phase;
    const phases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 
                   'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
    
    // Find the next phase
    let nextPhase = 0;
    if (currentPhase < 0.125) nextPhase = 0.25; // New Moon -> Waxing Crescent
    else if (currentPhase < 0.25) nextPhase = 0.25; // Waxing Crescent -> First Quarter
    else if (currentPhase < 0.375) nextPhase = 0.5; // First Quarter -> Waxing Gibbous
    else if (currentPhase < 0.5) nextPhase = 0.5; // Waxing Gibbous -> Full Moon
    else if (currentPhase < 0.625) nextPhase = 0.75; // Full Moon -> Waning Gibbous
    else if (currentPhase < 0.75) nextPhase = 0.75; // Waning Gibbous -> Last Quarter
    else if (currentPhase < 0.875) nextPhase = 1.0; // Last Quarter -> Waning Crescent
    else nextPhase = 0.0; // Waning Crescent -> New Moon (next cycle)
    
    // Calculate the exact date when the next phase occurs
    // We'll search forward in time to find when the phase matches
    let searchDate = new Date(date);
    const maxSearchDays = 30; // Maximum search period
    
    for (let i = 0; i < maxSearchDays; i++) {
      searchDate.setDate(searchDate.getDate() + 0.1); // Check every 2.4 hours
      const phaseAtDate = SunCalc.getMoonIllumination(searchDate).phase;
      
      // Check if we've reached the next phase
      if (nextPhase === 0.0) {
        // Looking for New Moon (phase 0.0 or close to 1.0)
        if (phaseAtDate < 0.05 || phaseAtDate > 0.95) {
          return searchDate;
        }
      } else {
        // Looking for other phases
        const phaseDiff = Math.abs(phaseAtDate - nextPhase);
        if (phaseDiff < 0.05) { // Within 5% of target phase
          return searchDate;
        }
      }
    }
    
    // Fallback: if we can't find the exact date, use the approximation
    const fallbackDate = new Date(date);
    fallbackDate.setDate(fallbackDate.getDate() + 3.7);
    return fallbackDate;
  }

  // Get moon's zodiac position (simplified calculation)
  private getMoonZodiacPosition(date: Date): string {
    // This is a simplified calculation - in reality, you'd need more complex astronomical calculations
    const zodiacSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    
    // Approximate moon cycle through zodiac (moon moves through all signs in ~27 days)
    const daysSinceEpoch = Math.floor((date.getTime() - new Date('2000-01-01').getTime()) / (1000 * 60 * 60 * 24));
    const zodiacIndex = Math.floor((daysSinceEpoch % 27) / 2.25); // ~2.25 days per sign
    
    return zodiacSigns[zodiacIndex % 12];
  }

  // Get zodiac element
  private getZodiacElement(zodiacSign: string): string {
    const elements: Record<string, string> = {
      'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
      'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
      'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
      'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water',
    };
    return elements[zodiacSign] || 'Earth';
  }

  // Format time for display
  private formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  // Get user location info
  public getUserLocation(): UserLocation | null {
    return this.userLocation;
  }

  // Check if location permission is granted
  public hasLocationPermission(): boolean {
    return this.locationPermissionGranted;
  }

  // Force real GPS detection
  public async forceRealGPSDetection(): Promise<boolean> {
    // Clear all location state
    this.userLocation = null;
    this.locationPermissionGranted = false;
    
    // Force new permission request and location detection
    try {
      const hasPermission = await this.requestLocationPermission();
      if (hasPermission && this.userLocation) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('GPS detection error:', error);
      return false;
    }
  }

  // Get current location info
  public getLocationInfo(): { location: UserLocation | null; hasPermission: boolean } {
    return {
      location: this.userLocation,
      hasPermission: this.locationPermissionGranted
    };
  }

  // Set Detroit test location (for debugging/testing purposes)
  public setDetroitLocation(): void {
    console.log('🧪 [TEST] Setting test location: {"city": "Detroit", "latitude": 42.3314, "longitude": -83.0458}');
    
    this.userLocation = {
      latitude: 42.3314,
      longitude: -83.0458,
      city: 'Detroit',
      country: 'US'
    };
    
    console.log('🧪 [TEST] Test location set successfully:', this.userLocation);
  }
}

export default LunarService;
