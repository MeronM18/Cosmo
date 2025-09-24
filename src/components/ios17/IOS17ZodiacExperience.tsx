import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Image,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { iOS17Theme } from '../../theme/ios17Theme';

const { width } = Dimensions.get('window');

interface ZodiacSign {
  name: string;
  symbol: string;
  imageSource: any;
  constellation: string;
  element: string;
  quality: string;
  rulingPlanet: string;
  strengths: string[];
  weaknesses: string[];
  dates: string;
  color: string;
}

interface IOS17ZodiacExperienceProps {
  userZodiacSign: string;
  onSignPress?: (sign: ZodiacSign) => void;
}

const zodiacData: ZodiacSign[] = [
  // 🔥 Fire Element Palette - Warm, energetic, passionate
  {
    name: 'Aries',
    symbol: '',
    imageSource: require('../../../assets/aries.png'),
    constellation: 'Ram',
    element: 'Fire',
    quality: 'Cardinal',
    rulingPlanet: 'Mars',
    strengths: ['Courageous', 'Confident', 'Enthusiastic', 'Natural leader'],
    weaknesses: ['Impatient', 'Aggressive', 'Impulsive', 'Self-centered'],
    dates: 'Mar 21 - Apr 19',
    color: '#FF6B6B' // Deep Coral - Fire primary
  },
  {
    name: 'Leo',
    symbol: '',
    imageSource: require('../../../assets/leo.png'),
    constellation: 'Lion',
    element: 'Fire',
    quality: 'Fixed',
    rulingPlanet: 'Sun',
    strengths: ['Creative', 'Passionate', 'Generous', 'Warm-hearted'],
    weaknesses: ['Arrogant', 'Stubborn', 'Self-centered', 'Lazy'],
    dates: 'Jul 23 - Aug 22',
    color: '#FFEAA7' // Golden Yellow - Fire primary
  },
  {
    name: 'Sagittarius',
    symbol: '',
    imageSource: require('../../../assets/sagittarius.png'),
    constellation: 'Archer',
    element: 'Fire',
    quality: 'Mutable',
    rulingPlanet: 'Jupiter',
    strengths: ['Generous', 'Idealistic', 'Great sense of humor', 'Philosophical'],
    weaknesses: ['Promises more than can deliver', 'Impatient', 'Tactless', 'Restless'],
    dates: 'Nov 22 - Dec 21',
    color: '#BB8FCE' // Lavender Purple - Fire primary
  },
  
  // 🌍 Earth Element Palette - Grounded, stable, natural
  {
    name: 'Taurus',
    symbol: '',
    imageSource: require('../../../assets/taurus.png'),
    constellation: 'Bull',
    element: 'Earth',
    quality: 'Fixed',
    rulingPlanet: 'Venus',
    strengths: ['Reliable', 'Patient', 'Practical', 'Devoted'],
    weaknesses: ['Stubborn', 'Possessive', 'Uncompromising', 'Materialistic'],
    dates: 'Apr 20 - May 20',
    color: '#4ECDC4' // Turquoise - Earth primary
  },
  {
    name: 'Virgo',
    symbol: '',
    imageSource: require('../../../assets/virgo.png'),
    constellation: 'Virgin',
    element: 'Earth',
    quality: 'Mutable',
    rulingPlanet: 'Mercury',
    strengths: ['Loyal', 'Analytical', 'Kind', 'Hardworking'],
    weaknesses: ['Shyness', 'Worry', 'Overly critical', 'Perfectionist'],
    dates: 'Aug 23 - Sep 22',
    color: '#DDA0DD' // Soft Purple - Earth primary
  },
  {
    name: 'Capricorn',
    symbol: '',
    imageSource: require('../../../assets/capricorn.png'),
    constellation: 'Goat',
    element: 'Earth',
    quality: 'Cardinal',
    rulingPlanet: 'Saturn',
    strengths: ['Responsible', 'Disciplined', 'Self-control', 'Good managers'],
    weaknesses: ['Know-it-all', 'Unforgiving', 'Condescending', 'Pessimistic'],
    dates: 'Dec 22 - Jan 19',
    color: '#85C1E9' // Sky Blue - Earth primary
  },
  
  // 💨 Air Element Palette - Light, intellectual, communicative
  {
    name: 'Gemini',
    symbol: '',
    imageSource: require('../../../assets/gemini.png'),
    constellation: 'Twins',
    element: 'Air',
    quality: 'Mutable',
    rulingPlanet: 'Mercury',
    strengths: ['Versatile', 'Expressive', 'Curious', 'Adaptable'],
    weaknesses: ['Nervous', 'Inconsistent', 'Indecisive', 'Superficial'],
    dates: 'May 21 - Jun 20',
    color: '#45B7D1' // Ocean Blue - Air primary
  },
  {
    name: 'Libra',
    symbol: '',
    imageSource: require('../../../assets/libra.png'),
    constellation: 'Scales',
    element: 'Air',
    quality: 'Cardinal',
    rulingPlanet: 'Venus',
    strengths: ['Cooperative', 'Diplomatic', 'Gracious', 'Fair-minded'],
    weaknesses: ['Indecisive', 'Avoids confrontations', 'Self-pity', 'Unreliable'],
    dates: 'Sep 23 - Oct 22',
    color: '#98D8C8' // Mint Green - Air primary
  },
  {
    name: 'Aquarius',
    symbol: '',
    imageSource: require('../../../assets/aquarius.png'),
    constellation: 'Water Bearer',
    element: 'Air',
    quality: 'Fixed',
    rulingPlanet: 'Uranus',
    strengths: ['Progressive', 'Independent', 'Humanitarian', 'Inventive'],
    weaknesses: ['Runs from emotional expression', 'Temperamental', 'Uncompromising', 'Aloof'],
    dates: 'Jan 20 - Feb 18',
    color: '#F8C471' // Peach - Air primary
  },
  
  // 💧 Water Element Palette - Emotional, intuitive, flowing
  {
    name: 'Cancer',
    symbol: '',
    imageSource: require('../../../assets/cancer.png'),
    constellation: 'Crab',
    element: 'Water',
    quality: 'Cardinal',
    rulingPlanet: 'Moon',
    strengths: ['Loyal', 'Emotional', 'Sympathetic', 'Persuasive'],
    weaknesses: ['Moody', 'Pessimistic', 'Suspicious', 'Manipulative'],
    dates: 'Jun 21 - Jul 22',
    color: '#96CEB4' // Sage Green - Water primary
  },
  {
    name: 'Scorpio',
    symbol: '',
    imageSource: require('../../../assets/scorpio.png'),
    constellation: 'Scorpion',
    element: 'Water',
    quality: 'Fixed',
    rulingPlanet: 'Mars',
    strengths: ['Resourceful', 'Brave', 'Passionate', 'Intense'],
    weaknesses: ['Distrusting', 'Jealous', 'Secretive', 'Controlling'],
    dates: 'Oct 23 - Nov 21',
    color: '#F7DC6F' // Warm Yellow - Water primary
  },
  {
    name: 'Pisces',
    symbol: '',
    imageSource: require('../../../assets/pisces.png'),
    constellation: 'Fish',
    element: 'Water',
    quality: 'Mutable',
    rulingPlanet: 'Neptune',
    strengths: ['Compassionate', 'Artistic', 'Intuitive', 'Gentle'],
    weaknesses: ['Fearful', 'Overly trusting', 'Sad', 'Victim mentality'],
    dates: 'Feb 19 - Mar 20',
    color: '#82E0AA' // Light Green - Water primary
  }
];

const IOS17ZodiacExperience: React.FC<IOS17ZodiacExperienceProps> = ({
  userZodiacSign,
  onSignPress
}) => {
  const [expandedGuidance, setExpandedGuidance] = useState<Record<string, boolean>>({});
  
  // Generate shorter cosmic guidance for each zodiac sign
  const generateShortCosmicGuidance = (sign: ZodiacSign, userSign: string) => {
    const shortGuidanceMap: Record<string, Record<string, string>> = {
      'Aries': {
        'Scorpio': `${sign.name} brings bold action to your strategic depth. Together, you create powerful transformation.`,
        'default': `${sign.name} embodies the spark of creation and courageous leadership. Your ${sign.element.toLowerCase()} nature brings passion and directness.`
      },
      'Taurus': {
        'Scorpio': `${sign.name} offers grounding stability to your intense nature. Together, you create lasting foundations.`,
        'default': `${sign.name} embodies material beauty and persistent strength. Your ${sign.element.toLowerCase()} nature values security and sensual pleasures.`
      },
      'Gemini': {
        'Scorpio': `${sign.name} brings lightness to your deep intensity. Together, you balance surface and depth.`,
        'default': `${sign.name} embodies communication and intellectual curiosity. Your ${sign.element.toLowerCase()} nature seeks variety and connection.`
      },
      'Cancer': {
        'Scorpio': `${sign.name} shares your water depth, offering protective care. Together, you create emotional sanctuary.`,
        'default': `${sign.name} embodies emotional nurturing and intuitive strength. Your ${sign.element.toLowerCase()} nature values home and family.`
      },
      'Leo': {
        'Scorpio': `${sign.name} brings warmth to your intensity. Together, you create dramatic impact.`,
        'default': `${sign.name} embodies radiant self-expression and creative leadership. Your ${sign.element.toLowerCase()} nature seeks to inspire.`
      },
      'Virgo': {
        'Scorpio': `${sign.name} offers practical wisdom to your intuition. Together, you create healing solutions.`,
        'default': `${sign.name} embodies service and analytical precision. Your ${sign.element.toLowerCase()} nature seeks to improve and heal.`
      },
      'Libra': {
        'Scorpio': `${sign.name} brings harmony to your intensity. Together, you create balanced transformation.`,
        'default': `${sign.name} embodies balance and partnership beauty. Your ${sign.element.toLowerCase()} nature seeks fairness and harmony.`
      },
      'Scorpio': {
        'Scorpio': `As fellow ${sign.name}, you understand transformation's depths. Your ${sign.element.toLowerCase()} energy flows with emotional intensity.`,
        'default': `${sign.name} embodies transformation and mystery's depths. Your ${sign.element.toLowerCase()} nature seeks truth and regeneration.`
      },
      'Sagittarius': {
        'Scorpio': `${sign.name} offers expansion to your focused intensity. Together, you create profound understanding.`,
        'default': `${sign.name} embodies adventure and philosophical wisdom. Your ${sign.element.toLowerCase()} nature seeks freedom and truth.`
      },
      'Capricorn': {
        'Scorpio': `${sign.name} offers structure to your transformation. Together, you create lasting success.`,
        'default': `${sign.name} embodies ambition and disciplined wisdom. Your ${sign.element.toLowerCase()} nature values achievement and responsibility.`
      },
      'Aquarius': {
        'Scorpio': `${sign.name} offers progressive vision to your intensity. Together, you create revolutionary healing.`,
        'default': `${sign.name} embodies innovation and humanitarian vision. Your ${sign.element.toLowerCase()} nature seeks freedom and equality.`
      },
      'Pisces': {
        'Scorpio': `${sign.name} shares your water depth, offering gentle healing. Together, you create spiritual connection.`,
        'default': `${sign.name} embodies spiritual compassion and artistic sensitivity. Your ${sign.element.toLowerCase()} nature flows with intuition and creativity.`
      }
    };

    return shortGuidanceMap[sign.name]?.[userSign] || shortGuidanceMap[sign.name]?.['default'] || `${sign.name} embodies unique cosmic energy.`;
  };

  // Generate personalized cosmic guidance for each zodiac sign
  const generateCosmicGuidance = (sign: ZodiacSign, userSign: string) => {
    const guidanceMap: Record<string, Record<string, string>> = {
      'Aries': {
        'Scorpio': `${sign.name} represents the bold pioneer spirit, ruled by Mars like your Scorpio energy. While you both share intensity and determination, ${sign.name} brings direct action where you prefer strategic depth. Together, you create a powerful force of transformation and new beginnings.`,
        'default': `${sign.name} embodies the raw energy of new beginnings and courageous leadership. As the first sign of the zodiac, ${sign.name} represents the spark of creation and the drive to initiate change. Your ${sign.element.toLowerCase()} nature brings passion and directness to everything you do.`
      },
      'Taurus': {
        'Scorpio': `${sign.name} represents stability and sensual pleasure, offering grounding energy to your intense Scorpio nature. While you both value loyalty and depth, ${sign.name} brings patience and material security where you seek emotional transformation. Together, you create lasting foundations.`,
        'default': `${sign.name} embodies the beauty of the material world and the strength of persistence. As an earth sign, you bring stability and sensuality to life's experiences. Your ${sign.element.toLowerCase()} nature values security, beauty, and the pleasures of the physical world.`
      },
      'Gemini': {
        'Scorpio': `${sign.name} represents communication and curiosity, offering lightness to your deep Scorpio intensity. While you both seek truth, ${sign.name} explores through variety and connection where you prefer to dive deep into mysteries. Together, you balance surface and depth.`,
        'default': `${sign.name} embodies the gift of communication and the joy of learning. As an air sign, you bring intellectual curiosity and adaptability to life's experiences. Your ${sign.element.toLowerCase()} nature seeks variety, connection, and the exchange of ideas.`
      },
      'Cancer': {
        'Scorpio': `${sign.name} represents emotional nurturing and intuition, sharing your water element's depth. Both signs value emotional security and family bonds, but ${sign.name} offers protective care where you seek transformative truth. Together, you create emotional sanctuary.`,
        'default': `${sign.name} embodies the nurturing power of emotions and the strength of intuition. As a water sign, you bring deep emotional understanding and protective care to relationships. Your ${sign.element.toLowerCase()} nature values home, family, and emotional security.`
      },
      'Leo': {
        'Scorpio': `${sign.name} represents creative self-expression and leadership, offering warmth to your intense Scorpio nature. While you both have magnetic presence, ${sign.name} seeks recognition and joy where you prefer mystery and transformation. Together, you create dramatic impact.`,
        'default': `${sign.name} embodies the radiant power of self-expression and creative leadership. As a fire sign, you bring warmth, generosity, and dramatic flair to life's experiences. Your ${sign.element.toLowerCase()} nature seeks to inspire and be recognized for your unique gifts.`
      },
      'Virgo': {
        'Scorpio': `${sign.name} represents service and analytical precision, offering practical wisdom to your intuitive Scorpio nature. While you both seek perfection, ${sign.name} focuses on helpful details where you prefer transformative depth. Together, you create healing solutions.`,
        'default': `${sign.name} embodies the gift of service and the power of analytical thinking. As an earth sign, you bring practical wisdom and attention to detail to life's challenges. Your ${sign.element.toLowerCase()} nature seeks to improve, heal, and perfect through dedicated service.`
      },
      'Libra': {
        'Scorpio': `${sign.name} represents balance and partnership, offering harmony to your intense Scorpio nature. While you both value relationships, ${sign.name} seeks peace and beauty where you prefer passionate depth. Together, you create balanced transformation.`,
        'default': `${sign.name} embodies the art of balance and the beauty of partnership. As an air sign, you bring harmony, diplomacy, and aesthetic appreciation to life's experiences. Your ${sign.element.toLowerCase()} nature seeks fairness, beauty, and meaningful connections.`
      },
      'Scorpio': {
        'Scorpio': `As fellow ${sign.name}, you understand the depths of transformation and the power of regeneration. Your intense nature seeks truth beyond surface appearances, and your ${sign.element.toLowerCase()} energy flows with emotional depth and psychic intuition. You are the phoenix of the zodiac.`,
        'default': `${sign.name} embodies the power of transformation and the depths of mystery. As a water sign, you bring intense emotional depth and regenerative power to life's experiences. Your ${sign.element.toLowerCase()} nature seeks truth, transformation, and the hidden meanings of existence.`
      },
      'Sagittarius': {
        'Scorpio': `${sign.name} represents adventure and philosophical wisdom, offering expansion to your focused Scorpio intensity. While you both seek truth, ${sign.name} explores through travel and learning where you prefer to dive deep into mysteries. Together, you create profound understanding.`,
        'default': `${sign.name} embodies the spirit of adventure and the pursuit of wisdom. As a fire sign, you bring optimism, enthusiasm, and philosophical insight to life's journey. Your ${sign.element.toLowerCase()} nature seeks freedom, truth, and the meaning of existence.`
      },
      'Capricorn': {
        'Scorpio': `${sign.name} represents ambition and disciplined achievement, offering structure to your transformative Scorpio nature. While you both have powerful determination, ${sign.name} builds through patience where you prefer intense transformation. Together, you create lasting success.`,
        'default': `${sign.name} embodies the power of ambition and the wisdom of discipline. As an earth sign, you bring practical determination and long-term vision to life's goals. Your ${sign.element.toLowerCase()} nature values achievement, responsibility, and building lasting foundations.`
      },
      'Aquarius': {
        'Scorpio': `${sign.name} represents innovation and humanitarian ideals, offering progressive vision to your intense Scorpio nature. While you both seek transformation, ${sign.name} focuses on collective change where you prefer personal depth. Together, you create revolutionary healing.`,
        'default': `${sign.name} embodies the spirit of innovation and the vision of the future. As an air sign, you bring originality, humanitarian ideals, and progressive thinking to life's challenges. Your ${sign.element.toLowerCase()} nature seeks freedom, equality, and the advancement of humanity.`
      },
      'Pisces': {
        'Scorpio': `${sign.name} represents spiritual compassion and artistic sensitivity, sharing your water element's depth. Both signs are deeply intuitive and transformative, but ${sign.name} offers gentle healing where you prefer intense regeneration. Together, you create profound spiritual connection.`,
        'default': `${sign.name} embodies the gift of compassion and the power of spiritual connection. As a water sign, you bring empathy, creativity, and intuitive wisdom to life's experiences. Your ${sign.element.toLowerCase()} nature seeks unity, healing, and connection to the divine.`
      }
    };

    return guidanceMap[sign.name]?.[userSign] || guidanceMap[sign.name]?.['default'] || 
           `${sign.name} brings unique cosmic energy to the zodiac wheel. Your ${sign.element.toLowerCase()} nature and ${sign.rulingPlanet} influence create a distinctive path of growth and understanding.`;
  };

  const toggleGuidanceExpansion = (signName: string) => {
    setExpandedGuidance(prev => ({
      ...prev,
      [signName]: !prev[signName]
    }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Generate short zodiac essence
  const getZodiacEssence = (sign: ZodiacSign) => {
    const essences: Record<string, string> = {
      'Aries': 'The trailblazer who leads with courage and ignites new beginnings.',
      'Taurus': 'The steady force who builds lasting foundations with patience and determination.',
      'Gemini': 'The communicator who connects ideas and people through curiosity and wit.',
      'Cancer': 'The nurturer who protects and cares with deep emotional intuition.',
      'Leo': 'The performer who shines with creative expression and natural leadership.',
      'Virgo': 'The perfectionist who serves others through analytical precision and healing.',
      'Libra': 'The diplomat who seeks harmony and balance in all relationships.',
      'Scorpio': 'The transformer who delves deep into mysteries and regenerates through intensity.',
      'Sagittarius': 'The philosopher who explores truth through adventure and higher learning.',
      'Capricorn': 'The achiever who climbs to success through discipline and ambition.',
      'Aquarius': 'The innovator who revolutionizes through humanitarian vision and originality.',
      'Pisces': 'The mystic who connects to the divine through compassion and spiritual depth.'
    };

    return essences[sign.name] || `${sign.name} brings unique cosmic energy to the zodiac wheel.`;
  };

  // Generate a summary of the cosmic guidance text
  const generateCosmicSummary = (text: string) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length <= 2) return text;
    
    // Take the first sentence and last sentence for a concise summary
    const firstSentence = sentences[0].trim();
    const lastSentence = sentences[sentences.length - 1].trim();
    
    return `${firstSentence}. ${lastSentence}.`;
  };

  // Generate compatibility data for a zodiac sign
  const getCompatibilitySigns = (sign: ZodiacSign) => {
    const compatibilityMap: Record<string, any[]> = {
      'Aries': [
        { name: 'Leo', emoji: '🦁', type: 'Soulmate', description: 'Fire meets fire in passionate harmony', score: '95%', color: '#FFEAA7', scoreColor: '#4CAF50' },
        { name: 'Sagittarius', emoji: '🏹', type: 'Adventure Partner', description: 'Endless energy and shared wanderlust', score: '90%', color: '#BB8FCE', scoreColor: '#4CAF50' },
        { name: 'Gemini', emoji: '👥', type: 'Dynamic Duo', description: 'Quick wit meets bold action', score: '85%', color: '#45B7D1', scoreColor: '#8BC34A' }
      ],
      'Taurus': [
        { name: 'Virgo', emoji: '🌾', type: 'Perfect Match', description: 'Earth signs create lasting foundations', score: '98%', color: '#DDA0DD', scoreColor: '#4CAF50' },
        { name: 'Capricorn', emoji: '🐐', type: 'Power Couple', description: 'Ambitious goals with steady progress', score: '92%', color: '#85C1E9', scoreColor: '#4CAF50' },
        { name: 'Cancer', emoji: '🦀', type: 'Home & Heart', description: 'Security and emotional depth unite', score: '88%', color: '#96CEB4', scoreColor: '#8BC34A' }
      ],
      'Gemini': [
        { name: 'Libra', emoji: '⚖️', type: 'Intellectual Soulmates', description: 'Air signs share mental connection', score: '96%', color: '#98D8C8', scoreColor: '#4CAF50' },
        { name: 'Aquarius', emoji: '♒', type: 'Innovation Partners', description: 'Progressive ideas and social change', score: '89%', color: '#F8C471', scoreColor: '#8BC34A' },
        { name: 'Aries', emoji: '♈', type: 'Dynamic Duo', description: 'Quick wit meets bold action', score: '85%', color: '#FF6B6B', scoreColor: '#8BC34A' }
      ],
      'Cancer': [
        { name: 'Scorpio', emoji: '🦂', type: 'Emotional Depth', description: 'Water signs understand each other', score: '94%', color: '#F7DC6F', scoreColor: '#4CAF50' },
        { name: 'Pisces', emoji: '🐠', type: 'Soul Connection', description: 'Intuitive and compassionate bond', score: '91%', color: '#82E0AA', scoreColor: '#4CAF50' },
        { name: 'Taurus', emoji: '♉', type: 'Home & Heart', description: 'Security and emotional depth unite', score: '88%', color: '#4ECDC4', scoreColor: '#8BC34A' }
      ],
      'Leo': [
        { name: 'Aries', emoji: '♈', type: 'Fire Power', description: 'Fire meets fire in passionate harmony', score: '95%', color: '#FF6B6B', scoreColor: '#4CAF50' },
        { name: 'Sagittarius', emoji: '🏹', type: 'Royal Adventure', description: 'Confidence and optimism combined', score: '87%', color: '#BB8FCE', scoreColor: '#8BC34A' },
        { name: 'Gemini', emoji: '♊', type: 'Creative Sparks', description: 'Drama meets wit in perfect balance', score: '83%', color: '#45B7D1', scoreColor: '#FFC107' }
      ],
      'Virgo': [
        { name: 'Taurus', emoji: '♉', type: 'Perfect Match', description: 'Earth signs create lasting foundations', score: '98%', color: '#4ECDC4', scoreColor: '#4CAF50' },
        { name: 'Capricorn', emoji: '🐐', type: 'Achievement Team', description: 'Perfection meets ambition', score: '93%', color: '#85C1E9', scoreColor: '#4CAF50' },
        { name: 'Cancer', emoji: '♋', type: 'Nurturing Bond', description: 'Care and attention to detail', score: '86%', color: '#96CEB4', scoreColor: '#8BC34A' }
      ],
      'Libra': [
        { name: 'Gemini', emoji: '♊', type: 'Intellectual Soulmates', description: 'Air signs share mental connection', score: '96%', color: '#45B7D1', scoreColor: '#4CAF50' },
        { name: 'Aquarius', emoji: '♒', type: 'Harmony & Progress', description: 'Balance meets innovation', score: '90%', color: '#F8C471', scoreColor: '#4CAF50' },
        { name: 'Leo', emoji: '♌', type: 'Beauty & Drama', description: 'Aesthetics and charisma unite', score: '84%', color: '#FFEAA7', scoreColor: '#8BC34A' }
      ],
      'Scorpio': [
        { name: 'Cancer', emoji: '♋', type: 'Emotional Depth', description: 'Water signs understand each other', score: '94%', color: '#96CEB4', scoreColor: '#4CAF50' },
        { name: 'Pisces', emoji: '🐠', type: 'Mystical Bond', description: 'Intensity meets intuition', score: '92%', color: '#82E0AA', scoreColor: '#4CAF50' },
        { name: 'Virgo', emoji: '♍', type: 'Transformation Team', description: 'Depth meets perfection', score: '85%', color: '#DDA0DD', scoreColor: '#8BC34A' }
      ],
      'Sagittarius': [
        { name: 'Aries', emoji: '♈', type: 'Adventure Partners', description: 'Endless energy and shared wanderlust', score: '90%', color: '#FF6B6B', scoreColor: '#4CAF50' },
        { name: 'Leo', emoji: '♌', type: 'Royal Adventure', description: 'Confidence and optimism combined', score: '87%', color: '#FFEAA7', scoreColor: '#8BC34A' },
        { name: 'Aquarius', emoji: '♒', type: 'Freedom Fighters', description: 'Independence and philosophical depth', score: '82%', color: '#F8C471', scoreColor: '#FFC107' }
      ],
      'Capricorn': [
        { name: 'Taurus', emoji: '♉', type: 'Power Couple', description: 'Ambitious goals with steady progress', score: '92%', color: '#4ECDC4', scoreColor: '#4CAF50' },
        { name: 'Virgo', emoji: '♍', type: 'Achievement Team', description: 'Perfection meets ambition', score: '93%', color: '#DDA0DD', scoreColor: '#4CAF50' },
        { name: 'Scorpio', emoji: '♏', type: 'Success Partners', description: 'Power and transformation unite', score: '88%', color: '#F7DC6F', scoreColor: '#8BC34A' }
      ],
      'Aquarius': [
        { name: 'Gemini', emoji: '♊', type: 'Innovation Partners', description: 'Progressive ideas and social change', score: '89%', color: '#45B7D1', scoreColor: '#8BC34A' },
        { name: 'Libra', emoji: '♎', type: 'Harmony & Progress', description: 'Balance meets innovation', score: '90%', color: '#98D8C8', scoreColor: '#4CAF50' },
        { name: 'Sagittarius', emoji: '♐', type: 'Freedom Fighters', description: 'Independence and philosophical depth', score: '82%', color: '#BB8FCE', scoreColor: '#FFC107' }
      ],
      'Pisces': [
        { name: 'Cancer', emoji: '♋', type: 'Soul Connection', description: 'Intuitive and compassionate bond', score: '91%', color: '#96CEB4', scoreColor: '#4CAF50' },
        { name: 'Scorpio', emoji: '♏', type: 'Mystical Bond', description: 'Intensity meets intuition', score: '92%', color: '#F7DC6F', scoreColor: '#4CAF50' },
        { name: 'Taurus', emoji: '♉', type: 'Dream & Reality', description: 'Imagination meets stability', score: '79%', color: '#4ECDC4', scoreColor: '#FFC107' }
      ]
    };

    return compatibilityMap[sign.name] || [];
  };
  const [selectedSign, setSelectedSign] = useState<ZodiacSign | null>(null);
  const [showAllSigns, setShowAllSigns] = useState(false);
  const [showDetailedView, setShowDetailedView] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(0)).current;

  const userSign = zodiacData.find(sign => sign.name === userZodiacSign);

  const handleSignPress = (sign: ZodiacSign) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSign(sign);
    setShowDetailedView(true);
    onSignPress?.(sign);
  };

  const handleGridSignPress = (sign: ZodiacSign) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSign(sign);
    setShowDetailedView(true);
    
    // Animate slide up
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleShowAllSigns = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowAllSigns(true);
  };

  const handleCloseDetailedView = () => {
    // Animate slide down
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowDetailedView(false);
      setSelectedSign(null);
      setShowAllSigns(false);
    });
  };

  const handleCloseDetailedViewOnly = () => {
    // Animate slide down
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowDetailedView(false);
      // Keep showAllSigns true and selectedSign for the grid modal
    });
  };

  const handleBackToGrid = () => {
    // Animate slide down
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowDetailedView(false);
      // Keep showAllSigns true and selectedSign for the grid modal
    });
  };


  const renderZodiacCard = (sign: ZodiacSign, isUserSign: boolean = false) => (
    <TouchableOpacity
      key={sign.name}
      style={[
        styles.zodiacCard,
        isUserSign && styles.userZodiacCard,
        { borderColor: sign.color }
      ]}
      onPress={() => handleSignPress(sign)}
      activeOpacity={0.8}
    >
      <BlurView
        intensity={20}
        tint="systemMaterial"
        style={styles.zodiacCardBlur}
      >
        <View style={styles.zodiacCardHeader}>
          <View style={styles.zodiacImageContainer}>
            <Image 
              source={sign.imageSource} 
              style={styles.zodiacImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.zodiacInfo}>
            <Text style={styles.zodiacName}>{sign.name}</Text>
            <Text style={styles.zodiacConstellation}>{sign.constellation}</Text>
          </View>
          {isUserSign && (
            <View style={styles.userBadge}>
              <Text style={styles.userBadgeText}>You</Text>
            </View>
          )}
        </View>
        
        <View style={styles.zodiacDetails}>
          <View style={styles.zodiacElement}>
            <Text style={styles.elementLabel}>Element</Text>
            <Text style={[styles.elementValue, { color: sign.color }]}>
              {sign.element}
            </Text>
          </View>
          <View style={styles.zodiacRuler}>
            <Text style={styles.rulerLabel}>Ruler</Text>
            <Text style={styles.rulerValue}>{sign.rulingPlanet}</Text>
          </View>
        </View>
        
        <Text style={styles.zodiacDates}>{sign.dates}</Text>
      </BlurView>
    </TouchableOpacity>
  );

  const renderZodiacGridCard = (sign: ZodiacSign, isUserSign: boolean = false) => (
    <TouchableOpacity
      key={sign.name}
      style={[
        styles.zodiacGridCard,
        isUserSign && styles.userZodiacGridCard,
        { borderColor: isUserSign ? sign.color : iOS17Theme.colors.separator }
      ]}
      onPress={() => handleGridSignPress(sign)}
      activeOpacity={0.8}
    >
      <View style={styles.zodiacGridCardContent}>
        <View style={styles.zodiacGridImageContainer}>
          <Image 
            source={sign.imageSource} 
            style={styles.zodiacGridImage}
            resizeMode="contain"
          />
        </View>
        <Text style={[
          styles.zodiacGridName,
          { color: '#FFFFFF' }
        ]}>
          {sign.name.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSignTraits = (sign: ZodiacSign) => (
    <View style={styles.traitsContainer}>
      <View style={styles.traitsSection}>
        <Text style={styles.traitsTitle}>Strengths</Text>
        <View style={styles.traitsList}>
          {sign.strengths.map((strength, index) => (
            <View key={index} style={styles.traitItem}>
              <Text style={styles.traitBullet}>•</Text>
              <Text style={styles.traitText}>{strength}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.traitsSection}>
        <Text style={styles.traitsTitle}>Challenges</Text>
        <View style={styles.traitsList}>
          {sign.weaknesses.map((weakness, index) => (
            <View key={index} style={styles.traitItem}>
              <Text style={styles.traitBullet}>•</Text>
              <Text style={styles.traitText}>{weakness}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderDetailedSignModal = (sign: ZodiacSign) => (
    <View style={styles.detailedModalContainer}>
      <BlurView
        intensity={20}
        tint="systemMaterial"
        style={styles.detailedModalBlurView}
      >
        <View style={styles.detailedModalHeader}>
          <TouchableOpacity
            style={styles.detailedModalBackButton}
            onPress={handleBackToGrid}
          >
            <Text style={styles.detailedModalBackButtonText}>{iOS17Theme.symbols.chevronLeft}</Text>
          </TouchableOpacity>
          <Text style={styles.detailedModalTitle}>{sign.name}</Text>
          <View style={styles.detailedModalSpacer} />
        </View>
        
        <ScrollView
          style={styles.detailedModalScrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.detailedModalScrollContent}
        >
          {/* Header Card */}
          <View style={[styles.detailedHeaderCard, { borderColor: sign.color }]}>
            <BlurView
              intensity={15}
              tint="systemMaterial"
              style={styles.detailedHeaderBlur}
            >
              <View style={styles.detailedHeaderContent}>
                <View style={styles.detailedHeaderLeft}>
                  <View style={styles.detailedHeaderImageContainer}>
                    <Image 
                      source={sign.imageSource} 
                      style={styles.detailedHeaderImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.detailedHeaderText}>
                    <View style={styles.detailedHeaderNameContainer}>
                      <Text style={styles.detailedHeaderName}>{sign.name}</Text>
                      <Text style={styles.detailedHeaderDash}>-</Text>
                      <Text style={styles.detailedHeaderConstellation}>{sign.constellation}</Text>
                    </View>
                    <Text style={styles.detailedHeaderEssence}>
                      {getZodiacEssence(sign)}
                    </Text>
                    <Text style={styles.detailedHeaderDates}>{sign.dates}</Text>
                  </View>
                </View>
                <View style={styles.detailedHeaderSymbol}>
                  <Text style={[styles.detailedSymbolText, { color: sign.color }]}>
                    {sign.symbol}
                  </Text>
                </View>
              </View>
            </BlurView>
          </View>

          {/* Core Information Grid Card */}
          <View style={styles.detailedInfoCard}>
            <BlurView
              intensity={15}
              tint="systemMaterial"
              style={styles.detailedInfoBlur}
            >
              <View style={styles.detailedInfoGrid}>
                <View style={styles.detailedInfoItem}>
                  <Text style={styles.detailedInfoLabel}>Element</Text>
                  <Text style={[styles.detailedInfoValue, { color: sign.color }]}>
                    {sign.element}
                  </Text>
                </View>
                <View style={styles.detailedInfoItem}>
                  <Text style={styles.detailedInfoLabel}>Quality</Text>
                  <Text style={styles.detailedInfoValue}>{sign.quality}</Text>
                </View>
                <View style={styles.detailedInfoItem}>
                  <Text style={styles.detailedInfoLabel}>Ruling Planet</Text>
                  <Text style={styles.detailedInfoValue}>{sign.rulingPlanet}</Text>
                </View>
              </View>
            </BlurView>
          </View>

          {/* Cosmic Insight Card */}
          <View style={[styles.detailedInsightCard, { borderColor: sign.color }]}>
            <BlurView
              intensity={15}
              tint="systemMaterial"
              style={[styles.detailedInsightBlur, { backgroundColor: sign.color + '10' }]}
            >
              <View style={styles.detailedInsightHeader}>
                <Text style={styles.detailedInsightTitle}>Cosmic Essence</Text>
                <TouchableOpacity 
                  style={styles.summaryToggle}
                  onPress={() => toggleGuidanceExpansion(sign.name)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.summaryToggleText}>
                    {expandedGuidance[sign.name] ? 'Summary' : 'Show Full'}
                  </Text>
                  <Text style={styles.summaryToggleIcon}>
                    {expandedGuidance[sign.name] ? '📝' : '📖'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.detailedInsightText}>
                {expandedGuidance[sign.name] 
                  ? generateCosmicGuidance(sign, userZodiacSign)
                  : generateShortCosmicGuidance(sign, userZodiacSign)
                }
              </Text>
            </BlurView>
          </View>

          {/* Strengths Card */}
          <View style={[styles.detailedTraitsCard, { borderColor: sign.color }]}>
            <BlurView
              intensity={15}
              tint="systemMaterial"
              style={[styles.detailedTraitsBlur, { backgroundColor: sign.color + '08' }]}
            >
              <View style={styles.detailedTraitsHeader}>
                <Text style={styles.detailedTraitsTitle}>Strengths</Text>
                <View style={[styles.traitsIconContainer, { backgroundColor: sign.color + '20' }]}>
                  <Text style={styles.traitsIcon}>✨</Text>
                </View>
              </View>
              <View style={styles.detailedTraitsList}>
                {sign.strengths.map((strength, index) => (
                  <View key={index} style={styles.detailedTraitItem}>
                    <View style={[styles.traitBulletContainer, { backgroundColor: sign.color + '20' }]}>
                      <Text style={[styles.detailedTraitBullet, { color: sign.color }]}>✓</Text>
                    </View>
                    <Text style={styles.detailedTraitText}>{strength}</Text>
                  </View>
                ))}
              </View>
            </BlurView>
          </View>

          {/* Growth Areas Card */}
          <View style={[styles.detailedTraitsCard, { borderColor: '#FF6B6B' }]}>
            <BlurView
              intensity={15}
              tint="systemMaterial"
              style={[styles.detailedTraitsBlur, { backgroundColor: '#FF6B6B08' }]}
            >
              <View style={styles.detailedTraitsHeader}>
                <Text style={styles.detailedTraitsTitle}>Growth Areas</Text>
                <View style={[styles.traitsIconContainer, { backgroundColor: '#FF6B6B20' }]}>
                  <Text style={styles.traitsIcon}>🌱</Text>
                </View>
              </View>
              <View style={styles.detailedTraitsList}>
                {sign.weaknesses.map((weakness, index) => (
                  <View key={index} style={styles.detailedTraitItem}>
                    <View style={[styles.traitBulletContainer, { backgroundColor: '#FF6B6B20' }]}>
                      <Text style={[styles.detailedTraitBullet, { color: '#FF6B6B' }]}>→</Text>
                    </View>
                    <Text style={styles.detailedTraitText}>{weakness}</Text>
                  </View>
                ))}
              </View>
            </BlurView>
          </View>

          {/* Cosmic Compatibility Card */}
          <View style={[styles.detailedTraitsCard, { borderColor: '#8A4FFF' }]}>
            <BlurView
              intensity={15}
              tint="systemMaterial"
              style={[styles.detailedTraitsBlur, { backgroundColor: '#8A4FFF08' }]}
            >
              <View style={styles.detailedTraitsHeader}>
                <Text style={styles.detailedTraitsTitle}>Cosmic Connections</Text>
                <View style={[styles.traitsIconContainer, { backgroundColor: '#8A4FFF20' }]}>
                  <Text style={styles.traitsIcon}>💫</Text>
                </View>
              </View>
              <View style={styles.compatibilityGrid}>
                {getCompatibilitySigns(sign).map((compatibility, index) => (
                  <View key={index} style={styles.compatibilityItem}>
                    <View style={styles.compatibilityIconContainer}>
                      <Text style={styles.compatibilityIcon}>{compatibility.emoji}</Text>
                    </View>
                    <View style={styles.compatibilityTextContainer}>
                      <Text style={styles.compatibilitySignName}>{compatibility.name}</Text>
                      <Text style={styles.compatibilityType}>{compatibility.type}</Text>
                      <Text style={styles.compatibilityDescription}>{compatibility.description}</Text>
                    </View>
                    <View style={[styles.compatibilityScore, { backgroundColor: compatibility.scoreColor }]}>
                      <Text style={styles.compatibilityScoreText}>{compatibility.score}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </BlurView>
          </View>
        </ScrollView>
      </BlurView>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Zodiac Experience</Text>
        <Text style={styles.sectionSubtitle}>Explore the cosmic wisdom of the zodiac</Text>
      </View>

      {/* User's Main Zodiac Card */}
      {userSign && (
        <View style={styles.userSection}>
          <Text style={styles.userSectionTitle}>Your Zodiac Sign</Text>
          {renderZodiacCard(userSign, true)}
        </View>
      )}

      {/* All Signs Grid Preview */}
      <View style={styles.allSignsSection}>
        <View style={styles.allSignsHeader}>
          <Text style={styles.allSignsTitle}>All Zodiac Signs</Text>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={handleShowAllSigns}
          >
            <Text style={styles.viewAllButtonText}>View All</Text>
            <Text style={styles.viewAllArrow}>→</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.signsScrollView}
          contentContainerStyle={styles.signsScrollContent}
        >
          {zodiacData.slice(0, 6).map((sign) => (
            <TouchableOpacity
              key={sign.name}
              style={[styles.signPreviewCard, { borderColor: sign.color }]}
              onPress={() => handleSignPress(sign)}
              activeOpacity={0.8}
            >
              <BlurView
                intensity={15}
                tint="systemMaterial"
                style={styles.signPreviewBlur}
              >
                <View style={styles.signPreviewImageContainer}>
                  <Image 
                    source={sign.imageSource} 
                    style={styles.signPreviewImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.signPreviewName}>{sign.name}</Text>
                <Text style={styles.signPreviewElement}>{sign.element}</Text>
              </BlurView>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* All Signs Modal */}
      <Modal
        visible={showAllSigns}
        animationType="slide"
        onRequestClose={() => setShowAllSigns(false)}
      >
        <View style={styles.modalContainer}>
          <BlurView
            intensity={20}
            tint="systemMaterial"
            style={styles.modalBlurView}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>All Zodiac Signs</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowAllSigns(false)}
              >
                <Text style={styles.modalCloseButtonText}>{iOS17Theme.symbols.xmark}</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              <View style={styles.allSignsGrid}>
                {zodiacData.map((sign) => renderZodiacGridCard(sign, sign.name === userZodiacSign))}
              </View>
            </ScrollView>

            {/* Detailed View Overlay */}
            {showDetailedView && selectedSign && (
              <Animated.View 
                style={[
                  styles.detailedViewOverlay,
                  {
                    transform: [{
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [Dimensions.get('window').height, 0],
                      })
                    }]
                  }
                ]}
              >
                {renderDetailedSignModal(selectedSign)}
              </Animated.View>
            )}
          </BlurView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: iOS17Theme.spacing.md,
    marginBottom: iOS17Theme.spacing.lg,
  },
  sectionHeader: {
    marginBottom: iOS17Theme.spacing.lg,
  },
  sectionTitle: {
    ...iOS17Theme.text.sectionTitle,
    marginBottom: iOS17Theme.spacing.xs,
  },
  sectionSubtitle: {
    ...iOS17Theme.text.bodyText,
    color: iOS17Theme.colors.secondaryLabel,
  },
  userSection: {
    marginBottom: iOS17Theme.spacing.xl,
  },
  userSectionTitle: {
    ...iOS17Theme.text.cardTitle,
    color: iOS17Theme.colors.label,
    marginBottom: iOS17Theme.spacing.md,
  },
  zodiacCard: {
    borderRadius: iOS17Theme.cornerRadius.large,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: iOS17Theme.colors.tertiarySystemBackground,
  },
  userZodiacCard: {
    borderWidth: 1.5,
    borderColor: iOS17Theme.colors.separator,
    borderRadius: iOS17Theme.cornerRadius.large,
    backgroundColor: iOS17Theme.colors.systemBackground,
    ...iOS17Theme.shadows.large,
  },
  zodiacCardBlur: {
    padding: iOS17Theme.spacing.lg,
  },
  zodiacCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: iOS17Theme.spacing.md,
  },
  zodiacImageContainer: {
    width: 40,
    height: 40,
    marginRight: iOS17Theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zodiacImage: {
    width: 32,
    height: 32,
  },
  zodiacInfo: {
    flex: 1,
  },
  zodiacName: {
    ...iOS17Theme.text.cardTitle,
    color: iOS17Theme.colors.label,
    marginBottom: 2,
  },
  zodiacConstellation: {
    ...iOS17Theme.text.secondaryText,
    color: iOS17Theme.colors.secondaryLabel,
  },
  userBadge: {
    backgroundColor: iOS17Theme.colors.systemPurple,
    paddingHorizontal: iOS17Theme.spacing.sm,
    paddingVertical: iOS17Theme.spacing.xs,
    borderRadius: iOS17Theme.cornerRadius.small,
  },
  userBadgeText: {
    ...iOS17Theme.text.secondaryText,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
  },
  zodiacDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: iOS17Theme.spacing.sm,
  },
  zodiacElement: {
    flex: 1,
  },
  zodiacRuler: {
    flex: 1,
    alignItems: 'flex-end',
  },
  elementLabel: {
    ...iOS17Theme.text.secondaryText,
    color: iOS17Theme.colors.tertiaryLabel,
    marginBottom: 2,
  },
  elementValue: {
    ...iOS17Theme.text.secondaryText,
    fontWeight: '600',
  },
  rulerLabel: {
    ...iOS17Theme.text.secondaryText,
    color: iOS17Theme.colors.tertiaryLabel,
    marginBottom: 2,
  },
  rulerValue: {
    ...iOS17Theme.text.secondaryText,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
  },
  zodiacDates: {
    ...iOS17Theme.text.secondaryText,
    color: iOS17Theme.colors.tertiaryLabel,
    textAlign: 'center',
  },
  allSignsSection: {
    marginBottom: iOS17Theme.spacing.lg,
  },
  allSignsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: iOS17Theme.spacing.md,
  },
  allSignsTitle: {
    ...iOS17Theme.text.cardTitle,
    color: iOS17Theme.colors.label,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: iOS17Theme.colors.systemFill,
    paddingHorizontal: iOS17Theme.spacing.md,
    paddingVertical: iOS17Theme.spacing.sm,
    borderRadius: iOS17Theme.cornerRadius.medium,
  },
  viewAllButtonText: {
    ...iOS17Theme.text.secondaryText,
    color: iOS17Theme.colors.systemPurple,
    fontWeight: '600',
    marginRight: iOS17Theme.spacing.xs,
  },
  viewAllArrow: {
    ...iOS17Theme.text.secondaryText,
    color: iOS17Theme.colors.systemPurple,
    fontWeight: '600',
  },
  signsScrollView: {
    marginHorizontal: -iOS17Theme.spacing.md,
  },
  signsScrollContent: {
    paddingHorizontal: iOS17Theme.spacing.md,
  },
  signPreviewCard: {
    width: 80,
    height: 100,
    borderRadius: iOS17Theme.cornerRadius.medium,
    borderWidth: 1,
    marginRight: iOS17Theme.spacing.sm,
    overflow: 'hidden',
  },
  signPreviewBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: iOS17Theme.spacing.sm,
  },
  signPreviewImageContainer: {
    width: 30,
    height: 30,
    marginBottom: iOS17Theme.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signPreviewImage: {
    width: 24,
    height: 24,
  },
  signPreviewName: {
    ...iOS17Theme.text.secondaryText,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  signPreviewElement: {
    ...iOS17Theme.text.secondaryText,
    color: iOS17Theme.colors.tertiaryLabel,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: iOS17Theme.colors.systemGroupedBackground,
  },
  modalBlurView: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: iOS17Theme.spacing.lg,
    paddingVertical: iOS17Theme.spacing.md,
    paddingTop: 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: iOS17Theme.colors.separator,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    ...iOS17Theme.text.cardTitle,
    color: iOS17Theme.colors.label,
  },
  modalTitleImageContainer: {
    width: 28,
    height: 28,
    marginRight: iOS17Theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitleImage: {
    width: 24,
    height: 24,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: iOS17Theme.colors.systemFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: iOS17Theme.spacing.lg,
    paddingTop: iOS17Theme.spacing.md,
    paddingBottom: iOS17Theme.spacing.lg,
  },
  allSignsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: iOS17Theme.spacing.xs,
    gap: iOS17Theme.spacing.md,
    minHeight: '100%',
    alignContent: 'flex-start',
  },
  zodiacGridCard: {
    width: (width - iOS17Theme.spacing.lg * 2 - iOS17Theme.spacing.xs * 2 - iOS17Theme.spacing.md * 2) / 3,
    height: (width - iOS17Theme.spacing.lg * 2 - iOS17Theme.spacing.xs * 2 - iOS17Theme.spacing.md * 2) / 3 * 1.4,
    borderRadius: iOS17Theme.cornerRadius.medium,
    borderWidth: 0.5,
    borderColor: iOS17Theme.colors.separator,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
    marginBottom: iOS17Theme.spacing.sm,
    ...iOS17Theme.shadows.small,
  },
  userZodiacGridCard: {
    borderWidth: 1.5,
    borderColor: iOS17Theme.colors.systemPurple,
    backgroundColor: 'rgba(138, 79, 255, 0.1)',
    shadowColor: iOS17Theme.colors.systemPurple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  zodiacGridCardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: iOS17Theme.spacing.xs,
  },
  zodiacGridImageContainer: {
    width: 44,
    height: 44,
    marginBottom: iOS17Theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zodiacGridImage: {
    width: 36,
    height: 36,
  },
  zodiacGridName: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  signDetailCard: {
    borderRadius: iOS17Theme.cornerRadius.large,
    borderWidth: 1,
    borderColor: iOS17Theme.colors.separator,
    overflow: 'hidden',
    marginBottom: iOS17Theme.spacing.lg,
  },
  signDetailBlur: {
    padding: iOS17Theme.spacing.lg,
  },
  signDetailHeader: {
    alignItems: 'center',
    marginBottom: iOS17Theme.spacing.lg,
  },
  signDetailConstellation: {
    ...iOS17Theme.text.cardTitle,
    color: iOS17Theme.colors.label,
    marginBottom: iOS17Theme.spacing.xs,
  },
  signDetailDates: {
    ...iOS17Theme.text.bodyText,
    color: iOS17Theme.colors.secondaryLabel,
  },
  signDetailInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  signDetailItem: {
    alignItems: 'center',
  },
  signDetailLabel: {
    ...iOS17Theme.text.secondaryText,
    color: iOS17Theme.colors.tertiaryLabel,
    marginBottom: iOS17Theme.spacing.xs,
  },
  signDetailValue: {
    ...iOS17Theme.text.secondaryText,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
  },
  traitsContainer: {
    gap: iOS17Theme.spacing.lg,
  },
  traitsSection: {
    backgroundColor: iOS17Theme.colors.tertiarySystemBackground,
    borderRadius: iOS17Theme.cornerRadius.large,
    borderWidth: 1,
    borderColor: iOS17Theme.colors.separator,
    padding: iOS17Theme.spacing.lg,
  },
  traitsTitle: {
    ...iOS17Theme.text.cardTitle,
    color: iOS17Theme.colors.label,
    marginBottom: iOS17Theme.spacing.md,
  },
  traitsList: {
    gap: iOS17Theme.spacing.sm,
  },
  traitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  traitBullet: {
    ...iOS17Theme.text.bodyText,
    color: iOS17Theme.colors.systemPurple,
    marginRight: iOS17Theme.spacing.sm,
    marginTop: 2,
  },
  traitText: {
    ...iOS17Theme.text.bodyText,
    color: iOS17Theme.colors.label,
    flex: 1,
  },
  // Detailed Modal Styles
  detailedModalContainer: {
    flex: 1,
    backgroundColor: iOS17Theme.colors.systemGroupedBackground,
  },
  detailedModalBlurView: {
    flex: 1,
  },
  detailedModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: iOS17Theme.spacing.lg,
    paddingVertical: iOS17Theme.spacing.md,
    paddingTop: 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: iOS17Theme.colors.separator,
  },
  detailedModalTitle: {
    ...iOS17Theme.text.sectionTitle,
    color: iOS17Theme.colors.label,
    flex: 1,
    textAlign: 'center',
    paddingTop: iOS17Theme.spacing.md,
  },
  detailedModalBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: iOS17Theme.colors.systemFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailedModalBackButtonText: {
    ...iOS17Theme.typography.title3,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
  },
  detailedModalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: iOS17Theme.colors.systemFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailedModalCloseButtonText: {
    fontSize: 16,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
  },
  detailedModalSpacer: {
    width: 32,
    height: 32,
  },
  detailedModalScrollView: {
    flex: 1,
  },
  detailedModalScrollContent: {
    padding: iOS17Theme.spacing.lg,
    gap: iOS17Theme.spacing.lg,
  },
  // Header Card
  detailedHeaderCard: {
    borderRadius: iOS17Theme.cornerRadius.large,
    borderWidth: 1,
    overflow: 'hidden',
    ...iOS17Theme.shadows.medium,
  },
  detailedHeaderBlur: {
    padding: iOS17Theme.spacing.lg,
  },
  detailedHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailedHeaderImageContainer: {
    width: 60,
    height: 60,
    marginRight: iOS17Theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailedHeaderImage: {
    width: 50,
    height: 50,
  },
  detailedHeaderText: {
    flex: 1,
  },
  detailedHeaderNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: iOS17Theme.spacing.xs,
  },
  detailedHeaderName: {
    ...iOS17Theme.text.sectionTitle,
    color: iOS17Theme.colors.label,
    fontWeight: '700',
  },
  detailedHeaderDash: {
    ...iOS17Theme.text.sectionTitle,
    color: iOS17Theme.colors.secondaryLabel,
    marginHorizontal: iOS17Theme.spacing.sm,
    fontWeight: '300',
  },
  detailedHeaderConstellation: {
    ...iOS17Theme.text.sectionTitle,
    color: iOS17Theme.colors.secondaryLabel,
    fontSize: 18,
    fontWeight: '500',
  },
  detailedHeaderEssence: {
    ...iOS17Theme.text.bodyText,
    color: iOS17Theme.colors.label,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: iOS17Theme.spacing.sm,
    fontStyle: 'italic',
    fontWeight: '400',
  },
  detailedHeaderDates: {
    ...iOS17Theme.text.secondaryText,
    color: iOS17Theme.colors.tertiaryLabel,
    fontSize: 12,
    fontWeight: '500',
  },
  detailedHeaderSymbol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailedSymbolText: {
    fontSize: 48,
    fontWeight: '300',
  },
  // Info Grid Card
  detailedInfoCard: {
    borderRadius: iOS17Theme.cornerRadius.large,
    borderWidth: 1,
    borderColor: iOS17Theme.colors.separator,
    overflow: 'hidden',
    ...iOS17Theme.shadows.small,
  },
  detailedInfoBlur: {
    padding: iOS17Theme.spacing.lg,
  },
  detailedInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  detailedInfoItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: iOS17Theme.spacing.xs,
    minHeight: 60,
  },
  detailedInfoLabel: {
    ...iOS17Theme.text.tertiaryText,
    color: iOS17Theme.colors.tertiaryLabel,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: iOS17Theme.spacing.sm,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailedInfoValue: {
    ...iOS17Theme.text.cardTitle,
    color: iOS17Theme.colors.label,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Insight Card
  detailedInsightCard: {
    borderRadius: iOS17Theme.cornerRadius.large,
    borderWidth: 1,
    overflow: 'hidden',
    ...iOS17Theme.shadows.small,
  },
  detailedInsightBlur: {
    padding: iOS17Theme.spacing.lg,
  },
  detailedInsightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: iOS17Theme.spacing.md,
  },
  detailedInsightTitle: {
    ...iOS17Theme.text.cardTitle,
    color: iOS17Theme.colors.label,
    flex: 1,
  },
  detailedInsightText: {
    ...iOS17Theme.text.bodyText,
    color: iOS17Theme.colors.label,
  },
  summaryToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: iOS17Theme.spacing.xs,
    paddingHorizontal: iOS17Theme.spacing.sm,
    backgroundColor: 'rgba(138, 79, 255, 0.2)',
    borderRadius: iOS17Theme.cornerRadius.small,
    borderWidth: 1,
    borderColor: 'rgba(138, 79, 255, 0.3)',
  },
  summaryToggleText: {
    ...iOS17Theme.text.tertiaryText,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginRight: iOS17Theme.spacing.xs,
  },
  summaryToggleIcon: {
    fontSize: 12,
  },
  // Traits Cards
  detailedTraitsCard: {
    borderRadius: iOS17Theme.cornerRadius.large,
    borderWidth: 1.5,
    overflow: 'hidden',
    ...iOS17Theme.shadows.medium,
  },
  detailedTraitsBlur: {
    padding: iOS17Theme.spacing.lg,
  },
  detailedTraitsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: iOS17Theme.spacing.md,
  },
  detailedTraitsTitle: {
    ...iOS17Theme.text.cardTitle,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
  },
  traitsIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  traitsIcon: {
    fontSize: 16,
  },
  detailedTraitsList: {
    gap: iOS17Theme.spacing.md,
  },
  detailedTraitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: iOS17Theme.spacing.xs,
  },
  traitBulletContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: iOS17Theme.spacing.sm,
    marginTop: 2,
  },
  detailedTraitBullet: {
    fontSize: 12,
    fontWeight: '700',
  },
  detailedTraitText: {
    ...iOS17Theme.text.bodyText,
    color: iOS17Theme.colors.label,
    flex: 1,
    fontWeight: '500',
    lineHeight: 20,
  },
  // Compatibility Section
  compatibilityGrid: {
    gap: iOS17Theme.spacing.md,
  },
  compatibilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: iOS17Theme.spacing.sm,
    paddingHorizontal: iOS17Theme.spacing.sm,
  },
  compatibilityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: iOS17Theme.spacing.md,
    backgroundColor: 'rgba(138, 79, 255, 0.1)',
  },
  compatibilityIcon: {
    fontSize: 20,
  },
  compatibilityTextContainer: {
    flex: 1,
    marginRight: iOS17Theme.spacing.sm,
  },
  compatibilitySignName: {
    ...iOS17Theme.text.cardTitle,
    color: iOS17Theme.colors.label,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  compatibilityType: {
    ...iOS17Theme.text.secondaryText,
    color: '#8A4FFF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  compatibilityDescription: {
    ...iOS17Theme.text.tertiaryText,
    color: iOS17Theme.colors.secondaryLabel,
    fontSize: 12,
    lineHeight: 16,
  },
  compatibilityScore: {
    width: 50,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compatibilityScoreText: {
    ...iOS17Theme.text.secondaryText,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  // Detailed View Overlay
  detailedViewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: iOS17Theme.colors.systemGroupedBackground,
  },
});

export default IOS17ZodiacExperience;
