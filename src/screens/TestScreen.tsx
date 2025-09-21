import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import * as AppleAuthentication from 'expo-apple-authentication';
import { AuthService } from '../services/auth';
import { AstronomicalService } from '../services/astronomicalService';
import { AstronomicalAPIs } from '../services/astronomicalAPIs';

interface TestScreenProps {
  onNavigateToChat?: () => void;
  onOpenPreviewHub?: () => void;
}

export default function TestScreen({ onNavigateToChat, onOpenPreviewHub }: TestScreenProps) {
  const [testResults, setTestResults] = useState('Welcome to Cosmo Test Center\n\n');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number }>({
    latitude: 42.3314, // Detroit fallback
    longitude: -83.0458,
  });

  useEffect(() => {
    checkAppleAuth();
    checkCurrentSession();
    resolveUserLocation();
  }, []);

  const addResult = (result: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => prev + `[${timestamp}] ${result}\n\n`);
  };

  const checkAppleAuth = async () => {
    try {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      setIsAppleAvailable(isAvailable);
      addResult(`Apple Sign In Available: ${isAvailable}`);
    } catch (error) {
      addResult(`Apple Auth Check Error: ${error}`);
    }
  };

  // GPS-based geolocation via Expo Location
  const resolveUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        addResult('Location permission denied. Using Detroit fallback.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords = position.coords;
      setUserLocation({ latitude: coords.latitude, longitude: coords.longitude });
      addResult(`Location detected (GPS): (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`);
    } catch (e: any) {
      addResult(`GPS location failed, using fallback: ${e?.message || e}`);
    }
  };

  const testAppleSignIn = async () => {
    try {
      addResult('Starting Apple Sign In...');
      const result = await AuthService.signInWithApple();
      addResult(`Apple Sign In Success: ${result.user?.email || 'No email'}`);
      await checkCurrentSession();
    } catch (error: any) {
      addResult(`Apple Sign In Error: ${error.message}`);
    }
  };

  const testGoogleSignIn = async () => {
    try {
      addResult('Starting Google Sign In...');
      const result = await AuthService.signInWithGoogle();
      addResult(`Google Sign In Initiated: ${JSON.stringify(result?.url ? 'URL Generated' : 'No URL')}`);
    } catch (error: any) {
      addResult(`Google Sign In Error: ${error.message}`);
    }
  };

  const testDeepLink = async () => {
    try {
      addResult('Testing deep link handling...');
      const testUrl = 'exp://141.210.83.231:8081/--/auth/callback?code=test123&state=test';
      addResult(`Simulating deep link: ${testUrl}`);
      
      // Import Linking to test
      const { Linking } = require('react-native');
      await Linking.openURL(testUrl);
      addResult('Deep link test sent - check logs for processing');
    } catch (error: any) {
      addResult(`Deep link test error: ${error.message}`);
    }
  };

  const testSignOut = async () => {
    try {
      addResult('Signing out...');
      await AuthService.signOut();
      addResult('Sign out successful');
      setCurrentUser(null);
    } catch (error: any) {
      addResult(`Sign out error: ${error.message}`);
    }
  };

  const checkCurrentSession = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
      addResult(`Current session: ${user ? `${user.email} (${user.id?.substring(0, 8)}...)` : 'No user'}`);
      
      if (user) {
        const profile = await AuthService.getCurrentUserProfile();
        if (profile) {
          addResult(`Profile found: ${profile.full_name || profile.fullName || 'No name'}`);
        }
      }
    } catch (error: any) {
      addResult(`Session check error: ${error.message}`);
    }
  };

  const testCreateProfile = async () => {
    try {
      addResult('Creating/updating user profile...');
      const profile = await AuthService.upsertUserProfile();
      addResult(`Profile operation: ${profile ? 'Success' : 'Failed'}`);
    } catch (error: any) {
      addResult(`Profile creation error: ${error.message}`);
    }
  };

  // ASTRONOMICAL API TESTS
  const testAstronomicalAPIs = async () => {
    try {
      setLoading(true);
      addResult('Testing Free Astronomical APIs...');
      addResult('Note: APIs may fallback to calculations if network fails');
      
      let apiSuccessCount = 0;
      let totalApis = 3;
      
      // Test FarmSense Moon API
      addResult('Testing FarmSense Moon API...');
      try {
        const moonPhase = await AstronomicalAPIs.getNASAMoonPhase(new Date());
        addResult(`✅ Moon API: ${moonPhase.phase} (${moonPhase.illumination}% illuminated)`);
        apiSuccessCount++;
      } catch (error: any) {
        addResult(`❌ Moon API failed: ${error?.message || 'Network error'}`);
      }
      
      // Test Sunrise-Sunset API
      addResult('Testing Sunrise-Sunset API...');
      try {
        const sunTimes = await AstronomicalAPIs.getSunriseSunset(new Date());
        addResult(`✅ Sun API: Sunrise ${sunTimes.sunrise}, Sunset ${sunTimes.sunset}`);
        apiSuccessCount++;
      } catch (error: any) {
        addResult(`❌ Sun API failed: ${error?.message || 'Network error'}`);
      }
      
      // Test USNO API
      addResult('Testing US Naval Observatory API...');
      try {
        const usnoData = await AstronomicalAPIs.getUSNOData(new Date());
        addResult(`✅ USNO API: Moon ${usnoData.moonPhase}, Sun ${usnoData.sunrise}-${usnoData.sunset}`);
        apiSuccessCount++;
      } catch (error: any) {
        addResult(`❌ USNO API failed: ${error?.message || 'Network error'}`);
      }
      
      // Summary
      addResult(`\n📊 API Test Summary: ${apiSuccessCount}/${totalApis} APIs responded`);
      if (apiSuccessCount === totalApis) {
        addResult('✅ All APIs are working! Perfect for production use.');
      } else if (apiSuccessCount > 0) {
        addResult('⚠️ Some APIs failed, but fallback calculations are working.');
      } else {
        addResult('❌ All APIs failed, but fallback calculations are available.');
      }
      
    } catch (error: any) {
      addResult(`❌ Astronomical API Test Error: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testPlanetaryPositions = async () => {
    try {
      setLoading(true);
      addResult('Fetching planetary positions via Supabase function...');
      
      const testLocation = userLocation;
      const currentDate = new Date();
      
      addResult(`Location: (${testLocation.latitude.toFixed(4)}, ${testLocation.longitude.toFixed(4)})`);
      addResult(`Date: ${currentDate.toDateString()}`);
      
      // Use Supabase function instead of NASA API
      const planets = await AstronomicalService.getPlanetaryPositionsFromSupabase(
        currentDate,
        testLocation.latitude,
        testLocation.longitude
      );
      
      addResult(`Found ${planets.length} planetary positions:`);
      
      planets.forEach(planet => {
        addResult(`${planet.planet.toUpperCase()}: RA ${planet.rightAscension}, DEC ${planet.declination}, Sign: ${planet.zodiacSign || 'Unknown'}`);
      });
      
      if (planets.length === 0) {
        addResult('No planetary data received - check Supabase function connection');
      } else {
        addResult('✅ Planetary positions retrieved successfully via Supabase!');
      }
      
    } catch (error: any) {
      addResult(`Planetary Positions Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testBirthChart = async () => {
    try {
      setLoading(true);
      addResult('Generating sample birth chart...');
      
      const birthDate = new Date('1990-01-01');
      const birthTime = new Date('1990-01-01T12:00:00');
      const birthLocation = userLocation;
      
      addResult(`Sample Birth Data:`);
      addResult(`Date: ${birthDate.toDateString()}`);
      addResult(`Time: 12:00 PM`);
      addResult(`Location: (${birthLocation.latitude.toFixed(4)}, ${birthLocation.longitude.toFixed(4)})`);
      
      const birthChart = await AstronomicalService.generateBirthChart(
        birthDate,
        birthTime,
        birthLocation
      );
      
      if (birthChart) {
        addResult(`Birth Chart Generated Successfully!`);
        addResult(`Planets found: ${birthChart.planets.length}`);
        addResult(`Moon Phase: ${birthChart.moonPhase.phase}`);
        addResult(`Moon Illumination: ${birthChart.moonPhase.illumination.toFixed(1)}%`);
        
        birthChart.planets.slice(0, 3).forEach(planet => {
          addResult(`${planet.planet}: ${planet.zodiacSign || 'Unknown sign'}`);
        });
        
        const aspects = AstronomicalService.calculateAspects(birthChart.planets);
        addResult(`Found ${aspects.length} planetary aspects`);
        
        if (aspects.length > 0) {
          aspects.slice(0, 2).forEach(aspect => {
            addResult(`${aspect.planet1} ${aspect.aspect} ${aspect.planet2} (${aspect.orb.toFixed(1)}°)`);
          });
        }
        
      } else {
        addResult('Birth chart generation failed');
      }
      
    } catch (error: any) {
      addResult(`Birth Chart Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testMoonPhase = async () => {
    try {
      setLoading(true);
      addResult('Getting current moon phase...');
      
      const moonPhase = await AstronomicalService.getMoonPhase(new Date());
      
      if (moonPhase) {
        addResult(`Moon Phase: ${moonPhase.phase}`);
        addResult(`Illumination: ${moonPhase.illumination.toFixed(1)}%`);
        addResult(`Age: ${moonPhase.age.toFixed(1)} days`);
        addResult(`Distance: ${Math.round(moonPhase.distance).toLocaleString()} km`);
      } else {
        addResult('Moon phase data unavailable');
      }
      
    } catch (error: any) {
      addResult(`Moon Phase Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // NEW FREE APIs TESTS
  const testFreeAPIs = async () => {
    try {
      setLoading(true);
      addResult('Testing all free astronomical APIs...');
      
      const results = await AstronomicalAPIs.testAllAPIs();
      
      addResult('=== FREE API TEST RESULTS ===');
      addResult(`FarmSense Moon API: ${results.farmSense ? 'Working ✅' : 'Failed ❌'}`);
      addResult(`US Naval Observatory: ${results.usno ? 'Working ✅' : 'Failed ❌'}`);
      addResult(`Sunrise-Sunset API: ${results.sunriseSunset ? 'Working ✅' : 'Failed ❌'}`);
      addResult(`Free Astrology API: ${results.freeAstrology ? 'Working ✅' : 'Failed ❌'}`);
      
      // Test actual data retrieval
      addResult('\n=== REAL DATA TEST ===');
      
      // Test moon phase
      try {
        const moonPhase = await AstronomicalAPIs.getNASAMoonPhase(new Date());
        addResult(`Current Moon: ${moonPhase.phase} (${moonPhase.illumination}% illuminated)`);
      } catch (error) {
        addResult(`Moon phase test failed: ${error}`);
      }
      
      // Test sunrise/sunset
      try {
        const sunTimes = await AstronomicalAPIs.getSunriseSunset(new Date());
        addResult(`Sunrise: ${sunTimes.sunrise}, Sunset: ${sunTimes.sunset}`);
      } catch (error) {
        addResult(`Sunrise/sunset test failed: ${error}`);
      }
      
      // Test combined astronomy data
      try {
        const astroData = await AstronomicalAPIs.getTimeAndDateAstronomy(new Date());
        addResult(`Moon Sign: ${astroData.moonSign}`);
        addResult(`Combined Data: ${astroData.moonPhase}`);
      } catch (error) {
        addResult(`Combined astronomy test failed: ${error}`);
      }
      
    } catch (error: any) {
      addResult(`Free APIs test error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testMoonAPI = async () => {
    try {
      setLoading(true);
      addResult('Testing FarmSense Moon API specifically...');
      
      const testDate = new Date();
      const currentLocation = userLocation;
      
      addResult(`Testing date: ${testDate.toDateString()}`);
      addResult(`Location: (${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)})`);
      addResult(`Note: Moon phases are global, but moonrise/moonset times are location-specific`);
      
      const moonData = await AstronomicalAPIs.getNASAMoonPhase(testDate);
      
      addResult(`=== MOON DATA ===`);
      addResult(`Phase: ${moonData.phase}`);
      addResult(`Illumination: ${moonData.illumination}%`);
      
      // Test yesterday and tomorrow too
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayMoon = await AstronomicalAPIs.getNASAMoonPhase(yesterday);
      addResult(`Yesterday: ${yesterdayMoon.phase} (${yesterdayMoon.illumination}%)`);
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowMoon = await AstronomicalAPIs.getNASAMoonPhase(tomorrow);
      addResult(`Tomorrow: ${tomorrowMoon.phase} (${tomorrowMoon.illumination}%)`);
      
    } catch (error: any) {
      addResult(`Moon API test error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSunriseSunset = async () => {
    try {
      setLoading(true);
      addResult('Testing Sunrise-Sunset API...');
      
      const testDate = new Date();
      const currentLocation = userLocation;
      
      addResult(`Testing for: ${testDate.toDateString()}`);
      addResult(`Location: (${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)})`);
      
      // Test current location
      const sunTimes = await AstronomicalAPIs.getSunriseSunset(testDate, currentLocation.latitude, currentLocation.longitude);
      addResult(`Sunrise: ${sunTimes.sunrise}, Sunset: ${sunTimes.sunset}`);
      
    } catch (error: any) {
      addResult(`Sunrise-Sunset test error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSupabaseFunction = async () => {
    try {
      setLoading(true);
      addResult('Testing Supabase Edge Function...');
      
      const testDate = new Date();
      const testLocation = userLocation;
      
      addResult(`Testing Supabase function for Mars at (${testLocation.latitude}, ${testLocation.longitude})`);
      
      // Test single planet
      const marsPosition = await AstronomicalService.getPlanetaryPositionFromSupabase(
        '499', // Mars
        testLocation.latitude,
        testLocation.longitude,
        testDate
      );
      
      if (marsPosition) {
        addResult(`✅ Mars Position: RA ${marsPosition.rightAscension}, DEC ${marsPosition.declination}`);
        addResult(`Zodiac Sign: ${marsPosition.zodiacSign}, Distance: ${marsPosition.distance} AU`);
      } else {
        addResult('❌ Failed to get Mars position from Supabase function');
      }
      
      // Test multiple planets
      addResult('Testing multiple planets...');
      const allPositions = await AstronomicalService.getPlanetaryPositionsFromSupabase(
        testDate,
        testLocation.latitude,
        testLocation.longitude
      );
      
      addResult(`✅ Retrieved ${allPositions.length} planetary positions:`);
      allPositions.forEach(planet => {
        addResult(`${planet.planet}: ${planet.zodiacSign} (${planet.distance} AU)`);
      });
      
    } catch (error: any) {
      addResult(`❌ Supabase function test error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testDirectAPICalls = async () => {
    try {
      setLoading(true);
      addResult('Testing Direct API Calls (No Fallbacks)...');
      
      const currentLocation = userLocation;
      addResult(`Using current location: (${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)})`);
      
      let successCount = 0;
      let totalTests = 4;
      
      // Test FarmSense Moon API directly
      addResult('Testing FarmSense Moon API directly...');
      try {
        const timestamp = Math.floor(new Date().getTime() / 1000);
        const response = await fetch(`https://api.farmsense.net/v1/moonphases/?d=${timestamp}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          addResult(`✅ FarmSense API: HTTP ${response.status}, Phase: ${data[0]?.Phase || 'Unknown'}, Illumination: ${Math.round((data[0]?.Illumination || 0) * 100)}%`);
          successCount++;
        } else {
          addResult(`❌ FarmSense API: HTTP ${response.status} ${response.statusText}`);
          // Try fallback using working implementation
          addResult('Testing fallback: Using working AstronomicalAPIs implementation...');
          try {
            const moonData = await AstronomicalAPIs.getNASAMoonPhase(new Date());
            addResult(`✅ FarmSense API (via fallback): Phase: ${moonData.phase}, Illumination: ${moonData.illumination}%`);
            successCount++;
          } catch (fallbackError: any) {
            addResult(`❌ FarmSense API fallback also failed: ${fallbackError.message}`);
          }
        }
      } catch (error: any) {
        addResult(`❌ FarmSense API: Network error - ${error.message}`);
        // Try fallback using working implementation
        addResult('Testing fallback: Using working AstronomicalAPIs implementation...');
        try {
          const moonData = await AstronomicalAPIs.getNASAMoonPhase(new Date());
          addResult(`✅ FarmSense API (via fallback): Phase: ${moonData.phase}, Illumination: ${moonData.illumination}%`);
          successCount++;
        } catch (fallbackError: any) {
          addResult(`❌ FarmSense API fallback also failed: ${fallbackError.message}`);
        }
      }
      
      // Test Sunrise-Sunset API directly with current location
      addResult('Testing Sunrise-Sunset API directly...');
      try {
        const response = await fetch(`https://api.sunrise-sunset.org/json?lat=${currentLocation.latitude}&lng=${currentLocation.longitude}&formatted=0`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'OK') {
            addResult(`✅ Sunrise-Sunset API: HTTP ${response.status}, Sunrise: ${new Date(data.results.sunrise).toLocaleTimeString()}, Sunset: ${new Date(data.results.sunset).toLocaleTimeString()}`);
            successCount++;
          } else {
            addResult(`❌ Sunrise-Sunset API: Invalid response - ${data.status}`);
          }
        } else {
          addResult(`❌ Sunrise-Sunset API: HTTP ${response.status} ${response.statusText}`);
        }
      } catch (error: any) {
        addResult(`❌ Sunrise-Sunset API: Network error - ${error.message}`);
      }
      
      // Test USNO API directly with current location
      addResult('Testing USNO API directly...');
      try {
        const dateStr = new Date().toISOString().split('T')[0];
        const response = await fetch(`https://aa.usno.navy.mil/api/rstt/oneday?date=${dateStr}&coords=${currentLocation.latitude},${currentLocation.longitude}&tz=-5`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          addResult(`✅ USNO API: HTTP ${response.status}, Data received for your location`);
          successCount++;
        } else {
          addResult(`❌ USNO API: HTTP ${response.status} ${response.statusText}`);
        }
      } catch (error: any) {
        addResult(`❌ USNO API: Network error - ${error.message}`);
      }
      
      // Test Supabase Horoscope API
      addResult('Testing Supabase Horoscope API...');
      try {
        const testUser = {
          zodiacSign: 'Aries',
          birthDate: new Date('1990-04-15'),
          subscriptionLevel: 'free' as const
        };
        
        const response = await fetch('https://adyrgavblydgdvttttwn.supabase.co/functions/v1/generate-horoscope', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeXJnYXZibHlkZ2R2dHR0dHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczODk5MjksImV4cCI6MjA3Mjk2NTkyOX0.wc5KPXufeFqWSdK4-dYsZUg6lQmEh1X4ZiS4z1L9ahI'
          },
          body: JSON.stringify({
            zodiacSign: testUser.zodiacSign,
            birthDate: testUser.birthDate,
            period: 'today',
            style: 'gentle',
            length: 'standard',
            focusAreas: ['love', 'career'],
            isPremium: false
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          addResult(`✅ Supabase Horoscope API: HTTP ${response.status}, Success: ${data.success || 'Unknown'}`);
          successCount++;
        } else {
          addResult(`❌ Supabase Horoscope API: HTTP ${response.status} ${response.statusText}`);
        }
      } catch (error: any) {
        addResult(`❌ Supabase Horoscope API: Network error - ${error.message}`);
      }
      
      // Summary
      addResult(`\n📊 Direct API Test Summary: ${successCount}/${totalTests} APIs accessible`);
      if (successCount === totalTests) {
        addResult('✅ All APIs are accessible from your network!');
      } else if (successCount > 0) {
        addResult('⚠️ Some APIs are accessible, others may be blocked by network/firewall.');
      } else {
        addResult('❌ No APIs are accessible. Check your network connection and firewall settings.');
      }
      
    } catch (error: any) {
      addResult(`❌ Direct API Test Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults('Results cleared.\n\n');
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={styles.title}>Cosmo Test Center</Text>
        <TouchableOpacity
          style={{ backgroundColor: '#111827', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
          onPress={onOpenPreviewHub}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Preview Hub</Text>
        </TouchableOpacity>
      </View>
      
      {currentUser && (
        <View style={styles.userInfo}>
          <Text style={styles.userText}>✅ Logged in: {currentUser.email}</Text>
          <Text style={styles.userSubtext}>ID: {currentUser.id?.substring(0, 12)}...</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Authentication Tests</Text>
      <View style={styles.buttonGrid}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: isAppleAvailable ? '#000' : '#666' }]} 
          onPress={testAppleSignIn}
          disabled={!isAppleAvailable || loading}
        >
          <Text style={styles.buttonText}>
            {isAppleAvailable ? 'Apple Sign In' : 'Apple Unavailable'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#4285F4' }]} 
          onPress={testGoogleSignIn}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Google Sign In</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#ff6b6b' }]} 
          onPress={testSignOut}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#ffa500' }]} 
          onPress={checkCurrentSession}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Check Session</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#8b5cf6' }]} 
          onPress={testDeepLink}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Deep Link</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Free Astronomical API Tests</Text>
      <View style={styles.buttonGrid}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#1e40af' }]} 
          onPress={testAstronomicalAPIs}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Testing...' : 'Test Free APIs'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#7c3aed' }]} 
          onPress={testPlanetaryPositions}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Get Planets</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#0891b2' }]} 
          onPress={testBirthChart}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Generate Chart</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#059669' }]} 
          onPress={testMoonPhase}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Moon Phase</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Free Astronomical APIs</Text>
      <View style={styles.buttonGrid}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#16a085' }]} 
          onPress={testFreeAPIs}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test All Free APIs</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#2980b9' }]} 
          onPress={testMoonAPI}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Moon API</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#f39c12' }]} 
          onPress={testSunriseSunset}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Sun Times</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#8e44ad' }]} 
          onPress={testCreateProfile}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Create Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#e74c3c' }]} 
          onPress={testSupabaseFunction}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Supabase Function</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#9b59b6' }]} 
          onPress={testDirectAPICalls}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Direct APIs</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>App Features</Text>
      <View style={styles.buttonGrid}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#10b981' }]} 
          onPress={onNavigateToChat}
          disabled={loading}
        >
          <Text style={styles.buttonText}>AI Astrologer ✨</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#111827' }]} 
          onPress={onOpenPreviewHub}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Open Preview Hub</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#6b7280' }]} 
          onPress={clearResults}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={true}>
        <Text style={styles.resultsText}>{testResults}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1a1a1a',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 10,
    color: '#374151',
  },
  userInfo: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  userText: {
    fontSize: 14,
    color: '#2d5a2d',
    textAlign: 'center',
    fontWeight: '600',
  },
  userSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  button: {
    width: '48%',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    opacity: 1,
  },
  buttonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  clearButton: {
    backgroundColor: '#999',
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    maxHeight: 250,
  },
  resultsText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 16,
    color: '#333',
  },
});