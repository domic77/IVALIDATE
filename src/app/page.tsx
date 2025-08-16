'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ValidationLayout } from '@/components/layouts/ValidationLayout';
import IdeaForm from '@/components/validation/IdeaForm';
import { IdeaFormData } from '@/types/ui';
import { generateValidationId } from '@/lib/utils';
import { toast } from 'sonner';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleIdeaSubmit = async (formData: IdeaFormData) => {
    setLoading(true);
    
    try {
      // Generate validation ID
      const validationId = generateValidationId();
      
      // Start validation process
      const response = await fetch('/api/validate/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          validationId,
          idea: formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start validation');
      }

      await response.json();
      
      // Show success message
      toast.success('Validation started!', {
        description: 'Your idea is being analyzed. Results will appear shortly.',
      });

      // Redirect to progress page
      router.push(`/validate/progress?id=${validationId}`);
      
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Failed to start validation', {
        description: 'Please try again or contact support if the problem persists.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ValidationLayout>
      <div className="h-full bg-gray-100 overflow-y-auto">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-full">
          <div className="w-full max-w-3xl text-center">
            
            {/* Welcome Message */}
            <div className="mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Validate Your Startup Idea
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Get AI-powered insights with real market data in minutes
              </p>
            </div>

            {/* Main Form Section */}
            <IdeaForm onSubmit={handleIdeaSubmit} loading={loading} />
            
          </div>
        </div>
      </div>
    </ValidationLayout>
  );
}
