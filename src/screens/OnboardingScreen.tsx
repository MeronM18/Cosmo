import React, { useState, useRef, useEffect } from 'react';
import { Animated, Dimensions, Keyboard, Easing } from 'react-native';
import WelcomeStep from './onboarding/WelcomeStep';
import NameStep from './onboarding/NameStep';
import GenderStep from './onboarding/GenderStep';
import BirthDateStep from './onboarding/BirthDateStep';
import BirthTimeStep from './onboarding/BirthTimeStep';
import BirthLocationStep from './onboarding/BirthLocationStep';
import CompleteStep from './onboarding/CompleteStep';
import type { OnboardingData } from './onboarding/types';

interface OnboardingScreenProps {
  onComplete?: (data: OnboardingData) => void;
  onBackToLanding?: () => void;
  startStep?: number;
  initialData?: OnboardingData | null;
}

export default function OnboardingScreen({ onComplete, onBackToLanding, startStep = 1, initialData }: OnboardingScreenProps) {
  const [step, setStep] = useState<number>(startStep);
  const [data, setData] = useState<OnboardingData>(initialData || {
    fullName: '',
    birthDate: null,
    birthTime: null,
    birthPlace: '',
    gender: '',
  });
  const [saving, setSaving] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get('window');
  
  // Debug step changes
  useEffect(() => {
    // console.log('🟢 OnboardingScreen: Step changed to:', step);
  }, [step]);

  // Initialize slide animation position based on start step
  useEffect(() => {
    slideAnim.setValue(-(startStep - 1) * width);
  }, [startStep, slideAnim, width]);

  // Update data when initialData changes (e.g., when going back from login)
  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  const update = (patch: Partial<OnboardingData>) => setData(prev => ({ ...prev, ...patch }));
  
  const next = () => {
    const newStep = Math.min(step + 1, 5);
    // console.log('🟢 OnboardingScreen: next() called, current step:', step, 'new step:', newStep);
    if (newStep !== step) {
      Keyboard.dismiss(); // Close keyboard when navigating
      Animated.timing(slideAnim, {
        toValue: -(newStep - 1) * width, // Adjust for starting at step 1
        duration: 300,
        useNativeDriver: true,
      }).start();
      // console.log('🟢 OnboardingScreen: Setting step to:', newStep);
      setStep(newStep);
    }
  };
  
  const back = () => {
    if (step === 1) {
      // If on first step, go back to landing screen
      onBackToLanding?.();
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


  return (
    <Animated.View style={{
      flex: 1,
      flexDirection: 'row',
      width: width * 5, // 5 steps total
      transform: [{ translateX: slideAnim }]
    }}>
      <Animated.View style={{ width }}>
        <NameStep data={data} update={update} next={next} back={back} />
      </Animated.View>
      <Animated.View style={{ width }}>
        <GenderStep data={data} update={update} next={next} back={back} />
      </Animated.View>
      <Animated.View style={{ width }}>
        <BirthDateStep data={data} update={update} next={next} back={back} />
      </Animated.View>
      <Animated.View style={{ width }}>
        <BirthTimeStep data={data} update={update} next={next} back={back} />
      </Animated.View>
      <Animated.View style={{ width }}>
        <BirthLocationStep 
          data={data} 
          update={update} 
          next={next} 
          back={back} 
          onFinish={(completeData) => {
            console.log('🟡 OnboardingScreen: onFinish called with completeData:', completeData);
            onComplete?.(completeData);
          }}
        />
      </Animated.View>
    </Animated.View>
  );
}

