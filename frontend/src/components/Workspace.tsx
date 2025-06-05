import { useEffect, useState } from "react";
import axios from "axios";
import { Sidebar } from "./Sidebar";
import { CodeEditor } from "./CodeEditor";
import { FileContent,  Step, StepType, FileItem } from "../types/files";
import { BE_URL } from "../config";
import { parseXml } from "../steps";
import { useWebContainer } from "../hooks/useWebContainer";
import { PreviewFrame } from "./PreviewFrame";

export function Workspace({ prompt }: { prompt: string }) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileContent | null>(null);
  const webContainer = useWebContainer();
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [followUpPrompt, setFollowUpPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [llmMessages, setLlmMessages] = useState< any>("");
  const [llmParts, setLlmParts] = useState<any>([]);

  const init = async () => {
    const response = await axios.post(`${BE_URL}/template`, {
      prompt: prompt,
    });
    const {prompts, uiPrompt } = response.data;
    setSteps(parseXml(uiPrompt));

    const prompt1 = response.data.prompt[0];
    const prompt2 = response.data.prompt[1];
    const prompt3 = prompt + "important: dont use ``` and filetype in start and end of code that you want to generate";
    const parts = [{ text: prompt1 }, { text: prompt2 }, { text: prompt3 }];
    const content = {
      role: "user",
      parts: parts,
    };
    setLlmParts(parts);

    const response1 = await axios.post(`${BE_URL}/chat`, {
      message: content,
    });
    
    setSteps(parseXml(response1.data.response).map(x => ({
      ...x,
      status: "pending" as "pending"
    })));


    setLlmMessages(content);

  };

  const handleFollowUpSubmit = async () => {
    if (!followUpPrompt.trim()) return;
    
    setIsSubmitting(true);
    try {
      const newMes = { text: followUpPrompt };
      const temp = llmParts;
      temp.push(newMes);
      setLlmParts(temp);
      const currentMessage = {role: "user", parts: temp};
      setLlmMessages(currentMessage);
      const response = await axios.post(`${BE_URL}/chat`, {
        message: currentMessage
      });

      if (response.data.response) {
        setSteps(parseXml(response.data.response).map(x => ({
          ...x,
          status: "pending" as "pending"
        })));
      }
      setFollowUpPrompt('');
    } catch (error) {
      console.error('Error submitting follow-up prompt:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const [files, setFiles] = useState<FileItem[]>([]);
 
  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;
    steps.filter(({status}) => status === "pending").map(step => {
      updateHappened = true;
      if (step?.type === StepType.CreateFile) {
        let parsedPath = step.path?.split("/") ?? [];
        let currentFileStructure = [...originalFiles];
        let finalAnswerRef = currentFileStructure;
  
        let currentFolder = ""
        while(parsedPath.length) {
          currentFolder =  `${currentFolder}/${parsedPath[0]}`;
          let currentFolderName = parsedPath[0];
          parsedPath = parsedPath.slice(1);
  
          if (!parsedPath.length) {
            let file = currentFileStructure.find(x => x.path === currentFolder)
            if (!file) {
              currentFileStructure.push({
                name: currentFolderName,
                type: 'file',
                path: currentFolder,
                content: step.code || ""
              })
            } else {
              file.content = step.code;
            }
          } else {
            /// in a folder
            let folder = currentFileStructure.find(x => x.path === currentFolder)
            if (!folder) {
              // create the folder
              currentFileStructure.push({
                name: currentFolderName,
                type: 'folder',
                path: currentFolder,
                children: []
              })
            }
  
            currentFileStructure = currentFileStructure.find(x => x.path === currentFolder)!.children!;
          }
        }
        originalFiles = finalAnswerRef;
      }
    })

    if (updateHappened) {
      setFiles(originalFiles)
      setSteps(steps => steps.map((s: Step) => {
        return {
          ...s,
          status: "completed"
        }
      }))
    }
  }, [steps, files]);
  
  useEffect(() => {
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};
  
      const processFile = (file: FileItem, isRootFolder: boolean) => {  
        if (file.type === 'folder') {
          // For folders, create a directory entry
          mountStructure[file.name] = {
            directory: file.children ? 
              Object.fromEntries(
                file.children.map(child => [child.name, processFile(child, false)])
              ) 
              : {}
          };
        } else if (file.type === 'file') {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || ''
              }
            };
          } else {
            // For files, create a file entry with contents
            return {
              file: {
                contents: file.content || ''
              }
            };
          }
        }
  
        return mountStructure[file.name];
      };
  
      // Process each top-level file/folder
      files.forEach(file => processFile(file, true));
  
      return mountStructure;
    };
  
    const mountStructure = createMountStructure(files);
    // Mount the structure if WebContainer is available
    webContainer?.mount(mountStructure);
  }, [files, webContainer]);

  const handleFileSelect = (path: string) => {
    const selectedFile = findFileByPath(files, path);
 
    if (selectedFile) {
      setSelectedFile({
        path: selectedFile.path,
        content: selectedFile.content || "// File content is empty",
        language: determineLanguage(selectedFile.path),
      });
    } else {
      console.error("File not found:", path);
    }
  };
  
  const findFileByPath = (filesArray: any, path: any): any => {
    for (const file of filesArray) {
      if (file.path === path) {
        return file;
      }
      if (file.type === "folder" && file.children) {
        const foundFile = findFileByPath(file.children, path);
        if (foundFile) {
          return foundFile;
        }
      }
    }
    return null; // Return null if the file is not found
  };
  
  const determineLanguage = (path: string) => {
    const extension = path.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "tsx":
      case "ts":
        return "TypeScript";
      case "css":
        return "CSS";
      case "html":
        return "HTML";
      case "json":
        return "JSON";
      case "js":
        return "JavaScript";
      default:
        return "Plain Text";
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex justify-between p-2 bg-gray-200">
        <button
          className={`px-4 py-2 ${activeTab === 'code' ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
          onClick={() => setActiveTab('code')}
        >
          Code
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'preview' ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
          onClick={() => setActiveTab('preview')}
        >
          Preview
        </button>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar steps={steps} onFileSelect={handleFileSelect} files={files} />
        <div className="flex-1 h-full flex flex-col">
          {selectedFile ? (
            <div className="flex-1">
              {activeTab === 'code' ? (
                <CodeEditor
                  content={selectedFile.content}
                  language={selectedFile.language}
                />
              ) : (
                <PreviewFrame webContainer={webContainer} files={files} />
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <p className="text-gray-500">Select a file to view its contents</p>
            </div>
          )}
          <div className="p-4 bg-gray-100 border-t">
            <div className="flex gap-2">
              <textarea
                value={followUpPrompt}
                onChange={(e) => setFollowUpPrompt(e.target.value)}
                placeholder="Enter your follow-up prompt here..."
                className="flex-1 p-2 border rounded-md resize-none h-24"
                disabled={isSubmitting}
              />
              <button
                onClick={handleFollowUpSubmit}
                disabled={isSubmitting || !followUpPrompt.trim()}
                className={`px-4 py-2 rounded-md ${
                  isSubmitting || !followUpPrompt.trim()
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                >

                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
