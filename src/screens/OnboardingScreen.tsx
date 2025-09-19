import React, { useState, useRef, useEffect } from 'react';
import { Alert, Animated, Dimensions, Keyboard } from 'react-native';
import { supabase } from '../services/supabase';
import { AuthService } from '../services/auth';
import WelcomeStep from './onboarding/WelcomeStep';
import NameStep from './onboarding/NameStep';
import BirthDateStep from './onboarding/BirthDateStep';
import BirthTimeStep from './onboarding/BirthTimeStep';
import BirthLocationStep from './onboarding/BirthLocationStep';
import CompleteStep from './onboarding/CompleteStep';
import type { OnboardingData } from './onboarding/types';

interface OnboardingScreenProps {
  onComplete?: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState<number>(1);
  const [data, setData] = useState<OnboardingData>({
    fullName: '',
    birthDate: null,
    birthTime: null,
    birthPlace: '',
    gender: '',
  });
  const [saving, setSaving] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get('window');

  const update = (patch: Partial<OnboardingData>) => setData(prev => ({ ...prev, ...patch }));
  
  const next = () => {
    const newStep = Math.min(step + 1, 5);
    if (newStep !== step) {
      Keyboard.dismiss(); // Close keyboard when navigating
      Animated.timing(slideAnim, {
        toValue: -(newStep - 1) * width, // Adjust for starting at step 1
        duration: 300,
        useNativeDriver: true,
      }).start();
      setStep(newStep);
    }
  };
  
  const back = () => {
    if (step === 1) {
      // If on first step (name), go back to preview hub
      onComplete?.();
      return;
    }
    const newStep = Math.max(step - 1, 1);
    if (newStep !== step) {
      Keyboard.dismiss(); // Close keyboard when navigating
      Animated.timing(slideAnim, {
        toValue: -(newStep - 1) * width, // Adjust for starting at step 1
        duration: 300,
        useNativeDriver: true,
      }).start();
      setStep(newStep);
    }
  };

  const persistProfile = async () => {
    try {
      setSaving(true);
      const { data: authData, error: userError } = await supabase.auth.getUser();
      const user = authData?.user;
      if (userError || !user) throw new Error('User not authenticated');

      const birthTimeString = data.birthTime ? data.birthTime.toTimeString().split(' ')[0] : null;
      const payload = {
        id: user.id,
        email: user.email || '',
        full_name: data.fullName.trim(),
        birth_date: data.birthDate ? data.birthDate.toISOString().split('T')[0] : null,
        birth_time: birthTimeString,
        birth_place: data.birthPlace.trim(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        gender: (data.gender || null) as any,
        subscription_status: 'free',
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('user_profiles').upsert(payload, { onConflict: 'id' });
      if (error) throw error;
      await AuthService.setCompletedOnboarding?.();
          onComplete?.();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Animated.View style={{
      flex: 1,
      flexDirection: 'row',
      width: width * 5, // 5 steps total (removed welcome)
      transform: [{ translateX: slideAnim }]
    }}>
      <Animated.View style={{ width }}>
        <NameStep data={data} update={update} next={next} back={back} />
      </Animated.View>
      <Animated.View style={{ width }}>
        <BirthDateStep data={data} update={update} next={next} back={back} />
      </Animated.View>
      <Animated.View style={{ width }}>
        <BirthTimeStep data={data} update={update} next={next} back={back} />
      </Animated.View>
      <Animated.View style={{ width }}>
        <BirthLocationStep data={data} update={update} next={() => setStep(5)} back={back} />
      </Animated.View>
      <Animated.View style={{ width }}>
        <CompleteStep data={data} update={update} next={next} back={back} onFinish={persistProfile} />
      </Animated.View>
    </Animated.View>
  );
}
