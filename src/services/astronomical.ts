export class AstronomicalService {
    // Moon phase calculation using astronomical formulas
    static getMoonPhase(date: Date): { phase: string; illumination: number; zodiacSign: string } {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      // Julian day calculation
      const julianDay = this.getJulianDay(year, month, day);
      
      // Moon age calculation (days since new moon)
      const moonAge = this.getMoonAge(julianDay);
      
      // Phase determination
      const phase = this.getMoonPhaseName(moonAge);
      const illumination = this.getMoonIllumination(moonAge);
      const zodiacSign = this.getMoonZodiacSign(julianDay);
      
      return { phase, illumination, zodiacSign };
    }
  
    private static getJulianDay(year: number, month: number, day: number): number {
      if (month <= 2) {
        year -= 1;
        month += 12;
      }
      
      const a = Math.floor(year / 100);
      const b = 2 - a + Math.floor(a / 4);
      
      return Math.floor(365.25 * (year + 4716)) + 
             Math.floor(30.6001 * (month + 1)) + 
             day + b - 1524.5;
    }
  
    private static getMoonAge(julianDay: number): number {
      // Known new moon reference: January 6, 2000 at 18:14 UTC
      const knownNewMoon = 2451550.1;
      const synodicMonth = 29.530588853;
      
      const daysSinceKnownNewMoon = julianDay - knownNewMoon;
      const cycles = daysSinceKnownNewMoon / synodicMonth;
      const age = (cycles - Math.floor(cycles)) * synodicMonth;
      
      return age;
    }
  
    private static getMoonPhaseName(age: number): string {
      if (age < 1.84566) return 'New Moon';
      if (age < 5.53699) return 'Waxing Crescent';
      if (age < 9.22831) return 'First Quarter';
      if (age < 12.91963) return 'Waxing Gibbous';
      if (age < 16.61096) return 'Full Moon';
      if (age < 20.30228) return 'Waning Gibbous';
      if (age < 23.99361) return 'Last Quarter';
      if (age < 27.68493) return 'Waning Crescent';
      return 'New Moon';
    }
  
    private static getMoonIllumination(age: number): number {
      const phase = age / 29.530588853;
      return Math.round((1 - Math.cos(phase * 2 * Math.PI)) * 50);
    }
  
    private static getMoonZodiacSign(julianDay: number): string {
      // Simplified calculation - in reality this is more complex
      const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                     'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
      
      // Approximate calculation based on lunar position
      const position = ((julianDay - 2451545.0) / 27.321661) % 12;
      return signs[Math.floor(position)];
    }
  
    // Planetary position approximations
    static getPlanetaryPositions(date: Date): { [planet: string]: { sign: string; degree: number } } {
      const julianDay = this.getJulianDay(date.getFullYear(), date.getMonth() + 1, date.getDate());
      
      return {
        mercury: this.getPlanetPosition(julianDay, 'mercury'),
        venus: this.getPlanetPosition(julianDay, 'venus'),
        mars: this.getPlanetPosition(julianDay, 'mars'),
        jupiter: this.getPlanetPosition(julianDay, 'jupiter'),
        saturn: this.getPlanetPosition(julianDay, 'saturn'),
      };
    }
  
    private static getPlanetPosition(julianDay: number, planet: string): { sign: string; degree: number } {
      const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                     'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
      
      // Simplified planetary position calculations
      // In production, you'd use more accurate ephemeris data
      const planetData = {
        mercury: { period: 87.97, offset: 0 },
        venus: { period: 224.7, offset: 120 },
        mars: { period: 686.98, offset: 240 },
        jupiter: { period: 4332.6, offset: 60 },
        saturn: { period: 10759.2, offset: 180 }
      };
  
      const data = planetData[planet as keyof typeof planetData];
      const position = ((julianDay - 2451545.0 + data.offset) / data.period * 360) % 360;
      const signIndex = Math.floor(position / 30);
      const degree = Math.round(position % 30);
  
      return {
        sign: signs[signIndex],
        degree: degree
      };
    }
  }