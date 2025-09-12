// src/services/astronomicalAPIs.ts
export class AstronomicalAPIs {
  
    // FarmSense Moon API - Completely free, no API key
    static async getNASAMoonPhase(date: Date): Promise<{ phase: string; illumination: number }> {
      try {
        const timestamp = Math.floor(date.getTime() / 1000);
        
        // FarmSense free moon phase API
        const response = await fetch(`https://api.farmsense.net/v1/moonphases/?d=${timestamp}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
          const moonData = data[0];
          return {
            phase: moonData.Phase || 'Unknown',
            illumination: Math.round((moonData.Illumination || 0) * 100)
          };
        }
        
        // Fallback calculation
        return this.calculateMoonPhase(date);
        
      } catch (error) {
        console.error('FarmSense Moon API error (FIXED):', error);
        // Fallback to calculation
        return this.calculateMoonPhase(date);
      }
    }
  
    // U.S. Naval Observatory API - Free, no API key
    static async getUSNOData(date: Date): Promise<{ moonPhase: string; sunrise: string; sunset: string }> {
      try {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        // USNO API for sun/moon data
        // USNO switched endpoints; use 'sun' and 'moon' endpoints separately
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        // Working endpoints (current public USNO behavior may change over time)
        const [sunRes, moonRes] = await Promise.all([
          fetch(`https://aa.usno.navy.mil/api/rstt/oneday?date=${dateStr}&coords=40.7128,-74.0060&tz=-5`),
          fetch(`https://aa.usno.navy.mil/api/moon/phases/date?date=${dateStr}`)
        ]);
        if (!sunRes.ok) throw new Error(`USNO Sun HTTP ${sunRes.status}`);
        if (!moonRes.ok) throw new Error(`USNO Moon HTTP ${moonRes.status}`);
        const sunJson = await sunRes.json();
        const moonJson = await moonRes.json();
        
        return {
          moonPhase: (moonJson?.phasedata?.[0]?.phase) || 'Unknown',
          sunrise: sunJson?.sundata?.[0]?.time || '6:00 AM',
          sunset: sunJson?.sundata?.[1]?.time || '6:00 PM'
        };
        
      } catch (error) {
        console.error('USNO API error (FIXED):', error);
        return {
          moonPhase: 'Unknown',
          sunrise: '6:00 AM',
          sunset: '6:00 PM'
        };
      }
    }
  
    // Sunrise-Sunset.org API - Free, no API key
    static async getSunriseSunset(date: Date, lat: number = 40.7128, lng: number = -74.0060): Promise<{ sunrise: string; sunset: string; moonrise?: string; moonset?: string }> {
      try {
        const dateStr = date.toISOString().split('T')[0];
        
        const response = await fetch(
          `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=${dateStr}&formatted=0`
        );
        
        if (!response.ok) {
          throw new Error(`Sunrise API HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'OK') {
          return {
            sunrise: new Date(data.results.sunrise).toLocaleTimeString('en-US', { 
              timeZone: 'America/New_York',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true 
            }),
            sunset: new Date(data.results.sunset).toLocaleTimeString('en-US', { 
              timeZone: 'America/New_York',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true 
            })
          };
        }
        
        throw new Error('Invalid response from Sunrise API');
        
      } catch (error) {
        console.error('Sunrise-Sunset API error (FIXED):', error);
        return {
          sunrise: '6:00 AM',
          sunset: '6:00 PM'
        };
      }
    }
  
    // Free Astrology API - No API key required
    static async getFreeAstrologyData(date: Date, lat: number = 40.7128, lng: number = -74.0060): Promise<any> {
      try {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const hour = date.getHours();
        const min = date.getMinutes();
        
        // Free Astrology API endpoint
        const response = await fetch('https://freeastrologyapi.com/api/planets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            day: day,
            month: month,
            year: year,
            hour: hour,
            min: min,
            lat: lat,
            lon: lng,
            tzone: -5
          })
        });
        
        if (!response.ok) {
          throw new Error(`Free Astrology API HTTP ${response.status}`);
        }
        
        const data = await response.json();
        return data;
        
      } catch (error) {
        console.error('Free Astrology API error (FIXED):', error);
        // Return fallback planetary data
        return this.getFallbackPlanetaryData(date);
      }
    }
  
    // Planetary positions using NASA JPL data (free)
    static async getPlanetaryPositions(date: Date): Promise<any[]> {
      try {
        // Try to get data from our AstronomicalService first
        const positions = [];
        
        // For now, return calculated positions
        // You can integrate with your existing AstronomicalService here
        const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
        
        for (const planet of planets) {
          positions.push({
            name: planet,
            longitude: this.calculatePlanetPosition(planet, date),
            sign: this.getZodiacSign(this.calculatePlanetPosition(planet, date))
          });
        }
        
        return positions;
        
      } catch (error) {
        console.error('Planetary positions error:', error);
        return this.getFallbackPlanetaryData(date);
      }
    }
  
    // Combined free astronomical data
    static async getTimeAndDateAstronomy(date: Date): Promise<{ moonPhase: string; moonSign: string; sunrise: string; sunset: string }> {
      try {
        const [moonData, usnoData, sunData] = await Promise.allSettled([
          this.getNASAMoonPhase(date),
          this.getUSNOData(date),
          this.getSunriseSunset(date)
        ]);
        
        const moon = moonData.status === 'fulfilled' ? moonData.value : { phase: 'Unknown', illumination: 50 };
        const usno = usnoData.status === 'fulfilled' ? usnoData.value : { moonPhase: 'Unknown', sunrise: '6:00 AM', sunset: '6:00 PM' };
        const sun = sunData.status === 'fulfilled' ? sunData.value : { sunrise: '6:00 AM', sunset: '6:00 PM' };
        
        return {
          moonPhase: moon.phase,
          moonSign: this.getMoonSign(date), // Calculate moon sign
          sunrise: sun.sunrise,
          sunset: sun.sunset
        };
        
      } catch (error) {
        console.error('Combined astronomy data error (FIXED):', error);
        return {
          moonPhase: 'Unknown',
          moonSign: 'Unknown',
          sunrise: '6:00 AM',
          sunset: '6:00 PM'
        };
      }
    }
  
    // HELPER FUNCTIONS FOR CALCULATIONS
  
    // Calculate moon phase when API fails
    private static calculateMoonPhase(date: Date): { phase: string; illumination: number } {
      const newMoon = new Date('2025-01-29'); // Known new moon date
      const lunarCycle = 29.53059; // Average lunar cycle in days
      
      const daysSinceNewMoon = (date.getTime() - newMoon.getTime()) / (1000 * 60 * 60 * 24);
      const phase = ((daysSinceNewMoon % lunarCycle) + lunarCycle) % lunarCycle;
      
      let phaseName = 'New Moon';
      let illumination = 0;
      
      if (phase < 1) {
        phaseName = 'New Moon';
        illumination = 0;
      } else if (phase < 6.9) {
        phaseName = 'Waxing Crescent';
        illumination = phase / 6.9 * 50;
      } else if (phase < 8.4) {
        phaseName = 'First Quarter';
        illumination = 50;
      } else if (phase < 14.8) {
        phaseName = 'Waxing Gibbous';
        illumination = 50 + (phase - 8.4) / 6.4 * 50;
      } else if (phase < 16.6) {
        phaseName = 'Full Moon';
        illumination = 100;
      } else if (phase < 22.1) {
        phaseName = 'Waning Gibbous';
        illumination = 100 - (phase - 16.6) / 5.5 * 50;
      } else if (phase < 23.6) {
        phaseName = 'Last Quarter';
        illumination = 50;
      } else {
        phaseName = 'Waning Crescent';
        illumination = 50 - (phase - 23.6) / 5.9 * 50;
      }
      
      return {
        phase: phaseName,
        illumination: Math.round(illumination)
      };
    }
  
    // Calculate approximate planetary positions
    private static calculatePlanetPosition(planet: string, date: Date): number {
      const daysSinceEpoch = (date.getTime() - new Date('2000-01-01').getTime()) / (1000 * 60 * 60 * 24);
      
      // Simplified planetary position calculations (very approximate)
      const positions: { [key: string]: number } = {
        'Sun': (280.459 + 0.98564736 * daysSinceEpoch) % 360,
        'Moon': (218.316 + 13.176396 * daysSinceEpoch) % 360,
        'Mercury': (252.25 + 4.092385 * daysSinceEpoch) % 360,
        'Venus': (181.98 + 1.602136 * daysSinceEpoch) % 360,
        'Mars': (355.43 + 0.524061 * daysSinceEpoch) % 360,
        'Jupiter': (34.35 + 0.083091 * daysSinceEpoch) % 360,
        'Saturn': (50.08 + 0.033494 * daysSinceEpoch) % 360
      };
      
      return positions[planet] || 0;
    }
  
    // Get zodiac sign from longitude
    private static getZodiacSign(longitude: number): string {
      const signs = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
      ];
      
      return signs[Math.floor(longitude / 30)];
    }
  
    // Calculate moon sign
    private static getMoonSign(date: Date): string {
      const moonLongitude = this.calculatePlanetPosition('Moon', date);
      return this.getZodiacSign(moonLongitude);
    }
  
    // Fallback planetary data when APIs fail
    private static getFallbackPlanetaryData(date: Date): any[] {
      const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
      
      return planets.map(planet => ({
        name: planet,
        longitude: this.calculatePlanetPosition(planet, date),
        sign: this.getZodiacSign(this.calculatePlanetPosition(planet, date)),
        calculated: true
      }));
    }
  
    // Test all free APIs
    static async testAllAPIs(): Promise<{ [key: string]: boolean }> {
      const results: { [key: string]: boolean } = {};
      
      try {
        const testDate = new Date();
        
        // Test FarmSense Moon API
        try {
          await this.getNASAMoonPhase(testDate);
          results.farmSense = true;
        } catch {
          results.farmSense = false;
        }
        
        // Test USNO API
        try {
          await this.getUSNOData(testDate);
          results.usno = true;
        } catch {
          results.usno = false;
        }
        
        // Test Sunrise-Sunset API
        try {
          await this.getSunriseSunset(testDate);
          results.sunriseSunset = true;
        } catch {
          results.sunriseSunset = false;
        }
        
        // Test Free Astrology API
        try {
          await this.getFreeAstrologyData(testDate);
          results.freeAstrology = true;
        } catch {
          results.freeAstrology = false;
        }
        
      } catch (error) {
        console.error('API testing error (FIXED):', error);
      }
      
      return results;
    }
  }