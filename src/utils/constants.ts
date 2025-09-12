export const Config = {
    supabaseUrl: 'https://adyrgavblydgdvttttwn.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeXJnYXZibHlkZ2R2dHR0dHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczODk5MjksImV4cCI6MjA3Mjk2NTkyOX0.wc5KPXufeFqWSdK4-dYsZUg6lQmEh1X4ZiS4z1L9ahI', 
    revenueCatApiKey: 'appl_dVvYKpuHmUrUvWImuenMNlpOTPh',
    googleClientId: '686315269749-e35emde6k4jk70i3ekse7k0gmjisl8i8.apps.googleusercontent.com',
    openaiApiKey: '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',

    // FREE Astronomical APIs (no keys needed!)
    astronomicalApis: {
    nasaHorizons: 'https://ssd.jpl.nasa.gov/api/horizons.api',
    usno: 'https://aa.usno.navy.mil/api/',
    freeAstrology: 'http://freeastrologyapi.com/',
    moonPhases: 'https://api.farmsense.net/v1/moonphases/',
    sunriseSunset: 'https://api.sunrise-sunset.org/json'
  }

  };
  
  export const ZodiacSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ] as const;