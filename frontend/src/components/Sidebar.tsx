import React from 'react';
import { StepsList } from './StepsList';
import { FileExplorer } from './FileExplorer';
import { Step, FileItem } from '../types/files';

interface SidebarProps {
  steps: Step[];
  files: FileItem[];
  onFileSelect: (path: string) => void;
}

export function Sidebar({ steps, onFileSelect, files }: SidebarProps) {
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Top Half: Generation Steps */}
      <div className="max-h-[40%] overflow-y-auto border-b border-gray-200">
        <StepsList steps={steps} />
      </div>
      
      {/* Bottom Half: File Explorer */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 sticky top-0 z-10">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
             Project Files
          </h2>
        </div>
        <FileExplorer files={files} onFileSelect={onFileSelect} />
      </div>
    </div>
  );
}