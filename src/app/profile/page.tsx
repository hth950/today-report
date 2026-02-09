'use client';

import { useState, useEffect } from 'react';
import type { UserProfile } from '@/types';
import TagInput from '@/components/TagInput';
import ProjectEditor from '@/components/ProjectEditor';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile');
      if (!response.ok) throw new Error('Failed to load profile');
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load profile' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      setMessage(null);

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          skills: profile.skills,
          technologies: profile.technologies,
          interests: profile.interests,
          projects: profile.projects,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save profile');
      }

      const updated = await response.json();
      setProfile(updated);
      setMessage({ type: 'success', text: 'Profile saved successfully!' });

      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save profile'
      });
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600">Failed to load profile</p>
          <button
            onClick={loadProfile}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            User Profile
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your profile information and preferences
          </p>
        </div>

        {/* Toast Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              value={profile.name || ''}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Skills */}
          <TagInput
            label="Skills"
            tags={profile.skills}
            onTagsChange={(skills) => setProfile({ ...profile, skills })}
            placeholder="Add a skill and press Enter"
          />

          {/* Technologies */}
          <TagInput
            label="Technologies"
            tags={profile.technologies}
            onTagsChange={(technologies) => setProfile({ ...profile, technologies })}
            placeholder="Add a technology and press Enter"
          />

          {/* Interests */}
          <TagInput
            label="Interest Topics"
            tags={profile.interests}
            onTagsChange={(interests) => setProfile({ ...profile, interests })}
            placeholder="Add an interest and press Enter"
          />

          {/* Projects */}
          <ProjectEditor
            projects={profile.projects}
            onProjectsChange={(projects) => setProfile({ ...profile, projects })}
          />

          {/* Save Button */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
          Last updated: {new Date(profile.updatedAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
