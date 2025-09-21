import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { iOS17Theme } from '../../theme/ios17Theme';

const { width } = Dimensions.get('window');

interface IOS17SegmentedControlProps {
  segments: string[];
  selectedIndex: number;
  onSegmentChange: (index: number, segment: string) => void;
  style?: any;
}

const IOS17SegmentedControl: React.FC<IOS17SegmentedControlProps> = ({
  segments,
  selectedIndex,
  onSegmentChange,
  style,
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: iOS17Theme.animationDurations.normal,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (containerWidth > 0) {
      const segmentWidth = containerWidth / segments.length;
      Animated.spring(indicatorAnim, {
        toValue: selectedIndex * segmentWidth,
        useNativeDriver: false,
        ...iOS17Theme.springConfigs.gentle,
      }).start();
    }
  }, [selectedIndex, containerWidth]);

  const handleSegmentPress = (index: number, segment: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSegmentChange(index, segment);
  };

  const onLayout = (event: any) => {
    const { width: layoutWidth } = event.nativeEvent.layout;
    setContainerWidth(layoutWidth);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        { opacity: fadeAnim },
      ]}
    >
      <View
        style={styles.segmentedControl}
        onLayout={onLayout}
      >
        {/* Background */}
        <View style={styles.background} />
        
        {/* Selection Indicator */}
        {containerWidth > 0 && (
          <Animated.View
            style={[
              styles.selectionIndicator,
              {
                width: containerWidth / segments.length,
                transform: [{ translateX: indicatorAnim }],
              },
            ]}
          />
        )}

        {/* Segments */}
        {segments.map((segment, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.segment,
              { width: containerWidth / segments.length },
            ]}
            onPress={() => handleSegmentPress(index, segment)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.segmentText,
                selectedIndex === index && styles.segmentTextSelected,
              ]}
            >
              {segment}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: iOS17Theme.spacing.md,
    marginBottom: iOS17Theme.spacing.lg,
  },
  segmentedControl: {
    height: 32,
    backgroundColor: iOS17Theme.colors.systemFill,
    borderRadius: iOS17Theme.cornerRadius.medium,
    flexDirection: 'row',
    position: 'relative',
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: iOS17Theme.colors.systemFill,
    borderRadius: iOS17Theme.cornerRadius.medium,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    backgroundColor: iOS17Theme.colors.systemBackground,
    borderRadius: iOS17Theme.cornerRadius.small,
    ...iOS17Theme.shadows.small,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  segmentText: {
    ...iOS17Theme.typography.callout,
    color: iOS17Theme.colors.secondaryLabel,
    fontWeight: '500',
  },
  segmentTextSelected: {
    color: iOS17Theme.colors.label,
    fontWeight: '600',
  },
});

export default IOS17SegmentedControl;
