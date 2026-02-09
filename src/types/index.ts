// User Profile
export interface UserProfile {
  id: number;
  name: string | null;
  skills: string[];
  technologies: string[];
  projects: Project[];
  interests: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  name: string;
  description: string;
  techStack: string[];
}

// Briefing
export interface BriefingContent {
  summary: string;
  sections: {
    newTechnologies: BriefingSection<TechItem>;
    techNews: BriefingSection<NewsItem>;
    projectIdeas: BriefingSection<IdeaItem>;
  };
  generatedAt: string;
}

export interface BriefingSection<T> {
  title: string;
  items: T[];
}

export interface TechItem {
  name: string;
  description: string;
  relevance: string;
  url: string;
}

export interface NewsItem {
  headline: string;
  summary: string;
  source: string;
  url: string;
  relevance: string;
}

export interface IdeaItem {
  project: string;
  suggestion: string;
  rationale: string;
  resources: string[];
}

export interface Briefing {
  id: number;
  date: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  content: BriefingContent | null;
  rawSearchResults: string | null;
  aiProvider: string | null;
  aiModel: string | null;
  tokenUsage: { input: number; output: number } | null;
  generationTimeMs: number | null;
  createdAt: string;
  error: string | null;
}

// Search
export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score?: number;
  source: 'tavily' | 'hackernews' | 'devto';
}

// AI Provider
export interface TokenUsage {
  input: number;
  output: number;
}

export interface AIGenerationResult {
  text: string;
  model: string;
  usage: TokenUsage;
}

export interface AIProvider {
  generate(systemPrompt: string, userPrompt: string): Promise<AIGenerationResult>;
}
