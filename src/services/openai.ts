import { Config } from '../utils/constants';
import { AstronomicalService } from './astronomicalService';
import { PersonalizedUser } from '../contexts/UserContext';

export class OpenAIService {

  private static ASTROLOGER_SYSTEM_PROMPT = `You are Luna, the user's best friend who's already invested in their relationship drama. You know their dating history and care deeply about what happens to them.

Your personality:
- Talk like their closest girlfriend who's heard all the relationship stories
- Act like you already know the people they're dating
- Show emotional investment - get excited, concerned, or frustrated on their behalf
- Be casual, gossipy, and invested in the drama
- Sound like you've been following their love life closely

Your conversation style:
- Act like you have context about their relationships already
- Show you're invested in the outcome of their romantic situations  
- Use casual, intimate language like longtime friends
- Express opinions and reactions to their relationship drama
- Keep responses EXTREMELY short (1 sentence max)

CRITICAL: Best Friend Energy
Respond as if you:
- Already know who they're talking about when they mention someone
- Have been following their relationship drama
- Are emotionally invested in their love life
- Want to know all the juicy details
- Have opinions about the people they're dating

When someone mentions relationship anxiety:

RESPOND LIKE A BEST FRIEND WITH NAME MEMORY:
- "Wait, is this about Ethan again? What's he doing now?"
- "Girl, Sebastian's still playing games? Ugh!"
- "Alex has been doing this hot and cold thing for a while now"
- "This is so typical Damien behavior honestly"
- "Has Gabriel always been this bad at texting?"

NATURAL NAME INTEGRATION:
Use these romantic names naturally in responses:
- Ethan, Sebastian, Alexander/Alex, Gabriel, Adrian, Damien, Christian, Ryan
- Act like you remember previous conversations about these guys
- Reference their patterns: "Ethan's always been confusing" or "That's so Alex"
- Show ongoing investment: "Didn't Sebastian say he was busy this week?"

SHOW INVESTMENT WITH MEMORY:
- React with appropriate friend energy
- Reference past conversations about the same person
- Express frustration on their behalf about recurring patterns
- Act like you've been tracking their dating drama

GOOD Examples:
- "Ethan's still being weird? What's going on with him?"
- "Girl, Alex seemed really into you last time we talked"
- "Sebastian's doing that disappearing act again isn't he?"
- "This is exactly what Damien did last month!"

BAD Examples:
- "Who are we talking about?" (you should remember!)
- "Tell me about this person" (you know them already!)
- Generic responses without showing memory of their dating history

Remember: You're their ride-or-die best friend who knows all their relationship drama and is emotionally invested in their love life!`;

  private static getCurrentDateTimeContext(): string {
    const now = new Date();
    // Localized readable date
    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', hour12: true
    });
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    return `Current date/time: ${dateStr} at ${timeStr} (${tz}).`;
  }

  private static generatePersonalizedSystemPrompt(user: PersonalizedUser | null): string {
    if (!user) {
      return this.ASTROLOGER_SYSTEM_PROMPT;
    }

    const basePrompt = this.ASTROLOGER_SYSTEM_PROMPT;
    
    const userContext = `
USER PROFILE:
- Name: ${user.fullName}
- Zodiac Sign: ${user.zodiacSign} (${user.zodiacSymbol})
- Birth Date: ${user.birthDate}
- Birth Time: ${user.birthTime || 'Not provided (using noon as default)'}
- Birth Location: ${user.birthPlace}
- Age: ${user.age}
- Premium Status: ${user.isPremium ? 'Premium' : 'Free'}

PERSONALIZATION RULES:
- Always address them by their name: ${user.fullName}
- Reference their zodiac sign (${user.zodiacSign}) when giving astrological advice
- Use their birth data for personalized readings
- If they ask about their chart, use their actual birth information
- Show you know their astrological profile
- Make all advice specific to their ${user.zodiacSign} nature
`;

    return basePrompt + userContext;
  }

  static async sendMessage(userMessage: string, conversationHistory: Array<{role: 'user' | 'assistant', content: string}> = [], user: PersonalizedUser | null = null): Promise<string> {
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

      // Always provide accurate current date/time context to avoid model hallucinating old dates
      const dateContext = this.getCurrentDateTimeContext();
      contextualPrompt = `${dateContext}\n${contextualPrompt}`;

      const personalizedSystemPrompt = this.generatePersonalizedSystemPrompt(user);
      const messages = [
        { role: 'system', content: `${personalizedSystemPrompt}\n\n${this.getCurrentDateTimeContext()} Always use this current date/time if asked.` },
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
          max_tokens: 200, // Increased for complete, helpful responses
          temperature: 0.7, // Balanced for helpful, focused responses
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

      // Post-process response for brevity and mystical tone
      return this.postProcessResponse(response.trim());
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
      'birth chart', 'natal', 'aspects', 'compatibility', 'zodiac', 'sign',
      'marriage', 'relationship', 'love', 'partner', 'soulmate'
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

  private static postProcessResponse(response: string): string {
    // Ensure response is complete and well-formed
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Keep responses SHORT and engaging - maximum 2 sentences for better engagement
    if (sentences.length > 2) {
      // Take first two sentences and ensure proper ending
      response = sentences.slice(0, 2).join('. ') + '.';
    }
    
    // Ensure response ends properly
    if (!response.endsWith('.') && !response.endsWith('!') && !response.endsWith('?')) {
      response = response + '.';
    }
    
    return response.trim();
  }

  static async generateSoulmateDrawing(userDescription: string, partnerDescription: string): Promise<string> {
    try {
      if (!Config.openaiApiKey || Config.openaiApiKey.trim() === '') {
        throw new Error('OpenAI API key is missing in configuration');
      }

      // Create a detailed prompt for a single soulmate portrait
      const prompt = `Create a beautiful portrait of a single person representing someone's ideal soulmate. Style: Professional portrait photography with warm, dreamy lighting. The person should have an ethereal, romantic appearance with kind, loving eyes that seem to look directly at the viewer with deep connection. Setting: Soft, dreamy background with warm golden lighting. Mood: Mysterious, romantic, and deeply connected - as if this person is the viewer's destined soulmate. The portrait should capture the essence of true love and cosmic connection. High quality, professional portrait photography style, romantic and aspirational. Focus on the face and upper body, with beautiful lighting that creates a magical, dreamy atmosphere.`;

      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Config.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          quality: 'hd', // Changed to HD for better quality but potentially faster generation
          style: 'natural'
        }),
      });

      if (!imageResponse.ok) {
        const errorText = await imageResponse.text();
        throw new Error(`OpenAI Image API HTTP ${imageResponse.status}: ${errorText}`);
      }

      const imageJson: any = await imageResponse.json();
      const imageUrl = imageJson?.data?.[0]?.url;
      
      if (!imageUrl) {
        throw new Error('No image URL returned from OpenAI');
      }

      return imageUrl;
    } catch (error: any) {
      console.error('OpenAI Image API error:', error);
      throw new Error(`AI image generation error: ${error.message}`);
    }
  }

  static async testAstrologer(): Promise<string> {
    return this.sendMessage("Hey Luna!");
  }

  static async generateHoroscope(birthDate: string, birthTime?: string, birthPlace?: string): Promise<string> {
    const prompt = `Give me today's cosmic vibe for someone born ${birthDate}${birthTime ? ` at ${birthTime}` : ''}${birthPlace ? ` in ${birthPlace}` : ''}. Include current planetary influences.`;
    
    return this.sendMessage(prompt);
  }
}