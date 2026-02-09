'use client';

import { useState } from 'react';
import type { TechItem, NewsItem, IdeaItem } from '@/types';

interface BriefingCardProps {
  title: string;
  items: TechItem[] | NewsItem[] | IdeaItem[];
  type: 'tech' | 'news' | 'idea';
  defaultExpanded?: boolean;
}

export default function BriefingCard({ title, items, type, defaultExpanded = true }: BriefingCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full">
            {items.length}
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${
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
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="pb-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 last:pb-0"
            >
              {type === 'tech' && renderTechItem(item as TechItem)}
              {type === 'news' && renderNewsItem(item as NewsItem)}
              {type === 'idea' && renderIdeaItem(item as IdeaItem)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function renderTechItem(item: TechItem) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {item.name}
        </h3>
        <span className="shrink-0 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded">
          Relevant
        </span>
      </div>
      <p className="text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
        {item.description}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 italic">
        {item.relevance}
      </p>
      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Learn more
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      )}
    </div>
  );
}

function renderNewsItem(item: NewsItem) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {item.headline}
        </h3>
        <span className="shrink-0 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded">
          Relevant
        </span>
      </div>
      <p className="text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
        {item.summary}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 italic">
        {item.relevance}
      </p>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Source: {item.source}
        </span>
        {item.url && (
          <>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Read full article
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </>
        )}
      </div>
    </div>
  );
}

function renderIdeaItem(item: IdeaItem) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {item.project}
      </h3>
      <p className="text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
        {item.suggestion}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 italic">
        {item.rationale}
      </p>
      {item.resources && item.resources.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Resources:
          </p>
          <ul className="space-y-1">
            {item.resources.map((resource, idx) => (
              <li key={idx}>
                <a
                  href={resource}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {resource}
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
