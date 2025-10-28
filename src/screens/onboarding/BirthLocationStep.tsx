import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Keyboard, TouchableWithoutFeedback, Animated } from 'react-native';
import CosmicBackground from './components/CosmicBackground';
import type { StepScreenProps, OnboardingData } from './types';
import { AppColors, Typography } from '../../theme/appTheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Config } from '../../utils/constants';

// GeoNames API configuration - Free 30k requests/day
const GEONAMES_USERNAME = Config.geoNamesUsername;
const GEONAMES_API_URL = 'http://api.geonames.org/searchJSON';

interface GeoNamesPlace {
  geonameId: number;
  name: string;
  countryName: string;
  adminName1?: string; // state/province
  lat: string;
  lng: string;
  population: number;
}

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

const LoaderDots: React.FC = () => {
  const dot1Anim = useRef(new Animated.Value(0.3)).current;
  const dot2Anim = useRef(new Animated.Value(0.3)).current;
  const dot3Anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const createAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 600,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animation = Animated.parallel([
      createAnimation(dot1Anim, 0),
      createAnimation(dot2Anim, 200),
      createAnimation(dot3Anim, 400),
    ]);

    animation.start();

    return () => animation.stop();
  }, []);

  return (
    <View style={styles.loaderAnimation}>
      <Animated.View style={[styles.loaderDot, { opacity: dot1Anim }]} />
      <Animated.View style={[styles.loaderDot, { opacity: dot2Anim }]} />
      <Animated.View style={[styles.loaderDot, { opacity: dot3Anim }]} />
    </View>
  );
};

interface BirthLocationStepProps extends StepScreenProps {
  onFinish?: (finalData: OnboardingData) => void;
}

export default function BirthLocationStep({ data, update, next, back, onFinish }: BirthLocationStepProps) {
  const [query, setQuery] = useState<string>(data.birthPlace || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedCity, setSelectedCity] = useState<string>(data.birthPlace || '');
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const activeControllerRef = useRef<AbortController | null>(null);

  // Update query when data.birthPlace changes (e.g., when navigating back)
  useEffect(() => {
    if (data.birthPlace && data.birthPlace !== query) {
      console.log('🔄 Restoring birthPlace from data:', data.birthPlace);
      setQuery(data.birthPlace);
      setSelectedCity(data.birthPlace);
    }
  }, [data.birthPlace]);

  // Fetch place suggestions from GeoNames API
  const fetchPlaceSuggestions = async (input: string) => {
    if (!input.trim() || input.length < 3) {
      setSuggestions([]);
      return;
    }

    // Don't show suggestions if the current input matches the selected city
    if (input === selectedCity) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      if (!GEONAMES_USERNAME) {
        console.error('GeoNames username not configured');
        setSuggestions([]);
        setIsSearching(false);
        return;
      }

      // Abort any in-flight request when starting a new one
      activeControllerRef.current?.abort();
      const controller = new AbortController();
      activeControllerRef.current = controller;

      const params = new URLSearchParams({
        q: input,
        maxRows: '10',
        username: GEONAMES_USERNAME,
        featureClass: 'P', // P = cities, villages, populated places
        orderby: 'population', // Sort by population (biggest cities first)
        style: 'FULL', // Include all details
      });

      const url = `${GEONAMES_API_URL}?${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      const data = await response.json();

      // Check for GeoNames API errors (they return 200 even for errors!)
      if (data.status) {
        const errorMsg = data.status.message || 'Unknown GeoNames error';
        console.error(`❌ GeoNames error: ${errorMsg}`);
        
        if (errorMsg.includes('not enabled')) {
          console.error('⚠️  Enable at: http://www.geonames.org/manageaccount');
        }
        
        setSuggestions([]);
        setIsSearching(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (Array.isArray(data.geonames) && data.geonames.length > 0) {
        // Convert GeoNames format to our PlacePrediction format
        const predictions: PlacePrediction[] = data.geonames.map((place: GeoNamesPlace) => {
          const cityName = place.name;
          const stateName = place.adminName1;
          const countryName = place.countryName;
          
          // Format: "City, State, Country" or "City, Country" if no state
          const secondaryText = stateName 
            ? `${stateName}, ${countryName}`
            : countryName;
          const description = stateName
            ? `${cityName}, ${stateName}, ${countryName}`
            : `${cityName}, ${countryName}`;

          return {
            place_id: place.geonameId.toString(),
            description: description,
            structured_formatting: {
              main_text: cityName,
              secondary_text: secondaryText,
            },
          };
        });

        setSuggestions(predictions.slice(0, 6));
      } else {
        setSuggestions([]);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return; // Don't clear suggestions, let the next request handle it
      }
      console.error('GeoNames fetch error:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
      activeControllerRef.current = null;
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPlaceSuggestions(query);
    }, 300); // 300ms delay for debouncing

    return () => clearTimeout(timeoutId);
  }, [query]);

  const onContinue = () => {
    const birthPlace = query.trim();
    if (!birthPlace) {
      console.log('❌ No city entered');
      return;
    }
    console.log('✅ Completing with birthPlace:', birthPlace);
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Create the complete updated data object
    const completeData = { ...data, birthPlace };
    console.log('📦 Complete data being passed:', completeData);
    
    // Update local state
    update({ birthPlace });
    
    // Pass the complete data to onFinish
    onFinish?.(completeData);
  };

  return (
    <CosmicBackground>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={styles.backCircle} onPress={back} activeOpacity={0.8}>
                <Ionicons name="chevron-back" size={22} color={AppColors.onSurface} />
              </TouchableOpacity>
              <View style={styles.stepContainer}>
                <Text style={styles.stepText}>Step 5 of 5</Text>
                {/* Progress */}
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={[AppColors.secondary, AppColors.secondaryVariant]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={[styles.progressFill, { width: '100%' }]}
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.centerBlock}>
            <Text style={[
              styles.title,
              (suggestions.length > 0) && styles.titleWithSuggestions,
              (isInputFocused && suggestions.length === 0) && styles.titleRaised,
            ]}>WHERE WERE YOU{"\n"}BORN?</Text>
            <Text style={[
              styles.subtitle,
              (suggestions.length > 0) && styles.subtitleWithSuggestions,
              (isInputFocused && suggestions.length === 0) && styles.subtitleRaised,
            ]}>Your birth location helps create accurate readings</Text>

        <View style={styles.inputContainer}>
          {query.trim() && (
            <Text style={styles.inputLabel}>Birth City</Text>
          )}
          <View style={styles.inputWrapper}>
            <Ionicons name="location-outline" size={18} color={AppColors.secondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, query.trim() && styles.inputWithLabel]}
              value={query}
              onChangeText={(text) => {
                setQuery(text);
                if (!text.trim()) {
                  setSuggestions([]);
                  setSelectedCity(''); // Reset selected city when input is cleared
                } else if (text !== selectedCity) {
                  setSelectedCity(''); // Reset selected city when user starts typing something different
                }
              }}
              allowFontScaling={true}
              maxFontSizeMultiplier={1.3}
              placeholder={query.trim() ? "" : "Enter your birth city..."}
              placeholderTextColor="rgba(255,255,255,0.5)"
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="words"
              spellCheck={false}
              textContentType="addressCity"
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              onSubmitEditing={() => {
                // When the user taps Done, perform a search and show suggestions.
                // Do not auto-select anything; let the user pick.
                Keyboard.dismiss();
                fetchPlaceSuggestions(query);
              }}
            />
            {query.trim() && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => {
                  setQuery(''); 
                  setSuggestions([]);
                  setSelectedCity(''); // Reset selected city when cleared
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={16} color="#A68CCF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {(suggestions.length > 0 || isSearching) && (
          <View style={styles.suggestionsContainer}>
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <LoaderDots />
                <Text style={styles.loadingText}>Searching locations...</Text>
              </View>
            ) : (
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item.place_id}
                style={styles.suggestions}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.suggestionItem} 
                    onPress={() => {
                      setQuery(item.description);
                      setSelectedCity(item.description); // Remember the selected city
                      setSuggestions([]); // Clear suggestions after selection
                      Keyboard.dismiss();
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="location" size={16} color={AppColors.secondary} style={styles.suggestionIcon} />
                    <View style={styles.suggestionTextContainer}>
                      <Text style={styles.suggestionMainText}>{item.structured_formatting?.main_text || item.description}</Text>
                      <Text style={styles.suggestionSecondaryText}>{item.structured_formatting?.secondary_text || ''}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        )}
          </View>

          {/* Bottom Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.continueButton, (!query.trim() || isLoading) && styles.continueBtnDisabled]}
              disabled={!query.trim() || isLoading}
              onPress={onContinue}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[AppColors.secondary, AppColors.secondaryVariant]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.continueButtonGradient}
              >
                <Text style={styles.continueButtonText}>{isLoading ? '...' : 'Complete Setup'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 75 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepContainer: { marginLeft: 0, width: 120 },
  backCircle: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)' },
  stepText: { color: AppColors.textSecondary, fontSize: 16 },
  progressBar: { width: '100%', height: 8, backgroundColor: 'rgba(107,76,122,0.3)', borderRadius: 8, overflow: 'hidden', marginTop: 4 },
  progressFill: { height: '100%', borderRadius: 8, shadowColor: AppColors.secondary, shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  centerBlock: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { textAlign: 'center', color: AppColors.onSurface, fontSize: 32, fontWeight: '700', letterSpacing: 0.5, marginTop: -200, marginBottom: 12, textTransform: 'uppercase', fontFamily: 'Cinzel_700Bold' },
  titleWithSuggestions: { marginTop: -120 },
  // When focused but no suggestions yet, raise content slightly upward
  titleRaised: { marginTop: -280 },
  subtitle: { textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 16, lineHeight: 22, marginBottom: 36, paddingHorizontal: 32 },
  subtitleWithSuggestions: { marginBottom: 24 },
  subtitleRaised: { marginBottom: 28 },
  inputContainer: { width: '100%', marginHorizontal: 20, marginBottom: 8, marginTop: 10, position: 'relative' },
  inputLabel: { 
    position: 'absolute', 
    top: -12, 
    left: 12, 
    backgroundColor: AppColors.secondary, 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 4, 
    fontSize: 12, 
    color: AppColors.onSurface, 
    fontWeight: '500',
    zIndex: 1 
  },
  inputWrapper: { position: 'relative' },
  inputIcon: { position: 'absolute', left: 16, top: '50%', marginTop: -9, zIndex: 1 },
  input: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 44, paddingVertical: 20, fontSize: 18, color: AppColors.onSurface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', shadowColor: AppColors.secondary, shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
  inputWithLabel: { borderColor: AppColors.secondary, borderWidth: 2 },
  clearButton: { position: 'absolute', right: 16, top: '50%', marginTop: -8, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  suggestionsContainer: { width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, marginTop: 20, overflow: 'hidden', height: 252 }, // 63px per item × 4 = 252px
  suggestions: { flexGrow: 0 },
  loadingContainer: { paddingVertical: 20, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', height: 120 },
  loaderAnimation: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  loaderDot: { 
    width: 10, 
    height: 10, 
    borderRadius: 5, 
    backgroundColor: AppColors.secondary, 
    marginHorizontal: 4
  },
  loadingText: { color: AppColors.secondary, fontSize: 14, fontStyle: 'italic', textAlign: 'center' },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, borderBottomColor: 'rgba(255,255,255,0.1)', borderBottomWidth: 1, height: 63 }, // Fixed height: 16 + 16 padding + ~30 content + 1 border = 63px
  suggestionIcon: { marginRight: 12 },
  suggestionTextContainer: { flex: 1 },
  suggestionMainText: { color: AppColors.onSurface, fontSize: 16, fontWeight: '600' },
  suggestionSecondaryText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 2 },
  buttonContainer: { position: 'absolute', left: 0, right: 0, bottom: 14, paddingBottom: 34, paddingTop: 20, paddingHorizontal: 20 },
  continueButton: { borderRadius: 15, marginBottom: 16, overflow: 'hidden' },
  continueButtonGradient: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  continueBtnDisabled: { opacity: 0.5 },
  continueButtonText: { color: AppColors.onSurface, fontSize: 18, fontWeight: '600' },
});


