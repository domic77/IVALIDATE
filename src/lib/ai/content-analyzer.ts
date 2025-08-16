import { GoogleGenerativeAI } from '@google/generative-ai';

interface RedditPost {
  title: string;
  content: string;
  author: string;
  upvotes: number;
  subreddit: string;
  url: string;
  timestamp: string;
  comments?: Array<{
    body: string;
    author: string;
    ups: number;
  }>;
}

interface AnalyzedContent {
  relevantQuotes: Array<{
    quote: string;
    author: string;
    subreddit: string;
    upvotes: number;
    url: string;
    sentiment: 'frustrated' | 'neutral' | 'satisfied';
    relevanceScore: number;
    painPointCategory: string;
    sentimentConfidence: number;
  }>;
  overallSentiment: number;
  painPoints: string[];
  keyInsights: string[];
  frustrationLevel: number;
  totalRelevantPosts: number;
  analysisConfidence: number;
}

function parseAIResponse(aiText: string): AnalyzedContent {
  // Step 1: Clean the response text thoroughly
  let cleanText = aiText.trim();
  
  // Remove markdown code blocks
  cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  
  // Remove any leading/trailing text that's not JSON
  const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleanText = jsonMatch[0];
  }
  
  // Step 2: Fix common JSON escape issues
  cleanText = sanitizeJSONString(cleanText);
  
  // Step 3: Try parsing with multiple strategies
  const parseStrategies = [
    // Strategy 1: Direct parse
    () => JSON.parse(cleanText),
    
    // Strategy 2: Fix quotes and try again
    () => {
      const fixedQuotes = cleanText
        .replace(/([^\\])"/g, '$1\\"') // Escape unescaped quotes
        .replace(/^"/g, '\\"'); // Escape quote at start
      return JSON.parse(fixedQuotes);
    },
    
    // Strategy 3: Replace problematic characters
    () => {
      const cleaned = cleanText
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
        .replace(/\b/g, '\\b')
        .replace(/\f/g, '\\f');
      return JSON.parse(cleaned);
    },
    
    // Strategy 4: Extract and reconstruct JSON manually
    () => {
      return reconstructJSON(cleanText);
    }
  ];
  
  // Try each strategy
  for (let i = 0; i < parseStrategies.length; i++) {
    try {
      console.log(`🔄 Trying parsing strategy ${i + 1}...`);
      const result = parseStrategies[i]();
      console.log(`✅ Successfully parsed with strategy ${i + 1}`);
      return result;
    } catch (error) {
      console.log(`❌ Strategy ${i + 1} failed:`, error instanceof Error ? error.message : 'Unknown error');
      if (i === parseStrategies.length - 1) {
        throw new Error(`All parsing strategies failed. Last error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }
  
  throw new Error('All parsing strategies exhausted');
}

function sanitizeJSONString(text: string): string {
  // Fix common escape sequence issues
  return text
    // Fix double escaping
    .replace(/\\\\"/g, '\\"')
    .replace(/\\\\n/g, '\\n')
    .replace(/\\\\r/g, '\\r')
    .replace(/\\\\t/g, '\\t')
    // Fix unescaped newlines in strings
    .replace(/("(?:[^"\\]|\\.)*?")/g, (match) => {
      return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
    })
    // Remove any null bytes or other problematic characters
    .replace(/\0/g, '')
    .replace(/[\x00-\x1F\x7F]/g, (match) => {
      const code = match.charCodeAt(0);
      if (code === 9) return '\\t';  // tab
      if (code === 10) return '\\n'; // newline
      if (code === 13) return '\\r'; // carriage return
      return ''; // remove other control characters
    });
}

function reconstructJSON(text: string): AnalyzedContent {
  // This is a last-resort parser that tries to extract valid JSON structure
  // even from malformed responses
  
  try {
    // Try to find arrays and objects manually
    const relevantQuotesMatch = text.match(/"relevantQuotes"\s*:\s*\[([\s\S]*?)\]/);
    const painPointsMatch = text.match(/"painPoints"\s*:\s*\[([\s\S]*?)\]/);
    const keyInsightsMatch = text.match(/"keyInsights"\s*:\s*\[([\s\S]*?)\]/);
    const overallSentimentMatch = text.match(/"overallSentiment"\s*:\s*([0-9.]+)/);
    const frustrationLevelMatch = text.match(/"frustrationLevel"\s*:\s*([0-9.]+)/);
    const totalRelevantPostsMatch = text.match(/"totalRelevantPosts"\s*:\s*([0-9]+)/);
    const analysisConfidenceMatch = text.match(/"analysisConfidence"\s*:\s*([0-9.]+)/);
    
    return {
      relevantQuotes: relevantQuotesMatch ? parseQuotesArray(relevantQuotesMatch[1]) : [],
      overallSentiment: overallSentimentMatch ? parseFloat(overallSentimentMatch[1]) : 5,
      painPoints: painPointsMatch ? parseStringArray(painPointsMatch[1]) : ['Unable to extract pain points from AI response'],
      keyInsights: keyInsightsMatch ? parseStringArray(keyInsightsMatch[1]) : ['AI response parsing failed'],
      frustrationLevel: frustrationLevelMatch ? parseFloat(frustrationLevelMatch[1]) : 0.5,
      totalRelevantPosts: totalRelevantPostsMatch ? parseInt(totalRelevantPostsMatch[1]) : 0,
      analysisConfidence: analysisConfidenceMatch ? parseFloat(analysisConfidenceMatch[1]) : 0.3
    };
  } catch (error) {
    // Even manual reconstruction failed - return minimal valid structure
    console.error('Manual JSON reconstruction failed:', error);
    return {
      relevantQuotes: [],
      overallSentiment: 5,
      painPoints: ['Failed to parse AI analysis'],
      keyInsights: ['AI response could not be parsed'],
      frustrationLevel: 0,
      totalRelevantPosts: 0,
      analysisConfidence: 0.1
    };
  }
}

function parseQuotesArray(quotesText: string): AnalyzedContent['relevantQuotes'] {
  try {
    // Try to extract individual quote objects
    const quoteMatches = quotesText.match(/\{[^}]*\}/g) || [];
    return quoteMatches.map(quoteText => {
      try {
        return JSON.parse(quoteText);
      } catch {
        // Extract manually if JSON parse fails
        return {
          quote: extractValue(quoteText, 'quote') || 'Unable to extract quote',
          author: extractValue(quoteText, 'author') || 'unknown',
          subreddit: extractValue(quoteText, 'subreddit') || 'unknown',
          upvotes: parseInt(extractValue(quoteText, 'upvotes') || '0'),
          url: extractValue(quoteText, 'url') || '#',
          sentiment: (extractValue(quoteText, 'sentiment') as any) || 'neutral',
          relevanceScore: parseFloat(extractValue(quoteText, 'relevanceScore') || '0.5'),
          painPointCategory: extractValue(quoteText, 'painPointCategory') || 'general',
          sentimentConfidence: parseFloat(extractValue(quoteText, 'sentimentConfidence') || '0.5')
        };
      }
    }).filter(quote => quote.quote && quote.quote !== 'Unable to extract quote');
  } catch {
    return [];
  }
}

function parseStringArray(arrayText: string): string[] {
  try {
    return JSON.parse(`[${arrayText}]`);
  } catch {
    // Try to extract strings manually
    const stringMatches = arrayText.match(/"([^"]+)"/g) || [];
    return stringMatches.map(match => match.slice(1, -1));
  }
}

function extractValue(text: string, key: string): string | null {
  const match = text.match(new RegExp(`"${key}"\\s*:\\s*"([^"]*)"`, 'i'));
  return match ? match[1] : null;
}

export async function analyzeRedditContent(
  posts: RedditPost[],
  refinedIdea: {
    oneLiner: string;
    targetAudience: string;
    problem: string;
  }
): Promise<AnalyzedContent> {
  
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  if (posts.length === 0) {
    return {
      relevantQuotes: [],
      overallSentiment: 5,
      painPoints: ['No relevant discussions found'],
      keyInsights: ['Insufficient data for analysis'],
      frustrationLevel: 0,
      totalRelevantPosts: 0,
      analysisConfidence: 0
    };
  }

  console.log(`🤖 Analyzing ${posts.length} Reddit posts with AI...`);

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  // Prepare posts data for AI analysis - include FULL content so AI sees what people actually say
  const postsForAnalysis = posts.slice(0, 30).map(post => ({
    title: post.title,
    content: post.content, // Keep FULL content so AI sees real discussions
    subreddit: post.subreddit,
    upvotes: post.upvotes,
    author: post.author,
    url: post.url,
    comments: post.comments?.map(c => c.body).join(' | ') || '' // Include comment content too
  }));

  const prompt = `You are analyzing Reddit discussions to validate a startup idea. You must be completely objective and avoid positive bias.

STARTUP IDEA: "${refinedIdea.oneLiner}"
TARGET AUDIENCE: "${refinedIdea.targetAudience}"
PROBLEM BEING SOLVED: "${refinedIdea.problem}"

Below are ${postsForAnalysis.length} Reddit posts from relevant communities. Analyze them objectively to understand:
1. How relevant each post is to this startup idea (be strict - only include truly relevant content)
2. The actual sentiment of people discussing this problem space (don't assume problems exist)
3. What specific pain points people are expressing (only real, explicit pain points)
4. Whether there's genuine demand for this solution (be skeptical)

REDDIT POSTS TO ANALYZE:
${postsForAnalysis.map((post, i) => `
POST ${i + 1}:
Title: ${post.title}
Content: ${post.content}
Comments: ${post.comments}
Subreddit: r/${post.subreddit}
Upvotes: ${post.upvotes}
Author: ${post.author}
---`).join('\n')}

CRITICAL BIAS-PREVENTION INSTRUCTIONS:
- DO NOT assume frustration exists where it's not explicitly stated
- DO NOT interpret neutral statements as frustrated
- BE STRICT about relevance - only include posts directly about this specific problem
- PREFER neutral/satisfied sentiment when unclear
- ONLY mark as "frustrated" when users explicitly express anger, annoyance, or strong dissatisfaction
- MARK as "satisfied" when users mention working solutions or positive experiences
- MARK as "neutral" for informational posts, questions, or mild concerns

SENTIMENT CRITERIA:
- "frustrated": Contains explicit negative emotions ("hate", "terrible", "nightmare", "driving me crazy", "so annoying")
- "satisfied": Contains positive language ("works great", "love", "perfect", "solved my problem")
- "neutral": Everything else (questions, information sharing, mild concerns, general discussion)

RELEVANCE CRITERIA:
- 1.0: Post is EXACTLY about this specific problem/solution
- 0.8: Post mentions this problem as a significant issue
- 0.6: Post touches on this problem area
- 0.4 or below: Not truly relevant (exclude these)

IMPORTANT: Respond with ONLY valid JSON in this exact format:

{
  "relevantQuotes": [
    {
      "quote": "exact text from a post that's relevant to the startup idea",
      "author": "reddit_username",
      "subreddit": "subreddit_name", 
      "upvotes": 0,
      "url": "post_url",
      "sentiment": "frustrated|neutral|satisfied",
      "relevanceScore": 0.8,
      "painPointCategory": "brief category like 'finding reliable contractors'",
      "sentimentConfidence": 0.9
    }
  ],
  "overallSentiment": 4.2,
  "painPoints": ["specific pain point 1", "specific pain point 2"],
  "keyInsights": ["insight about market demand", "insight about user behavior"],
  "frustrationLevel": 0.6,
  "totalRelevantPosts": 15,
  "analysisConfidence": 0.8
}

Guidelines:
- ONLY include quotes from posts/comments that directly relate to the startup problem (relevanceScore >= 0.6)
- Extract the EXACT text from Reddit posts/comments (not summaries)
- Sentiment scale: 1-10 (1=very frustrated, 10=very satisfied). Use 5-6 for neutral content.
- Relevance score: 0-1 (1=highly relevant to the specific startup idea)
- Extract 5-15 most relevant quotes maximum (be selective)
- Focus ONLY on posts that show explicit problems, real user pain points, or actual experiences
- Include what people are ACTUALLY saying about this problem space
- If fewer than 3 posts are truly relevant to the startup idea, return small arrays
- sentimentConfidence: 0-1 (how confident you are in the sentiment classification)
- analysisConfidence: 0-1 (overall confidence in the analysis quality)`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();

    console.log('🤖 AI content analysis response length:', aiText.length);
    console.log('🤖 AI response preview:', aiText.substring(0, 500) + '...');

    // Parse the JSON response with robust error handling
    let analysis: AnalyzedContent;
    try {
      analysis = parseAIResponse(aiText);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('🔍 AI response around position 504:', aiText.substring(480, 550));
      console.error('📝 Full AI response for debugging:', aiText);
      
      // Save the problematic response for debugging
      console.log('💾 Saving problematic AI response for analysis...');
      
      throw new Error(`Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
    }

    // Validate the response structure
    if (!analysis.relevantQuotes || !Array.isArray(analysis.relevantQuotes)) {
      throw new Error('Invalid AI response: missing relevantQuotes array');
    }

    if (typeof analysis.overallSentiment !== 'number' || !Array.isArray(analysis.painPoints)) {
      throw new Error('Invalid AI response: missing required fields');
    }

    // Add default confidence if missing
    if (typeof analysis.analysisConfidence !== 'number') {
      analysis.analysisConfidence = 0.5; // Default medium confidence
    }

    // Add sentiment confidence to quotes if missing
    analysis.relevantQuotes = analysis.relevantQuotes.map(quote => {
      if (typeof quote.sentimentConfidence !== 'number') {
        quote.sentimentConfidence = 0.7; // Default confidence
      }
      return quote;
    });

    // Validate sentiment confidence - flag low confidence analysis
    const lowConfidenceQuotes = analysis.relevantQuotes.filter(q => q.sentimentConfidence < 0.6);
    if (lowConfidenceQuotes.length > analysis.relevantQuotes.length * 0.5) {
      console.warn('⚠️ Low sentiment confidence detected in over 50% of quotes');
      analysis.analysisConfidence = Math.min(analysis.analysisConfidence, 0.6);
    }

    // Add URLs from original posts if not provided
    analysis.relevantQuotes = analysis.relevantQuotes.map(quote => {
      if (!quote.url) {
        const originalPost = postsForAnalysis.find(p => 
          p.author === quote.author || p.title.includes(quote.quote.substring(0, 50))
        );
        quote.url = originalPost?.url || '#';
      }
      return quote;
    });

    console.log(`✅ AI analyzed content: ${analysis.relevantQuotes.length} relevant quotes, ${analysis.totalRelevantPosts} relevant posts`);

    return analysis;

  } catch (error) {
    console.error('❌ AI content analysis failed:', error);
    
    // NO FALLBACK - throw error so you know it's broken
    throw new Error(`AI content analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}