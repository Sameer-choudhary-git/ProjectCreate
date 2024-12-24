import { StepsList } from './StepsList';
import { FileExplorer } from './FileExplorer';
import { Step } from '../types/files';
import { FileItem } from '../types/files';

 
interface FileExplorerProps {

  steps: Step[];
  files: FileItem[];
  onFileSelect: (path: string) => void;

}


export function Sidebar({ steps, onFileSelect, files }: FileExplorerProps) {

  return (
    <div className="w-80 border-r border-gray-200 h-full bg-white flex flex-col overflow-y-auto">
      <StepsList steps={steps} />
      <div className="flex-1 overflow-y-auto">
        <FileExplorer files={files} onFileSelect={onFileSelect}  />
      </div>
    </div>
  );
}
