import React, { useState } from 'react';
import { Folder, FileCode, ChevronRight, ChevronDown, FileJson, FileType } from 'lucide-react';
import { FileItem } from '../types/files';

interface FileExplorerProps {
  files: FileItem[];
  onFileSelect: (path: string) => void;
}

export function FileExplorer({ files, onFileSelect }: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']));

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith('.json')) return <FileJson className="w-4 h-4 text-yellow-600" />;
    if (name.endsWith('.ts') || name.endsWith('.tsx')) return <FileCode className="w-4 h-4 text-blue-600" />;
    if (name.endsWith('.css')) return <FileType className="w-4 h-4 text-cyan-500" />;
    return <FileCode className="w-4 h-4 text-gray-500" />;
  };

  const renderNode = (node: FileItem) => {
    // node.path is absolute (e.g., "/app/page.tsx")
    const isExpanded = expandedFolders.has(node.path);
    
    return (
      <div key={node.path}>
        <div
          className="flex items-center space-x-2 py-1.5 px-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
          onClick={() => node.type === 'folder' ? toggleFolder(node.path) : onFileSelect(node.path)}
        >
          {node.type === 'folder' && (
            <span className="text-gray-400">
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </span>
          )}
          
          <span className={`${node.type === 'file' ? 'ml-6' : ''}`}>
            {node.type === 'folder' ? (
               <Folder className={`w-4 h-4 ${isExpanded ? 'text-blue-600' : 'text-blue-400'}`} />
            ) : (
              getFileIcon(node.name)
            )}
          </span>
          
          <span className={`text-sm truncate select-none ${node.type === 'folder' ? 'font-medium text-gray-700' : 'text-gray-600'}`}>
            {node.name}
          </span>
        </div>
        
        {node.type === 'folder' && isExpanded && node.children && (
          <div className="ml-4 border-l border-gray-200 pl-1">
            {node.children.map((child) => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-2">
      {files.map((file) => renderNode(file))}
    </div>
  );
}