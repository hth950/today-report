'use client';

import { useState } from 'react';
import type { Project } from '@/types';
import TagInput from './TagInput';

interface ProjectEditorProps {
  projects: Project[];
  onProjectsChange: (projects: Project[]) => void;
}

export default function ProjectEditor({ projects, onProjectsChange }: ProjectEditorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const addProject = () => {
    const newProject: Project = {
      name: '',
      description: '',
      techStack: []
    };
    onProjectsChange([...projects, newProject]);
    setExpandedIndex(projects.length);
  };

  const removeProject = (index: number) => {
    onProjectsChange(projects.filter((_, i) => i !== index));
    if (expandedIndex === index) {
      setExpandedIndex(null);
    }
  };

  const updateProject = (index: number, field: keyof Project, value: string | string[]) => {
    const updated = projects.map((project, i) =>
      i === index ? { ...project, [field]: value } : project
    );
    onProjectsChange(updated);
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Projects
        </label>
        <button
          onClick={addProject}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          + Add Project
        </button>
      </div>

      <div className="space-y-3">
        {projects.map((project, index) => (
          <div
            key={index}
            className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 overflow-hidden"
          >
            {/* Header */}
            <div
              className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => toggleExpand(index)}
            >
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  {project.name || `Project ${index + 1}`}
                </h3>
                {project.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                    {project.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeProject(index);
                  }}
                  className="px-3 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-sm"
                >
                  Remove
                </button>
                <span className="text-gray-400">
                  {expandedIndex === index ? '▲' : '▼'}
                </span>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedIndex === index && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={project.name}
                    onChange={(e) => updateProject(index, 'name', e.target.value)}
                    placeholder="Enter project name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={project.description}
                    onChange={(e) => updateProject(index, 'description', e.target.value)}
                    placeholder="Describe your project"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <TagInput
                  label="Tech Stack"
                  tags={project.techStack}
                  onTagsChange={(techStack) => updateProject(index, 'techStack', techStack)}
                  placeholder="Add technologies"
                />
              </div>
            )}
          </div>
        ))}

        {projects.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No projects yet. Click "Add Project" to get started.
          </div>
        )}
      </div>
    </div>
  );
}
