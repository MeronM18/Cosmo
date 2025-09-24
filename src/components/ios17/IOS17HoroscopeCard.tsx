import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { iOS17Theme } from '../../theme/ios17Theme';

const { width } = Dimensions.get('window');

interface IOS17HoroscopeCardProps {
  zodiacSign: string;
  mainReading: string;
  wordOfDay: string;
  onReadFullAnalysis: () => void;
  onShare: () => void;
  onSave: () => void;
  onShowHistory: () => void;
  isExpanded: boolean;
}

const IOS17HoroscopeCard: React.FC<IOS17HoroscopeCardProps> = ({
  zodiacSign,
  mainReading,
  wordOfDay,
  onReadFullAnalysis,
  onShare,
  onSave,
}) => {
  const initials = zodiacSign?.charAt(0)?.toUpperCase() || 'Z';
  const zodiacImages: Record<string, any> = {
    aries: require('../../../assets/aries.png'),
    taurus: require('../../../assets/taurus.png'),
    gemini: require('../../../assets/gemini.png'),
    cancer: require('../../../assets/cancer.png'),
    leo: require('../../../assets/leo.png'),
    virgo: require('../../../assets/virgo.png'),
    libra: require('../../../assets/libra.png'),
    scorpio: require('../../../assets/scorpio.png'),
    sagittarius: require('../../../assets/sagittarius.png'),
    capricorn: require('../../../assets/capricorn.png'),
    aquarius: require('../../../assets/aquarius.png'),
    pisces: require('../../../assets/pisces.png'),
  };
  const zodiacKey = (zodiacSign || '').toLowerCase();
  const zodiacIcon = zodiacImages[zodiacKey];
  const generatedAt = 'Daily reading';

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header: avatar + sign + timestamp + optional bookmark */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              {zodiacIcon ? (
                <Image source={zodiacIcon} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </View>
            <View>
              <Text style={styles.signName}>{zodiacSign}</Text>
              <Text style={styles.generatedAt}>Generated {generatedAt}</Text>
            </View>
          </View>
          {/* Right side icon removed per design refinement */}
        </View>

        {/* Word of the Day badge */}
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>Word of the day</Text>
            <Text style={styles.badgeValue}>{wordOfDay}</Text>
          </View>
        </View>

        {/* Reading section */}
        <View style={styles.readingSection}>
          <Text style={styles.readingHeaderText}>Reading</Text>
          <Text style={styles.readingText} numberOfLines={5}>
            {mainReading}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.primaryCta} onPress={onReadFullAnalysis} activeOpacity={0.8}>
            <Text style={styles.primaryCtaText}>Read full analysis</Text>
          </TouchableOpacity>
          <View style={styles.footerIcons}>
            <TouchableOpacity style={styles.smallIconButton} onPress={onShare}>
              <Text style={styles.smallIconText}>↗︎</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: iOS17Theme.spacing.md,
    marginBottom: iOS17Theme.spacing.md,
  },
  card: {
    backgroundColor: iOS17Theme.colors.systemBackground,
    borderRadius: iOS17Theme.cornerRadius.large,
    padding: iOS17Theme.spacing.lg,
    ...iOS17Theme.shadows.large,
    borderWidth: 1,
    borderColor: iOS17Theme.colors.separator,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: iOS17Theme.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: iOS17Theme.colors.secondarySystemFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: iOS17Theme.spacing.sm,
  },
  avatarText: {
    color: iOS17Theme.colors.label,
    fontWeight: '600',
  },
  avatarImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  signName: {
    ...iOS17Theme.typography.headline,
    color: iOS17Theme.colors.label,
    fontSize: 16,
    fontWeight: '600',
  },
  generatedAt: {
    color: iOS17Theme.colors.secondaryLabel,
    fontSize: 12,
    marginTop: 2,
  },
  iconButton: {
    padding: iOS17Theme.spacing.xs,
  },
  iconButtonText: {
    fontSize: 18,
  },
  badgeRow: {
    marginBottom: iOS17Theme.spacing.md,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,122,255,0.12)',
    borderRadius: iOS17Theme.cornerRadius.medium,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeLabel: {
    color: iOS17Theme.colors.systemBlue,
    fontSize: 12,
    marginRight: 6,
  },
  badgeValue: {
    color: iOS17Theme.colors.systemBlue,
    fontSize: 13,
    fontWeight: '600',
  },
  readingSection: {
    marginBottom: iOS17Theme.spacing.lg,
  },
  readingHeaderText: {
    color: iOS17Theme.colors.label,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: iOS17Theme.spacing.xs,
  },
  readingText: {
    ...iOS17Theme.typography.body,
    color: iOS17Theme.colors.label,
    fontSize: 15,
    lineHeight: 22,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryCta: {
    flex: 1,
    backgroundColor: iOS17Theme.colors.systemBlue,
    paddingVertical: 12,
    borderRadius: iOS17Theme.cornerRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: iOS17Theme.spacing.sm,
  },
  primaryCtaText: {
    color: iOS17Theme.colors.systemBackground,
    fontSize: 15,
    fontWeight: '600',
  },
  footerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallIconButton: {
    width: 40,
    height: 40,
    borderRadius: iOS17Theme.cornerRadius.small,
    backgroundColor: iOS17Theme.colors.secondarySystemFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallIconText: {
    fontSize: 16,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
  },
});

export default IOS17HoroscopeCard;
