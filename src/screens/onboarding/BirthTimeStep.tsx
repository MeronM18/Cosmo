import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
  ScrollView,
  Animated,
} from 'react-native';
import CosmicBackground from './components/CosmicBackground';
import type { StepScreenProps } from './types';
import { AppColors, Typography } from '../../theme/appTheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface TimeWheelProps {
  value: Date;
  onChange: (time: Date) => void;
}

const CustomTimeWheel: React.FC<TimeWheelProps> = ({ value, onChange }) => {
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const periods = ['AM', 'PM'];

  const [selectedHour, setSelectedHour] = useState(value.getHours() % 12 || 12);
  const [selectedMinute, setSelectedMinute] = useState(value.getMinutes());
  const [selectedPeriod, setSelectedPeriod] = useState(value.getHours() >= 12 ? 'PM' : 'AM');

  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);
  const periodScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const newDate = new Date(value);
    const hour24 = selectedHour === 12 ? 0 : selectedHour;
    const finalHour = selectedPeriod === 'PM' ? hour24 + 12 : hour24;
    
    newDate.setHours(finalHour, selectedMinute, 0, 0);
    onChange(newDate);
  }, [selectedHour, selectedMinute, selectedPeriod]);

  const scrollToIndex = (scrollRef: React.RefObject<ScrollView | null>, index: number) => {
    scrollRef.current?.scrollTo({
      y: index * ITEM_HEIGHT,
      animated: true,
    });
  };

  const handleScroll = (
    event: any,
    items: any[],
    setter: (value: any) => void
  ) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
    console.log('Scroll event - Y:', y, 'Index:', index, 'Value:', items[clampedIndex]);
    setter(items[clampedIndex]);
  };

  const renderPickerColumn = (
    items: any[],
    selectedValue: any,
    onValueChange: (value: any) => void,
    scrollRef: React.RefObject<ScrollView | null>,
    formatter?: (item: any) => string
  ) => {
    return (
      <View style={timeWheelStyles.pickerColumn}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          scrollEnabled={true}
          bounces={false}
          onMomentumScrollEnd={(event) => handleScroll(event, items, onValueChange)}
          onScrollEndDrag={(event) => handleScroll(event, items, onValueChange)}
          contentContainerStyle={{
            paddingTop: ITEM_HEIGHT * 2,
            paddingBottom: ITEM_HEIGHT * 2,
          }}
        >
          {items.map((item, index) => {
            const isSelected = item === selectedValue;
            return (
              <View key={index} style={timeWheelStyles.pickerItem}>
                <Text
                  style={[
                    timeWheelStyles.pickerText,
                    isSelected && timeWheelStyles.selectedPickerText,
                  ]}
                >
                  {formatter ? formatter(item) : item}
                </Text>
              </View>
            );
          })}
        </ScrollView>
        
        {/* Selection indicator overlay */}
        <View style={timeWheelStyles.selectionOverlay}>
          <View style={timeWheelStyles.selectionIndicator} />
        </View>
      </View>
    );
  };

  useEffect(() => {
    // Initial scroll positions
    setTimeout(() => {
      scrollToIndex(hourScrollRef, selectedHour - 1);
      scrollToIndex(minuteScrollRef, selectedMinute);
      scrollToIndex(periodScrollRef, selectedPeriod === 'AM' ? 0 : 1);
    }, 100);
  }, []);

  return (
    <View style={timeWheelStyles.container}>
      <View style={timeWheelStyles.pickerContainer}>
        {/* Hours */}
        {renderPickerColumn(
          hours,
          selectedHour,
          setSelectedHour,
          hourScrollRef
        )}
        
        {/* Separator */}
        <View style={timeWheelStyles.separator}>
          <Text style={timeWheelStyles.separatorText}>:</Text>
        </View>
        
        {/* Minutes */}
        {renderPickerColumn(
          minutes,
          selectedMinute,
          setSelectedMinute,
          minuteScrollRef,
          (minute) => minute.toString().padStart(2, '0')
        )}
        
        {/* AM/PM */}
        {renderPickerColumn(
          periods,
          selectedPeriod,
          setSelectedPeriod,
          periodScrollRef
        )}
      </View>
    </View>
  );
};

function normalizeTime(input: Date): Date {
  const d = new Date(input);
  d.setSeconds(0, 0);
  return d;
}

export default function BirthTimeStep({ data, update, next, back }: StepScreenProps) {
  const [tempTime, setTempTime] = useState<Date>(() => {
    return data.birthTime || new Date();
  });
  const [unknown, setUnknown] = useState<boolean>(!data.birthTime);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onContinue = () => {
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    update({ birthTime: unknown ? null : tempTime });
    
    setTimeout(() => {
      setIsLoading(false);
      next();
    }, 500);
  };

  const handleTimeChange = (time: Date) => {
    setTempTime(time);
  };

  return (
    <CosmicBackground>
      <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={styles.backCircle} onPress={back} activeOpacity={0.8}>
                <Ionicons name="chevron-back" size={22} color={AppColors.onSurface} />
              </TouchableOpacity>
              <View style={styles.stepContainer}>
                <Text style={styles.stepText}>Step 3 of 4</Text>
                {/* Progress */}
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={[AppColors.secondary, AppColors.secondaryVariant]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={[styles.progressFill, { width: '75%' }]}
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
            <Text style={styles.title}>WHAT TIME WERE{"\n"}YOU BORN?</Text>
            <Text style={styles.subtitle}>If you don't know, you can skip this step.</Text>

             <View style={styles.toggleRow}>
               <TouchableOpacity
                 style={[styles.toggleBtn, !unknown && styles.toggleSelected]}
                 onPress={() => setUnknown(false)}
               >
                 <Text style={[styles.toggleText, !unknown && styles.toggleTextSelected]}>Known Time</Text>
               </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, unknown && styles.toggleSelected]}
                onPress={() => setUnknown(true)}
              >
                <Text style={[styles.toggleText, unknown && styles.toggleTextSelected]}>Unknown</Text>
              </TouchableOpacity>
            </View>

             {!unknown && (
               <View style={styles.pickerCard}>
                 <CustomTimeWheel
                   value={tempTime}
                   onChange={handleTimeChange}
                 />
               </View>
             )}
          </View>

          {/* Bottom Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.continueButton, isLoading && styles.continueBtnDisabled]}
              onPress={onContinue}
              disabled={isLoading}
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
    </CosmicBackground>
  );
}

const timeWheelStyles = StyleSheet.create({
  container: {
    height: PICKER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: PICKER_HEIGHT,
    width: '100%',
  },
  pickerColumn: {
    flex: 1,
    height: PICKER_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 20,
    color: AppColors.textSecondary,
    fontWeight: '400',
  },
  selectedPickerText: {
    color: AppColors.onSurface,
    fontWeight: '600',
  },
  separator: {
    width: 20,
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separatorText: {
    fontSize: 20,
    color: AppColors.onSurface,
    fontWeight: '600',
  },
  selectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  selectionIndicator: {
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});

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
  title: { textAlign: 'center', color: AppColors.onSurface, fontSize: 32, fontWeight: '700', letterSpacing: 0.5, marginTop: -180, marginBottom: 12, textTransform: 'uppercase', fontFamily: 'Cinzel_700Bold' },
  subtitle: { textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 16, lineHeight: 22, marginBottom: 24, paddingHorizontal: 32 },
  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 16, width: '100%' },
  toggleBtn: { flex: 1, borderColor: AppColors.inactive, borderWidth: 1.5, borderRadius: 12, alignItems: 'center', paddingVertical: 12 },
  toggleSelected: { borderColor: AppColors.secondary, backgroundColor: 'rgba(138,79,255,0.12)' },
  toggleText: { color: AppColors.inactive, fontWeight: '500' },
  toggleTextSelected: { color: AppColors.secondary, fontWeight: '600' },
  pickerCard: { 
    backgroundColor: 'rgba(255,255,255,0.15)', 
    borderRadius: 12, 
    padding: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.3)', 
    shadowColor: AppColors.secondary, 
    shadowOpacity: 0.4, 
    shadowRadius: 8, 
    shadowOffset: { width: 0, height: 0 }, 
    marginTop: 20, 
    width: '100%' 
  },
  buttonContainer: { position: 'absolute', left: 0, right: 0, bottom: 14, paddingBottom: 34, paddingTop: 20, paddingHorizontal: 20 },
  continueButton: { borderRadius: 15, marginBottom: 16, overflow: 'hidden' },
  continueButtonGradient: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  continueBtnDisabled: { opacity: 0.5 },
  continueButtonText: { color: AppColors.onSurface, fontSize: 18, fontWeight: '600' },
});