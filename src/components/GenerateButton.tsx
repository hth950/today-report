'use client';

import { useState } from 'react';

interface GenerateButtonProps {
  onSuccess?: () => void;
  force?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function GenerateButton({
  onSuccess,
  force = false,
  className = '',
  children = 'Generate Briefing'
}: GenerateButtonProps) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError(null);

      const url = force ? '/api/generate?force=true' : '/api/generate';
      const response = await fetch(url, { method: 'POST' });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate briefing');
      }

      // Success
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate briefing';
      setError(message);
      console.error(err);

      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleGenerate}
        disabled={generating}
        className={`inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all ${
          generating
            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md hover:shadow-lg'
        } text-white ${className}`}
      >
        {generating && (
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {generating ? 'Generating...' : children}
      </button>

      {error && (
        <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
