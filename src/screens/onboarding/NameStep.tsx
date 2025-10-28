import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Animated, Keyboard, TouchableWithoutFeedback } from 'react-native';
import CosmicBackground from './components/CosmicBackground';
import type { StepScreenProps } from './types';
import { AppColors, Typography } from '../../theme/appTheme';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function NameStep({ data, update, next, back }: StepScreenProps) {
  const [name, setName] = useState<string>(data.fullName);
  const inputRef = useRef<TextInput>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Just autofocus, don't load saved name
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shake, { toValue: 10, duration: 70, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -10, duration: 70, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const onContinue = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setHasError(true);
      setErrorMessage('Please enter your name');
      triggerShake();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      return;
    }
    if (trimmed.length < 2) {
      setHasError(true);
      setErrorMessage('Name must be at least 2 characters');
      triggerShake();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      return;
    }
    const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
    if (!nameRegex.test(trimmed)) {
      setHasError(true);
      setErrorMessage('Please enter a valid name');
      triggerShake();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      return;
    }
    setHasError(false);
    setErrorMessage('');
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Save name and proceed
    update({ fullName: trimmed });
    SecureStore.setItemAsync('user_name', trimmed).finally(() => {
      setTimeout(() => {
        setIsLoading(false);
        next();
      }, 500);
    });
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
              <Text style={styles.stepText}>Step 1 of 5</Text>
              {/* Progress */}
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={[AppColors.secondary, AppColors.secondaryVariant]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={[styles.progressFill, { width: '20%' }]}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.centerBlock}>
          <Text style={styles.title}>WHAT SHOULD WE{"\n"}CALL YOU?</Text>
          <Text style={styles.subtitle}>Let the cosmos know who they're guiding today</Text>

          <Animated.View style={[styles.inputContainer, { transform: [{ translateX: shake }] }]}>
            {name.trim() && (
              <Text style={styles.inputLabel}>Your Name</Text>
            )}
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color={AppColors.secondary} style={styles.inputIcon} />
              <TextInput
                ref={inputRef}
                style={[styles.inputField, name.trim() && styles.inputFieldWithLabel]}
                value={name}
                onChangeText={(t) => { setName(t); if (hasError) { setHasError(false); setErrorMessage(''); } }}
                placeholder={name.trim() ? "" : "Your Name"}
                placeholderTextColor="#A68CCF"
                autoCapitalize="words"
                returnKeyType="done"
                allowFontScaling={true}
                maxFontSizeMultiplier={1.3}
                onSubmitEditing={() => {
                  if (name.trim()) {
                    onContinue();
                  }
                }}
              />
              {name.trim() && (
                <TouchableOpacity 
                  style={styles.clearButton} 
                  onPress={() => {
                    setName('');
                    if (hasError) { 
                      setHasError(false); 
                      setErrorMessage(''); 
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={16} color="#A68CCF" />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
          {hasError ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          </View>

        {/* Bottom Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.continueButton, (!name.trim() || isLoading) && styles.continueBtnDisabled]}
            onPress={onContinue}
            disabled={!name.trim() || isLoading}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[AppColors.secondary, AppColors.secondaryVariant]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.continueButtonGradient}
            >
              <Text style={styles.continueButtonText}>{isLoading ? '...' : 'Continue'}</Text>
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
  backText: { color: AppColors.onSurface, fontSize: 18 },
  stepText: { color: AppColors.textSecondary, fontSize: 16 },
  closeButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  closeText: { color: AppColors.onSurface, fontSize: 16, fontWeight: '700' },
  progressContainer: { marginTop: 50, marginBottom: 8, alignItems: 'center' },
  progressBar: { width: '100%', height: 8, backgroundColor: 'rgba(107,76,122,0.3)', borderRadius: 8, overflow: 'hidden', marginTop: 4 },
  progressFill: { height: '100%', borderRadius: 8, shadowColor: AppColors.secondary, shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  centerBlock: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { textAlign: 'center', color: AppColors.onSurface, fontSize: 32, fontWeight: '700', letterSpacing: 0.5, marginTop: -340, marginBottom: 12, textTransform: 'uppercase', fontFamily: 'Cinzel_700Bold' },
  subtitle: { textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 16, lineHeight: 22, marginBottom: 36, paddingHorizontal: 32 },
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
  inputField: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 44, paddingVertical: 20, fontSize: 18, color: AppColors.onSurface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', shadowColor: AppColors.secondary, shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
  inputFieldWithLabel: { borderColor: AppColors.secondary, borderWidth: 2 },
  inputIcon: { position: 'absolute', left: 16, top: '50%', marginTop: -9 },
  clearButton: { position: 'absolute', right: 16, top: '50%', marginTop: -8, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: AppColors.error, marginTop: 8, alignSelf: 'flex-start' },
  buttonContainer: { position: 'absolute', left: 0, right: 0, bottom: 14, paddingBottom: 34, paddingTop: 20, paddingHorizontal: 20 },
  continueButton: { borderRadius: 15, marginBottom: 16, overflow: 'hidden' },
  continueButtonGradient: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  continueBtnDisabled: { opacity: 0.5 },
  continueButtonText: { color: AppColors.onSurface, fontSize: 18, fontWeight: '600' },
});


