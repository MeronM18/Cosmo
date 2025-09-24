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
  const EDGE_INSET = 6; // horizontal inset so indicator doesn't touch edges
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
      const segmentWidth = (containerWidth - EDGE_INSET * 2) / segments.length;
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
                left: EDGE_INSET,
                width: (containerWidth - EDGE_INSET * 2) / segments.length,
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
              { width: (containerWidth - EDGE_INSET * 2) / segments.length },
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
    marginBottom: iOS17Theme.spacing.sm,
  },
  segmentedControl: {
    height: 36,
    backgroundColor: iOS17Theme.colors.secondarySystemFill,
    borderRadius: iOS17Theme.cornerRadius.large,
    flexDirection: 'row',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: iOS17Theme.colors.separator,
    ...iOS17Theme.shadows.small,
    paddingHorizontal: 6,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: iOS17Theme.colors.secondarySystemFill,
    borderRadius: iOS17Theme.cornerRadius.large,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    backgroundColor: iOS17Theme.colors.systemBlue,
    borderRadius: iOS17Theme.cornerRadius.large - 3,
    ...iOS17Theme.shadows.medium,
    borderWidth: 1,
    borderColor: iOS17Theme.colors.systemBlue,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    paddingVertical: iOS17Theme.spacing.sm,
  },
  segmentText: {
    ...iOS17Theme.typography.callout,
    color: iOS17Theme.colors.secondaryLabel,
    fontWeight: '500',
    fontSize: 14,
    textAlign: 'center',
  },
  segmentTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default IOS17SegmentedControl;
