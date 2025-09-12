// src/services/astronomicalService.ts
import { AstronomicalService as ApproxAstronomical } from './astronomical';

export interface PlanetaryPosition {
  planet: string;
  rightAscension: string;
  declination: string;
  magnitude?: number;
  distance: number; // AU
  constellation?: string;
  zodiacSign?: string;
}

export interface MoonPhase {
  phase: string;
  illumination: number; // percentage
  age: number; // days since new moon
  distance: number; // km
  nextNewMoon: string;
  nextFullMoon: string;
}

export interface AstronomicalData {
  date: string;
  location: {
    latitude: number;
    longitude: number;
  };
  planets: PlanetaryPosition[];
  moonPhase: MoonPhase;
  sunrise: string;
  sunset: string;
  moonrise?: string;
  moonset?: string;
}

export class AstronomicalService {
  private static readonly BASE_URL = 'https://ssd.jpl.nasa.gov/api/horizons.api';
  // Toggle NASA Horizons usage (public release: true)
  private static readonly ENABLE_NASA = true;
  private static lastHorizonsWarnAt = 0;
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

  // Get planetary positions for birth chart calculation
  static async getPlanetaryPositions(
    date: Date,
    latitude: number,
    longitude: number
  ): Promise<PlanetaryPosition[]> {
    // Always prefer live NASA data for production
    const positions: PlanetaryPosition[] = [];
    let attempts = 0;
    
    for (const [planetName, code] of Object.entries(this.PLANET_CODES)) {
      try {
        const position = await this.getSinglePlanetPosition(
          planetName,
          code,
          date,
          latitude,
          longitude
        );
        if (position) {
          positions.push(position);
        }
      } catch (error) {
        // Swallow individual failures; we'll fallback below
      }
      attempts++;
      if (attempts >= 3 && positions.length === 0) {
        break;
      }
    }
    
    // No fallback: return only real NASA data

    return positions;
  }

  // Get single planet position using NASA Horizons API
  private static async getSinglePlanetPosition(
    planetName: string,
    planetCode: string,
    date: Date,
    latitude: number,
    longitude: number
  ): Promise<PlanetaryPosition | null> {
    const startTime = this.formatDateTimeUTC(date);
    const stopTime = this.formatDateTimeUTC(new Date(date.getTime() + 60000)); // 1 minute later
    
    // Build URL for NASA Horizons API
    const params = new URLSearchParams({
      format: 'json',
      COMMAND: planetCode,
      OBJ_DATA: 'NO',
      MAKE_EPHEM: 'YES',
      EPHEM_TYPE: 'OBSERVER',
      CENTER: 'coord@399',
      COORD_TYPE: 'GEODETIC',
      // NASA expects GEODETIC as lon,lat,elev
      SITE_COORD: `${longitude},${latitude},0`,
      START_TIME: startTime,
      STOP_TIME: stopTime,
      STEP_SIZE: '1 m',
      QUANTITIES: '1',
      REF_SYSTEM: 'ICRF',
      CAL_FORMAT: 'CAL',
      TIME_DIGITS: 'MINUTES',
      TIME_ZONE: 'UTC',
      ANG_FORMAT: 'HMS',
      RANGE_UNITS: 'AU',
      APPARENT: 'AIRLESS',
      SUPPRESS_RANGE_RATE: 'NO'
    });

    try {
      const response = await fetch(`${this.BASE_URL}?${params.toString()}`);
      const data = await response.json();
      
      if (data.result) {
        return this.parseHorizonsResponse(planetName, data.result);
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching ${planetName} position:`, error);
      return null;
    }
  }

  // Parse NASA Horizons response to extract planetary data
  private static parseHorizonsResponse(planetName: string, result: string): PlanetaryPosition | null {
    try {
      // Look for the data between $$SOE and $$EOE markers
      const startMarker = '$$SOE';
      const endMarker = '$$EOE';
      const startIndex = result.indexOf(startMarker);
      const endIndex = result.indexOf(endMarker);
      
      if (startIndex === -1 || endIndex === -1) {
        const now = Date.now();
        if (now - this.lastHorizonsWarnAt > 5000) {
          console.warn('No ephemeris data found from NASA Horizons (will use fallback)');
          this.lastHorizonsWarnAt = now;
        }
        return null;
      }
      
      const ephemerisData = result.substring(startIndex + startMarker.length, endIndex).trim();
      const lines = ephemerisData
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      if (lines.length === 0) {
        return null;
      }
      
      // Parse the first data line (CSV expected)
      const dataLine = lines[0].trim();
      let rightAscension = '';
      let declination = '';
      let magnitude: number | undefined = undefined;
      let distance = 0;

      if (dataLine.includes(',')) {
        const cols = dataLine.split(',').map(c => c.trim());
        // Heuristic mapping: [date/time, RA, DEC, APmag, S-brt, delta, deldot]
        rightAscension = cols[1] || '';
        declination = cols[2] || '';
        magnitude = isNaN(parseFloat(cols[3])) ? undefined : parseFloat(cols[3]);
        distance = isNaN(parseFloat(cols[5])) ? 0 : parseFloat(cols[5]);
      } else {
        // Fallback whitespace parser
        const parts = dataLine.split(/\s+/);
        if (parts.length < 8) {
          return null;
        }
        rightAscension = `${parts[2]} ${parts[3]} ${parts[4]}`;
        declination = `${parts[5]} ${parts[6]} ${parts[7]}`;
        magnitude = parseFloat(parts[8]) || undefined;
        distance = parseFloat(parts[10]) || 0;
      }
      
      return {
        planet: planetName,
        rightAscension,
        declination,
        magnitude,
        distance,
        zodiacSign: this.calculateZodiacSign(rightAscension)
      };
      
    } catch (error) {
      console.error(`Error parsing Horizons response for ${planetName}:`, error);
      return null;
    }
  }

  // Calculate zodiac sign from Right Ascension
  private static calculateZodiacSign(rightAscension: string): string {
    try {
      const [hoursStr, minutesStr] = rightAscension.split(' ');
      const hours = parseInt(hoursStr);
      const minutes = parseInt(minutesStr);
      const totalHours = hours + minutes / 60;
      
      // Convert RA hours to zodiac signs (each sign is 2 hours of RA)
      const signIndex = Math.floor(totalHours / 2) % 12;
      const zodiacSigns = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 
        'Leo', 'Virgo', 'Libra', 'Scorpio',
        'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
      ];
      
      return zodiacSigns[signIndex];
    } catch (error) {
      console.error('Error calculating zodiac sign:', error);
      return 'Unknown';
    }
  }

  // Get moon phase data using NASA API
  static async getMoonPhase(date: Date): Promise<MoonPhase | null> {
    try {
      // Prefer internal calculation to avoid API dependency
      const approx = ApproxAstronomical.getMoonPhase(date);

      // Approx distance average: 384,400 km. You can refine later.
      const illumination = approx.illumination; // already in %
      const age = 0; // not provided by approx; leave 0 for now
      
      let phase = 'New Moon';
      const illum = illumination;
      if (illum < 1) phase = 'New Moon';
      else if (illum < 49) phase = 'Waxing Crescent';
      else if (illum < 51) phase = 'First Quarter';
      else if (illum < 99) phase = 'Waxing Gibbous';
      else if (illum >= 99) phase = 'Full Moon';
      
      return {
        phase,
        illumination,
        age,
        distance: 384400,
        nextNewMoon: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        nextFullMoon: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
      };
      
    } catch (error) {
      console.error('Error getting moon phase:', error);
      return null;
    }
  }

  // Generate birth chart data
  static async generateBirthChart(
    birthDate: Date,
    birthTime: Date | null,
    birthPlace: { latitude: number; longitude: number }
  ): Promise<AstronomicalData | null> {
    try {
      console.log('Generating birth chart for:', {
        date: birthDate,
        time: birthTime,
        location: birthPlace
      });

      // Combine birth date and time
      let chartDate = birthDate;
      if (birthTime) {
        chartDate = new Date(birthDate);
        chartDate.setHours(birthTime.getHours(), birthTime.getMinutes(), 0, 0);
      }

      // Get planetary positions from Supabase function
      const planets = await this.getPlanetaryPositionsFromSupabase(
        chartDate,
        birthPlace.latitude,
        birthPlace.longitude
      );

      // Get moon phase
      const moonPhase = await this.getMoonPhase(chartDate);

      // Get sunrise/sunset (simplified)
      const sunrise = new Date(chartDate);
      sunrise.setHours(6, 0, 0, 0);
      const sunset = new Date(chartDate);
      sunset.setHours(18, 0, 0, 0);

      return {
        date: chartDate.toISOString(),
        location: birthPlace,
        planets,
        moonPhase: moonPhase || {
          phase: 'Unknown',
          illumination: 50,
          age: 14.75,
          distance: 384400,
          nextNewMoon: new Date().toISOString(),
          nextFullMoon: new Date().toISOString()
        },
        sunrise: sunrise.toISOString(),
        sunset: sunset.toISOString()
      };

    } catch (error) {
      console.error('Error generating birth chart:', error);
      return null;
    }
  }

  // Get current planetary transits
  static async getCurrentTransits(
    userLocation: { latitude: number; longitude: number }
  ): Promise<PlanetaryPosition[]> {
    return this.getPlanetaryPositions(new Date(), userLocation.latitude, userLocation.longitude);
  }

  // Calculate planetary aspects (conjunctions, oppositions, etc.)
  static calculateAspects(planets: PlanetaryPosition[]): Array<{
    planet1: string;
    planet2: string;
    aspect: string;
    orb: number;
  }> {
    const aspects = [];
    
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const planet1 = planets[i];
        const planet2 = planets[j];
        
        // Calculate angular separation (simplified)
        const separation = Math.abs(
          this.raToDecimal(planet1.rightAscension) - 
          this.raToDecimal(planet2.rightAscension)
        ) * 15; // Convert hours to degrees
        
        // Check for major aspects
        let aspectName = '';
        let orb = 0;
        
        if (Math.abs(separation) < 8) {
          aspectName = 'Conjunction';
          orb = separation;
        } else if (Math.abs(separation - 60) < 6) {
          aspectName = 'Sextile';
          orb = Math.abs(separation - 60);
        } else if (Math.abs(separation - 90) < 8) {
          aspectName = 'Square';
          orb = Math.abs(separation - 90);
        } else if (Math.abs(separation - 120) < 6) {
          aspectName = 'Trine';
          orb = Math.abs(separation - 120);
        } else if (Math.abs(separation - 180) < 8) {
          aspectName = 'Opposition';
          orb = Math.abs(separation - 180);
        }
        
        if (aspectName) {
          aspects.push({
            planet1: planet1.planet,
            planet2: planet2.planet,
            aspect: aspectName,
            orb
          });
        }
      }
    }
    
    return aspects;
  }

  // Convert RA from HMS to decimal hours
  private static raToDecimal(ra: string): number {
    const parts = ra.split(' ');
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseFloat(parts[2]) || 0;
    
    return hours + minutes / 60 + seconds / 3600;
  }

  // Test the NASA Horizons API connection
  static async testConnection(): Promise<boolean> {
    try {
      console.log('Testing NASA Horizons API connection...');
      const testDate = new Date();
      const params = new URLSearchParams({
        format: 'json',
        COMMAND: '10', // Sun
        OBJ_DATA: 'NO',
        MAKE_EPHEM: 'YES',
        EPHEM_TYPE: 'OBSERVER',
        CENTER: '500@399', // Geocentric
        START_TIME: this.formatDateUTC(testDate),
        STOP_TIME: this.formatDateUTC(new Date(testDate.getTime() + 86400000)),
        STEP_SIZE: '1 d',
        QUANTITIES: '1',
        TIME_ZONE: 'UTC'
      });

      console.log('Making request to NASA Horizons API...');
      
      // Create timeout manually for React Native compatibility
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${this.BASE_URL}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`NASA API HTTP error: ${response.status} ${response.statusText}`);
        return false;
      }
      
      const data = await response.json();
      console.log('NASA API response received:', data);
      
      const hasData = !!(data.result && data.result.includes('$$SOE'));
      console.log(`NASA API test result: ${hasData ? 'SUCCESS' : 'FAILED'}`);
      
      return hasData;
    } catch (error) {
      console.error('NASA Horizons API test failed:', error);
      if (error.name === 'AbortError') {
        console.error('NASA API request timed out after 10 seconds');
      }
      return false;
    }
  }

  // Helpers to avoid date-fns dependency
  private static pad2(n: number): string { return n < 10 ? `0${n}` : `${n}`; }
  private static formatDateTimeUTC(d: Date): string {
    const yyyy = d.getUTCFullYear();
    const MM = this.pad2(d.getUTCMonth() + 1);
    const dd = this.pad2(d.getUTCDate());
    const HH = this.pad2(d.getUTCHours());
    const mm = this.pad2(d.getUTCMinutes());
    const ss = this.pad2(d.getUTCSeconds());
    return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
  }
  private static formatDateUTC(d: Date): string {
    const yyyy = d.getUTCFullYear();
    const MM = this.pad2(d.getUTCMonth() + 1);
    const dd = this.pad2(d.getUTCDate());
    return `${yyyy}-${MM}-${dd}`;
  }

  // NEW: Use local Supabase function for planetary positions
  static async getPlanetaryPositionFromSupabase(
    planetCode: string,
    latitude: number,
    longitude: number,
    date?: Date
  ): Promise<PlanetaryPosition | null> {
    try {
      // PRODUCTION URL - CACHE BUST v5
const baseUrl = 'https://adyrgavblydgdvttttwn.supabase.co/functions/v1/get-ephemeris';
      
      const params = new URLSearchParams({
        planetCode,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        ...(date && { date: date.toISOString() })
      });

      console.log(`🚀 PRODUCTION SUPABASE FUNCTION: ${baseUrl} (v5 - FORCE RELOAD)`);
      
      // Create timeout manually for React Native compatibility
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(`${baseUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeXJnYXZibHlkZ2R2dHR0dHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczODk5MjksImV4cCI6MjA3Mjk2NTkyOX0.wc5KPXufeFqWSdK4-dYsZUg6lQmEh1X4ZiS4z1L9ahI`,
          'Accept': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return {
          planet: data.data.planet,
          rightAscension: data.data.rightAscension.toString(),
          declination: data.data.declination.toString(),
          distance: data.data.distance,
          zodiacSign: data.data.zodiacSign
        };
      }

      return null;
    } catch (error) {
      console.error('Supabase function error:', error);
      if (error.name === 'AbortError') {
        console.error('Supabase function request timed out after 15 seconds');
      } else if (error.message?.includes('Network request failed')) {
        console.error('Network request failed - check if Supabase is running and accessible');
        console.error('Make sure your computer and mobile device are on the same network');
      }
      return null;
    }
  }

  // NEW: Get multiple planetary positions using Supabase function
  static async getPlanetaryPositionsFromSupabase(
    date: Date,
    latitude: number,
    longitude: number
  ): Promise<PlanetaryPosition[]> {
    const planets = [
      { code: '199', name: 'Mercury' },
      { code: '299', name: 'Venus' },
      { code: '499', name: 'Mars' },
      { code: '599', name: 'Jupiter' },
      { code: '699', name: 'Saturn' },
      { code: '799', name: 'Uranus' },
      { code: '899', name: 'Neptune' }
    ];

    const positions: PlanetaryPosition[] = [];

    for (const planet of planets) {
      try {
        const position = await this.getPlanetaryPositionFromSupabase(
          planet.code,
          latitude,
          longitude,
          date
        );
        
        if (position) {
          positions.push(position);
        }
      } catch (error) {
        console.error(`Error getting position for ${planet.name}:`, error);
      }
    }

    return positions;
  }
}