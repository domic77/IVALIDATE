import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    console.log('🔑 Testing Gemini API...');
    console.log('📝 API Key available:', !!process.env.GEMINI_API_KEY);
    console.log('🆔 API Key prefix:', process.env.GEMINI_API_KEY?.substring(0, 10) + '...');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = 'Return only this JSON: {"test": "success", "message": "API is working"}';
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('✅ Raw API response:', text);
    
    return NextResponse.json({
      success: true,
      apiKeyPresent: !!process.env.GEMINI_API_KEY,
      apiKeyPrefix: process.env.GEMINI_API_KEY?.substring(0, 10) + '...',
      rawResponse: text,
      parsedResponse: JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?$/g, '').trim())
    });
    
  } catch (error) {
    console.error('❌ Gemini test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      apiKeyPresent: !!process.env.GEMINI_API_KEY,
      apiKeyPrefix: process.env.GEMINI_API_KEY?.substring(0, 10) + '...',
    }, { status: 500 });
  }
}