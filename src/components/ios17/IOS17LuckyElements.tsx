import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { iOS17Theme } from '../../theme/ios17Theme';

interface LuckyElements {
  color: string;
  number: number;
  time: string;
  direction: string;
}

interface IOS17LuckyElementsProps {
  luckyElements: LuckyElements;
}

const IOS17LuckyElements: React.FC<IOS17LuckyElementsProps> = ({ luckyElements }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Lucky Elements</Text>
      <View style={styles.elementsSection}>
        <View style={styles.elementsRow}>
          <View style={styles.element}>
            <View style={[styles.colorSwatch, { backgroundColor: luckyElements.color }]} />
            <Text style={styles.elementLabel}>Wear this color</Text>
          </View>
          <View style={styles.element}>
            <Text style={styles.elementNumber}>{luckyElements.number}</Text>
            <Text style={styles.elementLabel}>Your lucky number</Text>
          </View>
        </View>
        <View style={styles.elementsRow}>
          <View style={styles.element}>
            <Text style={styles.elementTime}>{luckyElements.time}</Text>
            <Text style={styles.elementLabel}>Peak energy time</Text>
          </View>
          <View style={styles.element}>
            <Text style={styles.elementDirection}>{luckyElements.direction}</Text>
            <Text style={styles.elementLabel}>Meditation direction</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: iOS17Theme.spacing.md,
    marginBottom: iOS17Theme.spacing.lg,
  },
  title: {
    ...iOS17Theme.text.sectionTitle,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: iOS17Theme.spacing.md,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  elementsSection: {
    paddingVertical: iOS17Theme.spacing.lg,
    paddingHorizontal: iOS17Theme.spacing.md,
    backgroundColor: 'rgba(138, 79, 255, 0.15)',
    borderRadius: iOS17Theme.cornerRadius.large,
    borderWidth: 1,
    borderColor: 'rgba(138, 79, 255, 0.3)',
    ...iOS17Theme.shadows.small,
  },
  elementsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: iOS17Theme.spacing.md,
    paddingHorizontal: iOS17Theme.spacing.sm,
    gap: iOS17Theme.spacing.sm,
  },
  element: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: iOS17Theme.spacing.sm,
    paddingVertical: iOS17Theme.spacing.md,
    minHeight: 80,
    justifyContent: 'center',
    position: 'relative',
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginBottom: iOS17Theme.spacing.md,
    marginTop: -iOS17Theme.spacing.xs,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    ...iOS17Theme.shadows.small,
  },
  elementNumber: {
    ...iOS17Theme.text.accentText,
    fontSize: 20,
    color: '#FFD700',
    fontWeight: '700',
    marginBottom: iOS17Theme.spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  elementTime: {
    fontSize: 20,
    color: '#4FC3F7',
    fontWeight: '600',
    marginBottom: iOS17Theme.spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  elementDirection: {
    fontSize: 20,
    color: '#FF6B9D',
    fontWeight: '600',
    marginBottom: iOS17Theme.spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  elementLabel: {
    ...iOS17Theme.text.tertiaryText,
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    position: 'absolute',
    bottom: iOS17Theme.spacing.sm,
    left: 0,
    right: 0,
  },
});

export default IOS17LuckyElements;
