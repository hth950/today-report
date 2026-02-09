'use client';

import { useState, useEffect } from 'react';
import type { Briefing } from '@/types';
import BriefingCard from '@/components/BriefingCard';

export default function HistoryPage() {
  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    loadBriefings();
  }, []);

  const loadBriefings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/briefings?limit=30');

      if (!response.ok) {
        throw new Error('Failed to load briefings');
      }

      const data = await response.json();
      setBriefings(data.briefings);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load briefings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">히스토리를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center max-w-md">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={loadBriefings}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (briefings.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center max-w-md">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            아직 브리핑이 없습니다
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            오늘 페이지에서 첫 브리핑을 생성해보세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            브리핑 히스토리
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            총 {briefings.length}개의 브리핑
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {briefings.map((briefing) => {
            const isExpanded = expandedId === briefing.id;
            const briefingDate = new Date(briefing.date);
            const formattedDate = briefingDate.toLocaleDateString('ko-KR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <div
                key={briefing.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : briefing.id)}
                  className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {formattedDate}
                        </h3>
                        <StatusBadge status={briefing.status} />
                      </div>
                      {briefing.status === 'completed' && briefing.content && (
                        <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                          {briefing.content.summary}
                        </p>
                      )}
                      {briefing.status === 'failed' && briefing.error && (
                        <p className="text-red-600 dark:text-red-400 text-sm">
                          오류: {briefing.error}
                        </p>
                      )}
                      {briefing.status === 'generating' && (
                        <p className="text-blue-600 dark:text-blue-400 text-sm">
                          생성 중...
                        </p>
                      )}
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-500 shrink-0 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && briefing.status === 'completed' && briefing.content && (
                  <div className="px-6 pb-6 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    {/* New Technologies */}
                    {briefing.content.sections.newTechnologies.items.length > 0 && (
                      <BriefingCard
                        title={briefing.content.sections.newTechnologies.title}
                        items={briefing.content.sections.newTechnologies.items}
                        type="tech"
                        defaultExpanded={false}
                      />
                    )}

                    {/* Tech News */}
                    {briefing.content.sections.techNews.items.length > 0 && (
                      <BriefingCard
                        title={briefing.content.sections.techNews.title}
                        items={briefing.content.sections.techNews.items}
                        type="news"
                        defaultExpanded={false}
                      />
                    )}

                    {/* Project Ideas */}
                    {briefing.content.sections.projectIdeas.items.length > 0 && (
                      <BriefingCard
                        title={briefing.content.sections.projectIdeas.title}
                        items={briefing.content.sections.projectIdeas.items}
                        type="idea"
                        defaultExpanded={false}
                      />
                    )}

                    {/* Metadata */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">생성:</span>
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                            {briefing.aiProvider} ({briefing.aiModel})
                          </span>
                        </div>
                        {briefing.generationTimeMs && (
                          <>
                            <span>•</span>
                            <span>{(briefing.generationTimeMs / 1000).toFixed(1)}초 소요</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Briefing['status'] }) {
  const styles = {
    completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    failed: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    generating: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    pending: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  };

  const labels = {
    completed: '완료',
    failed: '실패',
    generating: '생성 중',
    pending: '대기 중',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
