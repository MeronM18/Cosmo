import { getWordForDate, getWordsForDateRange } from '../wordOfTheDay';

describe('Word of the Day', () => {
  test('should return consistent word for same date', () => {
    const date = '2024-01-01';
    const word1 = getWordForDate(date);
    const word2 = getWordForDate(date);
    
    expect(word1.word).toBe(word2.word);
    expect(word1.category).toBe(word2.category);
    expect(word1.definition).toBe(word2.definition);
  });

  test('should return different words for different dates', () => {
    const word1 = getWordForDate('2024-01-01');
    const word2 = getWordForDate('2024-01-02');
    
    // While it's possible they could be the same due to the hash algorithm,
    // it's very unlikely with our word database size
    expect(word1.word).not.toBe(word2.word);
  });

  test('should return valid word object structure', () => {
    const word = getWordForDate('2024-01-01');
    
    expect(word).toHaveProperty('word');
    expect(word).toHaveProperty('category');
    expect(word).toHaveProperty('definition');
    expect(typeof word.word).toBe('string');
    expect(typeof word.category).toBe('string');
    expect(typeof word.definition).toBe('string');
  });

  test('should return correct number of words for date range', () => {
    const words = getWordsForDateRange('2024-01-01', '2024-01-03');
    expect(words).toHaveLength(3);
  });

  test('should handle leap year dates', () => {
    const word = getWordForDate('2024-02-29');
    expect(word).toBeDefined();
    expect(word.word).toBeTruthy();
  });

  test('should be deterministic across multiple calls', () => {
    const testDates = ['2024-01-01', '2024-06-15', '2024-12-31'];
    
    testDates.forEach(date => {
      const calls = Array.from({ length: 10 }, () => getWordForDate(date));
      const firstWord = calls[0];
      
      calls.forEach(word => {
        expect(word.word).toBe(firstWord.word);
      });
    });
  });
});
