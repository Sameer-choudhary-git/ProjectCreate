export enum StepType {
  CreateFile = 'CreateFile',
  CreateFolder = 'CreateFolder',
  EditFile = 'EditFile',
  DeleteFile = 'DeleteFile',
  RunScript = 'RunScript',
}

export interface Step {
  id: number;
  title: string;
  description: string;
  type: StepType;
  status: 'pending' | 'in-progress' | 'completed';
  code?: string;
  path?: string;
}

export interface FileItem {
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  children?: FileItem[];
}

export interface FileContent {
  path: string;
  content: string;
  language: string;
}