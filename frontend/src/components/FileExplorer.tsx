import React, { useState } from 'react';
import { Folder, FileCode, ChevronRight, ChevronDown } from 'lucide-react';
import { FileNode } from '../types/files';

interface FileExplorerProps {
  files: FileNode[];
  onFileSelect: (path: string) => void;
}

export function FileExplorer({ files, onFileSelect }: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderNode = (node: FileNode, path: string = '') => {
    const currentPath = `${path}/${node.name}`;
    const isExpanded = expandedFolders.has(currentPath);
    
    return (
      <div key={currentPath}>
        <div
          className="flex items-center space-x-2 py-1 px-2 hover:bg-gray-100 rounded cursor-pointer"
          onClick={() => node.type === 'folder' ? toggleFolder(currentPath) : onFileSelect(currentPath)}
        >
          {node.type === 'folder' && (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )
          )}
          {node.type === 'folder' ? (
            <Folder className="w-4 h-4 text-blue-500" />
          ) : (
            <FileCode className="w-4 h-4 text-gray-500 ml-4" />
          )}
          <span className="text-sm">{node.name}</span>
        </div>
        {node.type === 'folder' && isExpanded && node.children && (
          <div className="ml-4">
            {node.children.map((child) => renderNode(child, currentPath))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-sm font-semibold mb-4">Project Files</h2>
      {files.map((file) => renderNode(file))}
    </div>
  );
}