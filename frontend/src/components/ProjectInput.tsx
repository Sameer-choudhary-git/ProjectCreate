import React, { useState } from 'react';
import { Wand2 } from 'lucide-react';

export function ProjectInput({ onGenerate }: { onGenerate: (idea: string) => void }) {
  const [projectIdea, setProjectIdea] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectIdea.trim()) {
      onGenerate(projectIdea);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">
        Transform Your Idea Into Code
      </h1>
      <p className="text-gray-600 text-center mb-8">
        Describe your project idea, and we'll generate a complete website structure with all necessary files and components.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={projectIdea}
          onChange={(e) => setProjectIdea(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Describe your project idea... (e.g., 'Create a modern blog with dark mode support and newsletter subscription')"
        />
        <button
          type="submit"
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Wand2 className="w-5 h-5" />
          <span>Generate Project</span>
        </button>
      </form>
    </div>
  );
}