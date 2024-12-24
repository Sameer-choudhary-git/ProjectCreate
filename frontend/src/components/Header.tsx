import React from 'react';
import { Code2, Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Code2 className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold">ProjectCreate</span>
        </div>
        <nav className="flex items-center space-x-6">
          <a href="#" className="text-gray-600 hover:text-blue-600">Documentation</a>
          <a href="#" className="text-gray-600 hover:text-blue-600">Examples</a>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Sparkles className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </nav>
      </div>
    </header>
  );
}