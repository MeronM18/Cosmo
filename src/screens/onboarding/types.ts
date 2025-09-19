export type GenderOption = 'male' | 'female' | 'other' | 'prefer_not_to_say' | '';

export interface OnboardingData {
  fullName: string;
  birthDate: Date | null;
  birthTime: Date | null;
  birthPlace: string;
  gender: GenderOption;
}

export interface StepScreenProps {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
  next: () => void;
  back: () => void;
  goToStep?: (step: number) => void;
}


