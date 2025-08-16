import { promises as fs } from 'fs';
import path from 'path';

interface DebugEntry {
  validationId: string;
  timestamp: string;
  step: string;
  data: any;
  success: boolean;
  error?: string;
}

interface AIKeywordDebugData {
  refinedIdeaInput: {
    oneLiner: string;
    targetAudience: string;
    problem: string;
  };
  aiResponse: {
    recommendedSubreddits: any[];
    searchKeywords: string[];
    focusQueries: string[];
    painPointQueries?: string[];
  };
  success: boolean;
  error?: string;
  rawAIText?: string;
}

interface RedditSearchDebugData {
  inputKeywords: string[];
  targetSubreddits: string[];
  searchQueries: string[];
  searchResults: {
    subreddit: string;
    query: string;
    postsFound: number;
    error?: string;
  }[];
  totalMentions: number;
  frustratedUsers: number;
  success: boolean;
  error?: string;
  aiAnalysis?: {
    totalPostsAnalyzed: number;
    relevantQuotesFound: number;
    overallSentiment: number;
    frustrationLevel: number;
    keyInsights: string[];
  };
}

const DEBUG_DIR = path.join(process.cwd(), 'debug-logs');

// Ensure debug directory exists
async function ensureDebugDir() {
  try {
    await fs.access(DEBUG_DIR);
  } catch {
    await fs.mkdir(DEBUG_DIR, { recursive: true });
  }
}

export async function saveDebugLog(validationId: string, step: string, data: any, success: boolean, error?: string) {
  try {
    await ensureDebugDir();
    
    const entry: DebugEntry = {
      validationId,
      timestamp: new Date().toISOString(),
      step,
      data,
      success,
      error
    };
    
    const filename = `${validationId}_debug.json`;
    const filepath = path.join(DEBUG_DIR, filename);
    
    // Load existing logs or create new array
    let logs: DebugEntry[] = [];
    try {
      const existing = await fs.readFile(filepath, 'utf-8');
      logs = JSON.parse(existing);
    } catch {
      // File doesn't exist, start with empty array
    }
    
    logs.push(entry);
    
    // Save updated logs
    await fs.writeFile(filepath, JSON.stringify(logs, null, 2));
    
    console.log(`🐛 Debug: Saved ${step} for validation ${validationId}`);
  } catch (debugError) {
    console.error('Failed to save debug log:', debugError);
  }
}

export async function saveAIKeywordDebug(validationId: string, data: AIKeywordDebugData) {
  await saveDebugLog(validationId, 'ai-keyword-generation', data, data.success, data.error);
}

export async function saveRedditSearchDebug(validationId: string, data: RedditSearchDebugData) {
  await saveDebugLog(validationId, 'reddit-search', data, data.success, data.error);
}

export async function getDebugLogs(validationId: string): Promise<DebugEntry[]> {
  try {
    const filename = `${validationId}_debug.json`;
    const filepath = path.join(DEBUG_DIR, filename);
    const content = await fs.readFile(filepath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

// Create a simple debug endpoint
export async function createDebugSummary(validationId: string) {
  const logs = await getDebugLogs(validationId);
  
  const summary = {
    validationId,
    totalSteps: logs.length,
    steps: logs.map(log => ({
      step: log.step,
      timestamp: log.timestamp,
      success: log.success,
      error: log.error,
      dataPreview: typeof log.data === 'object' ? 
        Object.keys(log.data).reduce((preview: any, key) => {
          const value = log.data[key];
          if (Array.isArray(value)) {
            preview[key] = `Array(${value.length})`;
          } else if (typeof value === 'object' && value !== null) {
            preview[key] = `Object(${Object.keys(value).length} keys)`;
          } else {
            preview[key] = value;
          }
          return preview;
        }, {}) : log.data
    })),
    aiKeywordStep: logs.find(l => l.step === 'ai-keyword-generation'),
    redditSearchStep: logs.find(l => l.step === 'reddit-search')
  };
  
  return summary;
}