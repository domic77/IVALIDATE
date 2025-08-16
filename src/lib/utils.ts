import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { GoogleGenerativeAI } from '@google/generative-ai'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate unique validation ID (deterministic for SSR/client consistency)
export function generateValidationId(): string {
  // Use crypto.randomUUID if available (browser) or fallback for server
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return `val_${window.crypto.randomUUID()}`;
  }
  
  // Server-side fallback using timestamp-based approach
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `val_${timestamp}_${random}`;
}

// Simple keyword extraction (synchronous fallback) 
export function extractKeywords(text: string): string[] {
  // For now, use manual extraction to avoid async issues
  // The main validation flow uses extractKeywordsWithBestAI for AI-powered extraction
  return extractKeywordsManual(text);
}

// Gemini AI keyword extraction (restored)
async function extractKeywordsAI(text: string): Promise<string[]> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Extract 5-8 relevant keywords from this startup idea description. Focus on:
    - Main product/service keywords
    - Industry/domain terms
    - Target market terms
    - Technology/method terms
    
    Return only the keywords, separated by commas, no explanations:
    
    "${text}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const keywords = response.text()
      .split(',')
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length > 2 && k.length < 30)
      .slice(0, 8);

    return keywords.length > 0 ? keywords : extractKeywordsManual(text);
  } catch (error) {
    console.error('Gemini keyword extraction failed:', error);
    return extractKeywordsManual(text);
  }
}

// Fallback manual keyword extraction (improved version)
function extractKeywordsManual(text: string): string[] {
  const cleanText = text.toLowerCase().trim();
  
  // Extract meaningful phrases (2-3 words) and single keywords
  const keywords: string[] = [];
  
  // 1. Extract important phrases (2-3 words)
  const words = cleanText.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(word => word.length > 2);
  
  // Extract 2-word phrases
  for (let i = 0; i < words.length - 1; i++) {
    const phrase = `${words[i]} ${words[i + 1]}`;
    if (!isStopWord(words[i]) && !isStopWord(words[i + 1]) && 
        (words[i].length > 3 || words[i + 1].length > 3)) {
      keywords.push(phrase);
    }
  }
  
  // Extract 3-word phrases for app/platform concepts
  for (let i = 0; i < words.length - 2; i++) {
    const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
    if (!isStopWord(words[i]) && !isStopWord(words[i + 1]) && !isStopWord(words[i + 2])) {
      // Only keep if it contains common startup terms
      if (phrase.includes('app') || phrase.includes('platform') || phrase.includes('service') || 
          phrase.includes('tool') || phrase.includes('system') || phrase.includes('solution')) {
        keywords.push(phrase);
      }
    }
  }
  
  // 2. Extract single important keywords
  const singleKeywords = words
    .filter(word => word.length > 3)
    .filter(word => !isStopWord(word))
    .filter(word => !isCommonWord(word)); // Additional filter for better keywords
  
  keywords.push(...singleKeywords);
  
  // 3. Remove duplicates and prioritize
  const uniqueKeywords = [...new Set(keywords)];
  
  // 4. Prioritize phrases over single words, limit to 8 keywords
  const phrases = uniqueKeywords.filter(k => k.includes(' '));
  const singles = uniqueKeywords.filter(k => !k.includes(' '));
  
  return [...phrases.slice(0, 5), ...singles.slice(0, 3)];
}

function isCommonWord(word: string): boolean {
  const commonWords = [
    'app', 'application', 'platform', 'service', 'tool', 'system', 'solution', 
    'website', 'software', 'product', 'business', 'company', 'startup', 'idea',
    'people', 'users', 'customers', 'market', 'industry', 'technology', 'digital'
  ];
  return commonWords.includes(word);
}

function isStopWord(word: string): boolean {
  const stopWords = [
    'this', 'that', 'with', 'have', 'will', 'from', 'they', 'know',
    'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when',
    'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over',
    'such', 'take', 'than', 'them', 'well', 'were', 'what', 'year',
    'your', 'work', 'life', 'only', 'think', 'also', 'back', 'after',
    'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any',
    'these', 'give', 'day', 'most', 'us'
  ];
  return stopWords.includes(word);
}

// Format large numbers
export function formatNumber(num: number): string {
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

// Get grade from score
export function getGradeFromScore(score: number): 'A' | 'B+' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

// Get grade color classes
export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A': return 'bg-green-100 text-green-800 border-green-200';
    case 'B+': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'B': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'D': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'F': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}
