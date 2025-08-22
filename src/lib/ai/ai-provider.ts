import { AIAnalysis } from '@/types/validation';
import { analyzeStartupIdea as analyzeWithGemini, extractKeywordsAI } from './gemini';

export interface AnalysisData {
  idea: string;
  industry: string;
  targetMarket: string;
  redditInsights?: any;
  trendsData?: any;
  youtubeData?: any;
}

export enum AIProvider {
  GEMINI = 'gemini'
}

// Gemini AI analysis system
export async function analyzeStartupWithBestAI(
  data: AnalysisData,
  preferredProvider: AIProvider = AIProvider.GEMINI
): Promise<{
  analysis: AIAnalysis;
  provider: string;
  model: string;
}> {
  console.log('🤖 Starting Gemini AI analysis...');

  try {
    console.log('🔄 Using Gemini for startup analysis...');
    
    const analysis = await analyzeWithGemini(data);
    
    console.log('✅ Analysis successful with Gemini');
    return {
      analysis,
      provider: 'Google Gemini',
      model: 'gemini-2.0-flash-exp'
    };

  } catch (error) {
    console.error('❌ Gemini analysis failed:', error instanceof Error ? error.message : error);
    throw error; // Re-throw error instead of fallback
  }
}

// Gemini keyword extraction
export async function extractKeywordsWithBestAI(
  text: string,
  preferredProvider: AIProvider = AIProvider.GEMINI
): Promise<{
  keywords: string[];
  provider: string;
}> {
  console.log('🔍 Starting Gemini keyword extraction...');

  try {
    console.log('🔄 Using Gemini for keyword extraction...');
    
    const keywords = await extractKeywordsAI(text);
    
    if (keywords && keywords.length > 0) {
      console.log('✅ Keywords extracted with Gemini:', keywords.join(', '));
      return {
        keywords,
        provider: 'Google Gemini'
      };
    }

  } catch (error) {
    console.error('❌ Gemini keyword extraction failed:', error);
    throw error; // Don't fallback, just crash
  }
}

