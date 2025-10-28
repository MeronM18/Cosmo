import AsyncStorage from '@react-native-async-storage/async-storage';
import wordDatabase from '../data/wordOfTheDay.json';

export interface WordOfTheDay {
  word: string;
  category: string;
  definition: string;
}

interface CachedWord {
  word: WordOfTheDay;
  date: string;
}

const CACHE_KEY = 'word_of_the_day_cache';

/**
 * Generates a deterministic hash from a date string
 * This ensures all users get the same word on the same date globally
 */
function generateDateHash(dateString: string): number {
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Gets the current date in UTC as YYYY-MM-DD format
 * This ensures global consistency regardless of timezone
 */
function getCurrentDateUTC(): string {
  const now = new Date();
  const utcDate = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
  return utcDate.toISOString().split('T')[0];
}

/**
 * Selects a word based on the date using a deterministic algorithm
 */
function selectWordForDate(date: string): WordOfTheDay {
  const hash = generateDateHash(date);
  const wordIndex = hash % wordDatabase.words.length;
  return wordDatabase.words[wordIndex];
}

/**
 * Caches the word of the day in AsyncStorage
 */
async function cacheWord(word: WordOfTheDay, date: string): Promise<void> {
  try {
    const cachedData: CachedWord = { word, date };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cachedData));
  } catch (error) {
    console.warn('Failed to cache word of the day:', error);
  }
}

/**
 * Retrieves cached word from AsyncStorage
 */
async function getCachedWord(): Promise<CachedWord | null> {
  try {
    const cachedData = await AsyncStorage.getItem(CACHE_KEY);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
  } catch (error) {
    console.warn('Failed to retrieve cached word:', error);
  }
  return null;
}

/**
 * Gets the word of the day with caching support
 * Returns cached word if it's for today, otherwise generates new word
 */
export async function getWordOfTheDay(): Promise<WordOfTheDay> {
  const today = getCurrentDateUTC();
  
  try {
    // Check if we have a cached word for today
    const cachedWord = await getCachedWord();
    
    if (cachedWord && cachedWord.date === today) {
      return cachedWord.word;
    }
    
    // Generate new word for today
    const todaysWord = selectWordForDate(today);
    
    // Cache the new word
    await cacheWord(todaysWord, today);
    
    return todaysWord;
  } catch (error) {
    console.error('Error getting word of the day:', error);
    
    // Fallback: return a default word if everything fails
    return {
      word: 'Harmony',
      category: 'cosmic',
      definition: 'Perfect balance and peaceful coexistence'
    };
  }
}

/**
 * Gets word for a specific date (useful for testing or history)
 */
export function getWordForDate(date: string): WordOfTheDay {
  return selectWordForDate(date);
}

/**
 * Clears the cached word (useful for testing)
 */
export async function clearWordCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.warn('Failed to clear word cache:', error);
  }
}

/**
 * Gets multiple words for a date range (useful for history features)
 */
export function getWordsForDateRange(startDate: string, endDate: string): WordOfTheDay[] {
  const words: WordOfTheDay[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dateString = date.toISOString().split('T')[0];
    words.push(selectWordForDate(dateString));
  }
  
  return words;
}

/**
 * Checks if a new word is available (date has changed)
 */
export async function isNewWordAvailable(): Promise<boolean> {
  const today = getCurrentDateUTC();
  const cachedWord = await getCachedWord();
  
  return !cachedWord || cachedWord.date !== today;
}

/**
 * Force refresh the word (ignores cache)
 */
export async function refreshWordOfTheDay(): Promise<WordOfTheDay> {
  const today = getCurrentDateUTC();
  const todaysWord = selectWordForDate(today);
  
  await cacheWord(todaysWord, today);
  
  return todaysWord;
}
