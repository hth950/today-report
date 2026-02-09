import type { UserProfile, SearchResult } from '@/types';

export function buildSystemPrompt(): string {
  return `You are a personal tech briefing curator. Your job is to analyze search results and create a personalized daily tech briefing for a developer.

Write all content in Korean (한국어).

Output ONLY valid JSON matching this exact schema (no markdown, no code fences, no extra text):
{
  "summary": "2-3 sentence overview of today's briefing",
  "sections": {
    "newTechnologies": {
      "title": "새로운 기술 & 업데이트",
      "items": [
        {
          "name": "Technology name",
          "description": "Brief description of the technology or update",
          "relevance": "Why this matters for the user specifically",
          "url": "Source URL from the provided search results"
        }
      ]
    },
    "techNews": {
      "title": "기술 뉴스",
      "items": [
        {
          "headline": "News headline",
          "summary": "2-3 sentence summary",
          "source": "Source name",
          "url": "Source URL from the provided search results",
          "relevance": "Why this matters for the user"
        }
      ]
    },
    "projectIdeas": {
      "title": "프로젝트 아이디어 & 개선사항",
      "items": [
        {
          "project": "Which user project this relates to",
          "suggestion": "Specific actionable suggestion",
          "rationale": "Why this would improve the project",
          "resources": ["URL1", "URL2"]
        }
      ]
    }
  },
  "generatedAt": "ISO timestamp"
}

Rules:
- Include 3-5 items per section
- ONLY cite URLs that appear in the provided search results - never make up URLs
- Focus on practical relevance to the user's specific skills and projects
- Keep each item concise (2-3 sentences max)
- If search results are limited, focus on quality over quantity
- Always return valid JSON
- Write all content in Korean (한국어)`;
}

export function buildUserPrompt(profile: UserProfile, searchResults: SearchResult[], date: string): string {
  const profileSection = `## My Profile
- **Skills**: ${profile.skills.join(', ') || 'Not specified'}
- **Technologies**: ${profile.technologies.join(', ') || 'Not specified'}
- **Interests**: ${profile.interests.join(', ') || 'Not specified'}
- **Projects**:
${profile.projects.map(p => `  - ${p.name}: ${p.description} (Tech: ${p.techStack.join(', ')})`).join('\n') || '  None specified'}`;

  const searchSection = `## Today's Search Results (${date})
${searchResults.map((r, i) => `### Result ${i + 1}: ${r.title}
Source: ${r.source} | URL: ${r.url}
${r.content}
`).join('\n')}`;

  return `${profileSection}

${searchSection}

Generate my personalized daily tech briefing for ${date}. Focus on what's most relevant to my skills, technologies, and current projects. Set generatedAt to "${new Date().toISOString()}".`;
}
