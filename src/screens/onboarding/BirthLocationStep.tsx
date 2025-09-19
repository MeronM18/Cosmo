import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Keyboard, TouchableWithoutFeedback, Animated } from 'react-native';
import CosmicBackground from './components/CosmicBackground';
import type { StepScreenProps } from './types';
import { AppColors, Typography } from '../../theme/appTheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

// Google Maps Places API configuration
const GOOGLE_MAPS_API_KEY = 'AIzaSyA4kPoGd8_r2-h6ezkWPRemO6RafQCWF0Y';
const PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';

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

export default function BirthLocationStep({ data, update, next, back }: StepScreenProps) {
  const [query, setQuery] = useState<string>(data.birthPlace || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedCity, setSelectedCity] = useState<string>(data.birthPlace || '');
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);

  // Fetch place suggestions from Google Places API
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
      const url = `${PLACES_API_URL}?input=${encodeURIComponent(input)}&types=(cities)&key=${GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.predictions) {
        setSuggestions(data.predictions.slice(0, 4));
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching place suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
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
    if (!query.trim()) return;
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    update({ birthPlace: query.trim() });
    
    setTimeout(() => {
      setIsLoading(false);
      next();
    }, 500);
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
                <Text style={styles.stepText}>Step 4 of 4</Text>
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
            <TouchableOpacity
              onPress={back}
              style={styles.closeButton}
              activeOpacity={0.8}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
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
                      <Text style={styles.suggestionMainText}>{item.structured_formatting.main_text}</Text>
                      <Text style={styles.suggestionSecondaryText}>{item.structured_formatting.secondary_text}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        )}

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
  closeButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  closeText: { color: AppColors.onSurface, fontSize: 16, fontWeight: '700' },
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
  continueButton: { borderRadius: 15, marginBottom: 16, overflow: 'hidden', width: '100%' },
  continueButtonGradient: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  continueBtnDisabled: { opacity: 0.5 },
  continueButtonText: { color: AppColors.onSurface, fontSize: 18, fontWeight: '600' },
});


