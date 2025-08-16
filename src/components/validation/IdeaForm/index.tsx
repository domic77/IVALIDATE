'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Lightbulb, Target, Building, Sparkles, Users, CheckCircle, X, Search } from 'lucide-react';
import { IdeaFormProps, IdeaFormData } from '@/types/ui';

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'E-commerce',
  'SaaS',
  'Mobile Apps',
  'AI/ML',
  'Food & Beverage',
  'Travel',
  'Real Estate',
  'Fitness',
  'Entertainment',
  'B2B Services',
  'Consumer Products',
  'Other'
];

const TARGET_MARKETS = [
  'Consumers (B2C)',
  'Small Businesses',
  'Enterprise (B2B)',
  'Startups',
  'Developers',
  'Students',
  'Professionals',
  'Seniors',
  'Parents',
  'Millennials',
  'Gen Z',
  'Global',
  'US Market',
  'European Market',
  'Asian Market',
  'Other'
];

interface RefinedIdea {
  oneLiner: string;
  targetAudience: string;
  problem: string;
}

export default function IdeaForm({ onSubmit, loading = false, disabled = false }: IdeaFormProps) {
  const [formData, setFormData] = useState<IdeaFormData>({
    description: '',
    industry: '',
    targetMarket: ''
  });
  
  const [errors, setErrors] = useState<Partial<IdeaFormData>>({});
  
  // Refinement state
  const [refinedIdea, setRefinedIdea] = useState<RefinedIdea | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [refinementError, setRefinementError] = useState<string | null>(null);
  const [showRefinement, setShowRefinement] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<IdeaFormData> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Please describe your startup idea';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Please provide more details (at least 10 characters)';
    } else if (formData.description.trim().length > 2000) {
      newErrors.description = 'Description is too long (max 2000 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Refine idea with AI
  const handleRefineIdea = async () => {
    if (!formData.description.trim() || formData.description.length < 10) {
      setRefinementError('Please enter at least 10 characters for your idea');
      return;
    }

    setIsRefining(true);
    setRefinementError(null);

    try {
      const response = await fetch('/api/refine-idea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea: formData.description.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 503) {
          setRefinementError(`${data.details || 'AI service temporarily overloaded'} Please wait a minute and try again.`);
        } else {
          setRefinementError(data.error || 'Failed to refine idea');
        }
        return;
      }

      setRefinedIdea(data);
      setShowRefinement(true);
    } catch (err) {
      setRefinementError('Network error. Please try again.');
      console.error('Refinement error:', err);
    } finally {
      setIsRefining(false);
    }
  };

  // Handle user's decision on refined idea
  const handleRefinementDecision = async (accepted: boolean) => {
    if (accepted) {
      // User accepts the refined idea - proceed with validation
      const submitData = {
        description: `${refinedIdea!.oneLiner}\n\nTarget Audience: ${refinedIdea!.targetAudience}\n\nProblem Solved: ${refinedIdea!.problem}`,
        industry: 'AI Generated',
        targetMarket: refinedIdea!.targetAudience,
        refinedIdeaData: {
          oneLiner: refinedIdea!.oneLiner,
          targetAudience: refinedIdea!.targetAudience,
          problem: refinedIdea!.problem
        }
      };
      onSubmit(submitData);
    } else {
      // User rejects - just reset to allow manual refinement
      setShowRefinement(false);
      setRefinedIdea(null);
      setRefinementError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Start with idea refinement instead of direct submission
    if (!showRefinement) {
      handleRefineIdea();
    }
  };

  const handleInputChange = (field: keyof IdeaFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Temporarily simplified validation for MVP testing
  const isFormValid = formData.description.trim().length >= 10; // Just need some text for now

  // Debug logging removed to prevent hydration mismatch

  return (
    <div className="w-full max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-6">
          {/* Refined Idea Display - Above text input */}
          {showRefinement && refinedIdea && (
            <div className="space-y-4">
              <Card className="border-2 border-blue-200 bg-blue-50 rounded-lg">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 rounded-full bg-blue-100">
                      <Sparkles className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-blue-900">
                    ✨ Refined Idea
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    Review your refined idea and start validation
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="p-4 bg-white border border-blue-200 rounded-lg text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-blue-600" />
                      <h4 className="font-semibold text-blue-900">Refined Idea</h4>
                    </div>
                    <p className="text-gray-700">{refinedIdea.oneLiner}</p>
                  </div>

                  <div className="p-4 bg-white border border-blue-200 rounded-lg text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <h4 className="font-semibold text-blue-900">Target Audience</h4>
                    </div>
                    <p className="text-gray-700">{refinedIdea.targetAudience}</p>
                  </div>

                  <div className="p-4 bg-white border border-blue-200 rounded-lg text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <h4 className="font-semibold text-blue-900">Problem Solved</h4>
                    </div>
                    <p className="text-gray-700">{refinedIdea.problem}</p>
                  </div>

                  {/* Decision Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => handleRefinementDecision(true)}
                      className="flex-1 h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                      disabled={loading}
                    >
                      <Search className="w-5 h-5 mr-2" />
                      Start Full Validation
                    </Button>
                    
                    <Button
                      onClick={() => handleRefinementDecision(false)}
                      variant="outline"
                      className="flex-1 h-12 text-base font-semibold border-blue-300 text-blue-700 hover:bg-blue-100 rounded-lg"
                      disabled={loading}
                    >
                      <X className="w-5 h-5 mr-2" />
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Refinement Error */}
          {refinementError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{refinementError}</p>
            </div>
          )}

          {/* Input Section - Match ValidationInterface */}
          <div className="space-y-4">
            <div className="relative">
              <Textarea
                id="description"
                placeholder="Describe your startup idea here..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`min-h-[120px] h-[120px] text-lg resize-none rounded-lg border-2 border-gray-300 hover:border-gray-600 focus:border-blue-500 bg-white transition-all duration-200 hover:scale-[1.02] overflow-y-auto ${errors.description ? 'border-red-500 hover:border-red-500' : ''}`}
                maxLength={2000}
                disabled={disabled || loading || isRefining}
              />
            </div>
            
            {/* Error message and character count */}
            {(errors.description || formData.description.length > 0) && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>{errors.description && <span className="text-red-500">{errors.description}</span>}</span>
                <span>{formData.description.length}/2000</span>
              </div>
            )}

            {/* Submit Button - Outside textarea, same width */}
            <Button
              type="submit"
              disabled={!isFormValid || disabled || loading || isRefining}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 text-base font-semibold border border-blue-700 transition-all duration-200"
            >
              {isRefining ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Refining Your Idea...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Refine My Idea
                </>
              )}
            </Button>
          </div>


        </form>
    </div>
  );
}