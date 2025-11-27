import type { GeminiAnalysisResult, UserAnswerData } from './types';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
      role: string;
    };
    finishReason: 'STOP' | 'MAX_TOKENS' | 'SAFETY' | 'OTHER_ERROR' | 'RECITATION' | 'LANGUAGE';
    avgLogprobs?: number;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
  modelVersion?: string;
  responseId?: string;
}

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export class GeminiService {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      throw new Error('GEMINI_API_KEY is not configured. Please set it in your environment variables.');
    }
    this.apiKey = apiKey;
  }

  private buildPrompt(
    userAnswer: UserAnswerData,
    availableSubcultures: Array<{ id: string; name: string; description: string }>,
    availableTribes: Array<{ id: string; name: string; description: string }>
  ): string {
    return `You are an expert cultural analyst tasked with determining a user's cultural tribe and subculture affinities based on their preferences.

**USER PREFERENCES:**
- Selected Moodboard: "${userAnswer.moodboard.name}" - ${userAnswer.moodboard.description}
- Selected Brands: ${userAnswer.brands.length > 0 ? userAnswer.brands.join(', ') : 'None'}
- Selected Keywords: ${userAnswer.keywords.length > 0 ? userAnswer.keywords.join(', ') : 'None'}

**AVAILABLE SUBCULTURES:**
${availableSubcultures.map(s => `- ID: ${s.id}, Name: "${s.name}", Description: ${s.description}`).join('\n')}

**AVAILABLE TRIBES:**
${availableTribes.map(t => `- ID: ${t.id}, Name: "${t.name}", Description: ${t.description}`).join('\n')}

**ANALYSIS RULES:**
1. The subculture match is primarily determined by the selected moodboard and brand preferences
2. The tribe is determined by combining subculture affinities with the selected keywords
3. Calculate percentage matches for ALL subcultures (must sum to 100%)
4. Select the ONE tribe that best matches the combined profile

**RESPONSE FORMAT (JSON ONLY - NO MARKDOWN):**
{
  "tribe_id": "uuid-of-selected-tribe",
  "tribe_name": "Name of the tribe",
  "subcultures": [
    {
      "subculture_id": "uuid-of-subculture",
      "subculture_name": "Name of subculture",
      "percentage": 45
    },
    {
      "subculture_id": "uuid-of-subculture",
      "subculture_name": "Name of subculture",
      "percentage": 30
    }
  ]
}

**REQUIREMENTS:**
- Subculture percentages MUST sum to exactly 100
- Include ALL subcultures with their calculated percentages
- Return ONLY valid JSON (no markdown, no explanation)
- Percentages must be integers
- Select exactly ONE tribe

Analyze the user preferences and provide the JSON response:`;
  }

  async analyzeUserPreferences(
    userAnswer: UserAnswerData,
    availableSubcultures: Array<{ id: string; name: string; description: string }>,
    availableTribes: Array<{ id: string; name: string; description: string }>
  ): Promise<GeminiAnalysisResult> {
    const prompt = this.buildPrompt(userAnswer, availableSubcultures, availableTribes);

    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API request failed: ${response.status} - ${errorText}`);
    }

    const data: GeminiResponse = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('Gemini API returned no candidates');
    }

    const candidate = data.candidates[0];

    if (candidate.finishReason !== 'STOP') {
      throw new Error(`Gemini stopped with reason: ${candidate.finishReason}`);
    }

    const resultText = candidate.content.parts[0].text;

    // Clean up markdown code blocks if present
    const cleanedText = resultText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    let parsedResult: GeminiAnalysisResult;
    try {
      parsedResult = JSON.parse(cleanedText);
    } catch (error) {
      throw new Error(`Failed to parse Gemini response as JSON: ${cleanedText}`);
    }

    // Validate response structure
    if (!parsedResult.tribe_id || !parsedResult.tribe_name || !Array.isArray(parsedResult.subcultures)) {
      throw new Error('Invalid response structure from Gemini');
    }

    // Validate percentages sum to 100
    const totalPercentage = parsedResult.subcultures.reduce((sum, s) => sum + s.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 1) {
      throw new Error(`Subculture percentages must sum to 100, got ${totalPercentage}`);
    }

    return parsedResult;
  }
}
