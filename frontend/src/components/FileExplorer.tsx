import React, { useState } from 'react';
import { Folder, FileCode, ChevronRight, ChevronDown, FileJson, FileType, Image as ImageIcon } from 'lucide-react';
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
    if (name.endsWith('.json')) return <FileJson className="w-4 h-4 text-[#e3b341]" />;
    if (name.endsWith('.ts') || name.endsWith('.tsx')) return <FileCode className="w-4 h-4 text-[#3fb950]" />;
    if (name.endsWith('.css')) return <FileType className="w-4 h-4 text-[#79c0ff]" />;
    if (name.endsWith('.png') || name.endsWith('.svg')) return <ImageIcon className="w-4 h-4 text-[#d2a8ff]" />;
    return <FileCode className="w-4 h-4 text-[#8b949e]" />;
  };

  const renderNode = (node: FileItem) => {
    const isExpanded = expandedFolders.has(node.path);
    
    return (
      <div key={node.path}>
        <div
          className="flex items-center space-x-2 py-1 px-2 hover:bg-[#161b22] rounded-md cursor-pointer transition-colors group"
          onClick={() => node.type === 'folder' ? toggleFolder(node.path) : onFileSelect(node.path)}
        >
          {node.type === 'folder' && (
            <span className="text-[#8b949e] group-hover:text-white transition-colors">
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </span>
          )}
          
          <span className={`${node.type === 'file' ? 'ml-5' : ''}`}>
            {node.type === 'folder' ? (
               <Folder className={`w-4 h-4 ${isExpanded ? 'text-[#58a6ff]' : 'text-[#8b949e] group-hover:text-[#58a6ff]'}`} />
            ) : (
              getFileIcon(node.name)
            )}
          </span>
          
          <span className={`text-sm truncate select-none ${node.type === 'folder' ? 'font-medium text-[#c9d1d9]' : 'text-[#8b949e] group-hover:text-[#c9d1d9]'}`}>
            {node.name}
          </span>
        </div>
        
        {node.type === 'folder' && isExpanded && node.children && (
          <div className="ml-3 border-l border-[#30363d] pl-1">
            {node.children.map((child) => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-2 font-mono text-sm">
      {files.map((file) => renderNode(file))}
    </div>
  );
}