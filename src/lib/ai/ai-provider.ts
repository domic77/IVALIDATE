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
  }

  // Fallback to manual extraction if Gemini fails
  console.warn('🔧 Gemini failed, using manual keyword extraction');
  
  const words = text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/);
  const keywords: string[] = [];
  
  // Add key single words (excluding common stop words)
  const stopWords = ['the', 'and', 'for', 'with', 'that', 'this', 'will', 'can', 'are', 'have', 'would', 'could', 'should', 'from', 'they', 'them', 'than', 'their'];
  const meaningfulWords = words
    .filter(word => word.length > 3 && !stopWords.includes(word))
    .slice(0, 5);
  keywords.push(...meaningfulWords);
  
  // Add common problem/solution keywords if they appear
  const problemWords = ['problem', 'issue', 'frustrating', 'difficult', 'hard', 'expensive', 'slow', 'complex'];
  const solutionWords = ['solution', 'app', 'platform', 'service', 'tool', 'system', 'software', 'management', 'tracking'];
  
  [...problemWords, ...solutionWords].forEach(term => {
    if (text.toLowerCase().includes(term) && !keywords.includes(term)) {
      keywords.push(term);
    }
  });
  
  console.log('🔧 Manual keywords generated:', keywords.slice(0, 8));
  
  return {
    keywords: keywords.slice(0, 8),
    provider: 'manual-fallback'
  };
}

