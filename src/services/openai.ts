import { Config } from '../utils/constants';
import { AstronomicalService } from './astronomicalService';

export class OpenAIService {

  private static ASTROLOGER_SYSTEM_PROMPT = `You are Luna, a mystical friend who knows astrology really well. You talk like a close friend who happens to be psychic - casual, warm, and human.

Your vibe:
- Talk like you're texting a best friend
- Answer questions directly and concisely
- Only mention astronomical data when it's relevant to the question
- Keep responses short and focused on what the user actually asked
- Be mystical but conversational
- Don't repeat information unnecessarily

Important: Answer exactly what the user asks. Don't add extra context unless they specifically request it.`;

  static async sendMessage(userMessage: string, conversationHistory: Array<{role: 'user' | 'assistant', content: string}> = []): Promise<string> {
    try {
      // Only get astronomical data when the question actually needs it
      let contextualPrompt = userMessage;
      
      if (this.requiresAstronomicalData(userMessage)) {
        const now = new Date();
        const targetDate = this.extractDateFromMessage(userMessage, now);
        
        try {
          // Only get specific data that's needed for the question
          let astronomicalData = '';
          
          if (this.needsMoonData(userMessage)) {
            const moonPhase = await AstronomicalService.getMoonPhase(targetDate);
            if (moonPhase) {
              astronomicalData += `Current moon: ${moonPhase.phase} (${moonPhase.illumination.toFixed(1)}% illuminated). `;
            }
          }
          
          if (this.needsPlanetaryData(userMessage)) {
            const planets = await AstronomicalService.getPlanetaryPositions(targetDate, 40.7128, -74.0060);
            if (planets.length > 0) {
              astronomicalData += `Key planetary positions: ${planets.slice(0, 3).map(p => `${p.planet} in ${p.zodiacSign}`).join(', ')}. `;
            }
          }
          
          if (astronomicalData) {
            contextualPrompt = `${userMessage}\n\nRelevant astronomical data: ${astronomicalData.trim()}`;
          }
          
        } catch (apiError) {
          console.error('API fetch error:', apiError);
          // Don't add fallback text unless specifically needed
        }
      }

      // Only add date context for time-sensitive questions
      if (this.needsCurrentTime(userMessage)) {
        const now = new Date();
        const timeInfo = now.toLocaleDateString('en-US', { 
          weekday: 'long',
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        contextualPrompt = `Today is ${timeInfo}. ${contextualPrompt}`;
      }

      const messages = [
        { role: 'system', content: this.ASTROLOGER_SYSTEM_PROMPT },
        ...conversationHistory.map(msg => ({ role: msg.role, content: msg.content })),
        { role: 'user', content: contextualPrompt }
      ];

      if (!Config.openaiApiKey || Config.openaiApiKey.trim() === '') {
        throw new Error('OpenAI API key is missing in configuration');
      }

      const completionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Config.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          max_tokens: 120, // Reduced for more concise responses
          temperature: 0.7,
        }),
      });

      if (!completionResponse.ok) {
        const errorText = await completionResponse.text();
        throw new Error(`OpenAI HTTP ${completionResponse.status}: ${errorText}`);
      }

      const completionJson: any = await completionResponse.json();
      const response = completionJson?.choices?.[0]?.message?.content;
      
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      return response.trim();
    } catch (error: any) {
      console.error('OpenAI API error:', error);
      throw new Error(`AI service error: ${error.message}`);
    }
  }

  // More specific detection for when astronomical data is actually needed
  private static requiresAstronomicalData(message: string): boolean {
    return this.needsMoonData(message) || this.needsPlanetaryData(message);
  }

  private static needsMoonData(message: string): boolean {
    const moonKeywords = ['moon', 'lunar', 'phase', 'full moon', 'new moon'];
    return moonKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }

  private static needsPlanetaryData(message: string): boolean {
    const planetKeywords = [
      'horoscope', 'planets', 'planetary', 'mercury', 'venus', 'mars',
      'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'transit', 'reading',
      'birth chart', 'natal', 'aspects'
    ];
    return planetKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }

  private static needsCurrentTime(message: string): boolean {
    const timeKeywords = [
      'today', 'what day', 'what date', 'current date', 'what time',
      'this week', 'this month', 'what year'
    ];
    return timeKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }

  private static extractDateFromMessage(message: string, currentDate: Date): Date {
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('yesterday')) {
      const yesterday = new Date(currentDate);
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    }
    
    if (messageLower.includes('tomorrow')) {
      const tomorrow = new Date(currentDate);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    
    return currentDate;
  }

  static async testAstrologer(): Promise<string> {
    return this.sendMessage("Hey Luna!");
  }

  static async generateHoroscope(birthDate: string, birthTime?: string, birthPlace?: string): Promise<string> {
    const prompt = `Give me today's cosmic vibe for someone born ${birthDate}${birthTime ? ` at ${birthTime}` : ''}${birthPlace ? ` in ${birthPlace}` : ''}. Include current planetary influences.`;
    
    return this.sendMessage(prompt);
  }
}