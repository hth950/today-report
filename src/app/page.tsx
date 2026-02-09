'use client';

import { useState, useEffect } from 'react';
import type { Briefing } from '@/types';
import BriefingCard from '@/components/BriefingCard';
import GenerateButton from '@/components/GenerateButton';

export default function Home() {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTodaysBriefing();
  }, []);

  useEffect(() => {
    // Auto-refresh while generating
    if (briefing?.status === 'generating') {
      const interval = setInterval(() => {
        loadTodaysBriefing();
      }, 10000); // Check every 10 seconds

      return () => clearInterval(interval);
    }
  }, [briefing?.status]);

  const loadTodaysBriefing = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/briefings?date=${today}`);

      if (!response.ok) {
        throw new Error('Failed to load briefing');
      }

      const data = await response.json();
      setBriefing(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load briefing');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSuccess = () => {
    // Refresh immediately to show generating status
    loadTodaysBriefing();
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading today&apos;s briefing...</p>
        </div>
      </div>
    );
  }

  if (error && !briefing) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center max-w-md">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={loadTodaysBriefing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Status: Generating
  if (briefing?.status === 'generating') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Generating Your Briefing
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            This usually takes 30-60 seconds. Your briefing will appear automatically when ready.
          </p>
        </div>
      </div>
    );
  }

  // Status: Failed
  if (briefing?.status === 'failed') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <svg
              className="w-16 h-16 text-red-500 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Generation Failed
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {briefing.error || 'An error occurred while generating your briefing.'}
          </p>
          <GenerateButton force onSuccess={handleGenerateSuccess}>
            Retry Generation
          </GenerateButton>
        </div>
      </div>
    );
  }

  // Status: No briefing yet
  if (!briefing || briefing.status === 'pending') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Good Morning!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Ready for your personalized tech briefing?
          </p>
          <GenerateButton onSuccess={handleGenerateSuccess} />
        </div>
      </div>
    );
  }

  // Status: Completed - Show the briefing
  const { content } = briefing;
  if (!content) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">No content available</p>
        </div>
      </div>
    );
  }

  const briefingDate = new Date(briefing.date);
  const formattedDate = briefingDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
            {formattedDate}
          </p>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Today&apos;s Tech Briefing
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            {content.summary}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {/* New Technologies */}
          {content.sections.newTechnologies.items.length > 0 && (
            <BriefingCard
              title={content.sections.newTechnologies.title}
              items={content.sections.newTechnologies.items}
              type="tech"
            />
          )}

          {/* Tech News */}
          {content.sections.techNews.items.length > 0 && (
            <BriefingCard
              title={content.sections.techNews.title}
              items={content.sections.techNews.items}
              type="news"
            />
          )}

          {/* Project Ideas */}
          {content.sections.projectIdeas.items.length > 0 && (
            <BriefingCard
              title={content.sections.projectIdeas.title}
              items={content.sections.projectIdeas.items}
              type="idea"
            />
          )}
        </div>

        {/* Metadata Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span className="font-medium">Generated by:</span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                {briefing.aiProvider} ({briefing.aiModel})
              </span>
            </div>
            {briefing.generationTimeMs && (
              <>
                <span>•</span>
                <span>Generated in {(briefing.generationTimeMs / 1000).toFixed(1)}s</span>
              </>
            )}
            <span>•</span>
            <span>
              {new Date(content.generatedAt).toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Regenerate Button */}
        <div className="mt-6 text-center">
          <GenerateButton
            force
            onSuccess={handleGenerateSuccess}
            className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            Regenerate Briefing
          </GenerateButton>
        </div>
      </div>
    </div>
  );
}
