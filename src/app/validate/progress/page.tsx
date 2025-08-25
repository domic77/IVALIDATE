'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ValidationLayout } from '@/components/layouts/ValidationLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface ValidationStatus {
  validationId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  currentStep: string;
  estimatedTimeRemaining?: number;
  errorMessage?: string;
  completedAt?: string;
}

export default function ProgressPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const validationId = searchParams?.get('id');
  
  const [status, setStatus] = useState<ValidationStatus | null>(null);
  const [loading, setLoading] = useState(false); // Start as false - show page immediately
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    if (!validationId) {
      setError('No validation ID provided');
      return;
    }

    // Set initial status immediately to show progress page
    setStatus({
      validationId,
      status: 'PENDING',
      progress: 0,
      currentStep: 'Starting validation...',
    });

    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/validate/status?id=${validationId}`);
        const data = await response.json();

        if (!data.success) {
          setError(data.message || 'Failed to fetch validation status');
          return;
        }

        setStatus(data.data);

        // If completed, show success message and redirect after delay
        if (data.data.status === 'COMPLETED') {
          toast.success('Validation completed!', {
            description: 'Your startup idea analysis is ready.',
          });
          
          setTimeout(() => {
            router.push(`/dashboard/${validationId}`);
          }, 2000);
        }

        // If failed, show error message
        if (data.data.status === 'FAILED') {
          toast.error('Validation failed', {
            description: data.data.errorMessage || 'An error occurred during analysis.',
          });
        }

      } catch (err) {
        setError('Failed to connect to validation service');
        console.error('Status fetch error:', err);
      }
    };

    // Fetch initial status immediately (but don't block page display)
    fetchStatus();
    
    // Poll for updates every 3 seconds if still processing
    const interval = setInterval(() => {
      if (status?.status === 'PROCESSING' || status?.status === 'PENDING') {
        fetchStatus();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [validationId, router, status?.status]);

  // Timer effect to track elapsed time
  useEffect(() => {
    if (status?.status === 'PROCESSING' || status?.status === 'PENDING') {
      const timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedSeconds(elapsed);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [startTime, status?.status]);

  // Format elapsed time for display
  const formatElapsedTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    }
  };

  if (loading) {
    return (
      <ValidationLayout>
        <div className="h-full bg-gray-100 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-700">Loading validation status...</span>
          </div>
        </div>
      </ValidationLayout>
    );
  }

  if (error || !validationId) {
    return (
      <ValidationLayout>
        <div className="h-full bg-gray-100 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="text-center p-6 bg-white rounded-lg border-2 border-red-200">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
              <p className="text-gray-600 mb-6">{error || 'Invalid validation ID'}</p>
              <Button 
                onClick={() => router.push('/')} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Start New Validation
              </Button>
            </div>
          </div>
        </div>
      </ValidationLayout>
    );
  }

  return (
    <ValidationLayout>
      <div className="h-full bg-gray-100 overflow-y-auto">
        <div className="flex items-center justify-center p-6 min-h-full">
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-8">
              <div className="text-center mb-6">
                {status?.status === 'COMPLETED' ? (
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                ) : status?.status === 'FAILED' ? (
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                ) : (
                  <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
                )}
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {status?.status === 'COMPLETED' && 'Analysis Complete!'}
                  {status?.status === 'FAILED' && 'Analysis Failed'}
                  {(status?.status === 'PROCESSING' || status?.status === 'PENDING') && 'Analyzing Your Idea'}
                </h2>
                
                <p className="text-gray-600 text-lg">
                  {status?.currentStep || 'Preparing analysis...'}
                </p>
              </div>
              
              <div className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Progress</span>
                    <span>{status?.progress || 0}%</span>
                  </div>
                  <Progress value={status?.progress || 0} className="h-3" />
                </div>

                {/* Running Timer */}
                {(status?.status === 'PROCESSING' || status?.status === 'PENDING') && (
                  <div className="text-center text-sm text-gray-600">
                    Validating for: <span className="font-mono font-medium text-blue-600">{formatElapsedTime(elapsedSeconds)}</span>
                  </div>
                )}

                {/* Error Message */}
                {status?.status === 'FAILED' && status.errorMessage && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">{status.errorMessage}</p>
                  </div>
                )}

                {/* Completion Actions */}
                {status?.status === 'COMPLETED' && (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={() => router.push(`/dashboard/${validationId}`)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      View Results
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button 
                      onClick={() => router.push('/')}
                      variant="outline"
                      className="border-gray-300 hover:bg-gray-100"
                    >
                      Validate Another Idea
                    </Button>
                  </div>
                )}

                {/* Retry for Failed */}
                {status?.status === 'FAILED' && (
                  <div className="flex justify-center">
                    <Button 
                      onClick={() => router.push('/')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Start New Validation
                    </Button>
                  </div>
                )}

                {/* What's Happening */}
                {(status?.status === 'PROCESSING' || status?.status === 'PENDING') && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">What&apos;s happening:</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>🔍 Searching social discussions for market sentiment</li>
                      <li>🤖 Running AI analysis on collected insights</li>
                      <li>📊 Calculating your validation score</li>
                      <li>🎯 Building comprehensive market report</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ValidationLayout>
  );
}