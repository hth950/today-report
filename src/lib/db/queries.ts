import { getDb } from './index';
import type { UserProfile, Briefing, BriefingContent } from '@/types';

// Profile queries
export function getProfile(): UserProfile {
  const db = getDb();
  const row = db.prepare('SELECT * FROM user_profile WHERE id = 1').get() as Record<string, unknown>;
  return {
    id: row.id as number,
    name: row.name as string | null,
    skills: JSON.parse(row.skills as string),
    technologies: JSON.parse(row.technologies as string),
    projects: JSON.parse(row.projects as string),
    interests: JSON.parse(row.interests as string),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function updateProfile(profile: Partial<Pick<UserProfile, 'name' | 'skills' | 'technologies' | 'projects' | 'interests'>>): UserProfile {
  const db = getDb();
  const current = getProfile();

  const updated = {
    name: profile.name ?? current.name,
    skills: JSON.stringify(profile.skills ?? current.skills),
    technologies: JSON.stringify(profile.technologies ?? current.technologies),
    projects: JSON.stringify(profile.projects ?? current.projects),
    interests: JSON.stringify(profile.interests ?? current.interests),
  };

  db.prepare(`
    UPDATE user_profile
    SET name = ?, skills = ?, technologies = ?, projects = ?, interests = ?, updated_at = datetime('now')
    WHERE id = 1
  `).run(updated.name, updated.skills, updated.technologies, updated.projects, updated.interests);

  return getProfile();
}

// Briefing queries
export function getBriefingByDate(date: string): Briefing | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM briefings WHERE date = ?').get(date) as Record<string, unknown> | undefined;
  if (!row) return null;
  return mapBriefingRow(row);
}

export function getLatestBriefing(): Briefing | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM briefings ORDER BY date DESC LIMIT 1').get() as Record<string, unknown> | undefined;
  if (!row) return null;
  return mapBriefingRow(row);
}

export function listBriefings(limit = 30, offset = 0): Briefing[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM briefings ORDER BY date DESC LIMIT ? OFFSET ?').all(limit, offset) as Record<string, unknown>[];
  return rows.map(mapBriefingRow);
}

export function createBriefing(date: string): Briefing {
  const db = getDb();
  db.prepare('INSERT OR IGNORE INTO briefings (date, status) VALUES (?, ?)').run(date, 'pending');
  return getBriefingByDate(date)!;
}

export function updateBriefingStatus(date: string, status: Briefing['status'], data?: {
  content?: BriefingContent;
  rawSearchResults?: string;
  aiProvider?: string;
  aiModel?: string;
  tokenUsage?: { input: number; output: number };
  generationTimeMs?: number;
  error?: string;
}): void {
  const db = getDb();
  if (data) {
    db.prepare(`
      UPDATE briefings
      SET status = ?, content = ?, raw_search_results = ?, ai_provider = ?,
          ai_model = ?, token_usage = ?, generation_time_ms = ?, error = ?
      WHERE date = ?
    `).run(
      status,
      data.content ? JSON.stringify(data.content) : null,
      data.rawSearchResults || null,
      data.aiProvider || null,
      data.aiModel || null,
      data.tokenUsage ? JSON.stringify(data.tokenUsage) : null,
      data.generationTimeMs || null,
      data.error || null,
      date,
    );
  } else {
    db.prepare('UPDATE briefings SET status = ? WHERE date = ?').run(status, date);
  }
}

function mapBriefingRow(row: Record<string, unknown>): Briefing {
  return {
    id: row.id as number,
    date: row.date as string,
    status: row.status as Briefing['status'],
    content: row.content ? JSON.parse(row.content as string) : null,
    rawSearchResults: row.raw_search_results as string | null,
    aiProvider: row.ai_provider as string | null,
    aiModel: row.ai_model as string | null,
    tokenUsage: row.token_usage ? JSON.parse(row.token_usage as string) : null,
    generationTimeMs: row.generation_time_ms as number | null,
    createdAt: row.created_at as string,
    error: row.error as string | null,
  };
}
