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
    <div className="h-full flex flex-col bg-[#0d1117] text-[#c9d1d9]">
      {/* Top Half: Generation Steps */}
      <div className="max-h-[40%] overflow-y-auto border-b border-[#30363d] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <StepsList steps={steps} />
      </div>
      
      {/* Bottom Half: File Explorer */}
      <div className="flex-1 overflow-y-auto flex flex-col scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <div className="p-3 border-b border-[#30363d] bg-[#161b22] sticky top-0 z-10">
          <h2 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider">
              Project Files
          </h2>
        </div>
        <FileExplorer files={files} onFileSelect={onFileSelect} />
      </div>
    </div>
  );
}