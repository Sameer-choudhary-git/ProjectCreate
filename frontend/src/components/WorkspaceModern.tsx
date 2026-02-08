import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Sidebar } from "./Sidebar";
import { CodeEditor } from "./CodeEditor";
import { FileContent, Step, StepType, FileItem } from "../types/files";
import { BE_URL } from "../config";
import { parseXml } from "../steps";
import { LoadingModal } from "./LoadingModal";
import { WebContainer } from "@webcontainer/api";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { supabase } from "../lib/supabase";
import { PreviewFrame } from "./PreviewFrame";
import {
  Loader2,
  Zap,
  Save,
  AlertTriangle,
  ArrowLeft,
  Download,
  Layout
} from "lucide-react";
import { generateInitialPrompt, MODIFICATION_PROMPT } from "../utils/prompts";

export function Workspace() {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // --- STATE ---
  const [prompt, setPrompt] = useState(searchParams.get("prompt") || "");
  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileContent | null>(null);
  const [activeTab, setActiveTab] = useState<"code" | "preview" | "terminal">("code");
  const [followUpPrompt, setFollowUpPrompt] = useState("");
  
  // Loading States
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [isLoading, setIsLoading] = useState(true);        
  const [loadingStage, setLoadingStage] = useState<"initializing" | "analyzing" | "generating" | "mounting" | "complete">("initializing");
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const [llmMessages, setLlmMessages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const initializedRef = useRef(false);

  // --- 1. MASTER INITIALIZATION ---
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const runInitialization = async () => {
      console.log("🚀 [INIT] Starting...");
      setIsLoading(true);
      setError(null);

      try {
        // A. Boot WebContainer
        let wc = webcontainer;
        if (!wc) {
            try {
                wc = await WebContainer.boot();
                setWebcontainer(wc);
                console.log("✅ [WC] Booted");
            } catch (e) {
                console.error("❌ [WC] Boot failed", e);
            }
        }

        // B. Decide Action
        if (projectId) {
            // LOAD EXISTING
            console.log(`📂 [LOAD] Loading ID: ${projectId}`);
            setLoadingStage("initializing");
            setLoadingProgress(40);
            
            const { data } = await axios.get(`${BE_URL}/projects/${projectId}`);
            setPrompt(data.prompt);
            setFiles(data.files || []);
            setSteps(data.steps || []);
            setLlmMessages(data.llmHistory || []);
            
            setLoadingProgress(100);
        } 
        else if (prompt) {
            // GENERATE NEW
            console.log(`✨ [GEN] Generating for: "${prompt}"`);
            await generateProject(prompt);
        } 
        else {
            throw new Error("No prompt or project ID found. Go back home and try again.");
        }

      } catch (err: any) {
        console.error("❌ [INIT] Failed:", err);
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoadingStage("complete");
        setIsLoading(false);
      }
    };

    runInitialization();
  }, [projectId, prompt]);

  // --- GENERATION LOGIC (Initial) ---
  const generateProject = async (userPrompt: string) => {
    const groqApiKey = localStorage.getItem("groq_api_key");

    if (!groqApiKey) {
      setError("Please add your Groq API key first.");
      return;
    }

    setLoadingStage("analyzing");
    setLoadingProgress(10);

    try {
      const resTemplate = await axios.post(`${BE_URL}/template`, { prompt: userPrompt, groqApiKey });
      setLoadingProgress(30);
      
      setLoadingStage("generating");
      const basePrompt = resTemplate.data.prompt[0];
      const enhancedPrompt = generateInitialPrompt(userPrompt);
      
      const messages = [{ role: "user", parts: [{ text: basePrompt }, { text: enhancedPrompt }] }];
      setLlmMessages(messages);

      const resChat = await axios.post(`${BE_URL}/chat`, { message: { role: "user", parts: messages.flatMap(m => m.parts) }, groqApiKey });
      setLoadingProgress(70);

      const parsedSteps = parseXml(resChat.data.response);
      setSteps(parsedSteps.map(x => ({ ...x, status: "pending" as const })));
      setLlmMessages(prev => [...prev, { role: "assistant", parts: [{ text: resChat.data.response }] }]);

      setLoadingStage("mounting");
      setLoadingProgress(90);
      await new Promise(r => setTimeout(r, 500));
      setLoadingProgress(100);
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.response?.data?.error || "Generation failed.");
    }
  };

  // --- FOLLOW UP HANDLER (Smart & Clean) ---
  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpPrompt.trim() || isSubmitting) return;

    const groqApiKey = localStorage.getItem("groq_api_key");
    if (!groqApiKey) {
      alert("Please verify your API key.");
      return;
    }

    // 1. ACTIVATE OVERLAY (Feedback)
    setIsSubmitting(true);
    setLoadingStage("analyzing");
    setLoadingProgress(0);

    const userOriginalText = followUpPrompt;
    setFollowUpPrompt(""); 

    // 2. Add Temp Step (Visual cue in background)
    const tempStepId = Date.now(); 
    setSteps(prev => [
      ...prev, 
      {
        id: tempStepId,
        title: "Analyzing Request...",
        description: userOriginalText,
        type: StepType.RunScript,
        status: "in-progress"
      }
    ]);
    
    // 3. Prepare Context
    const fullPrompt = `${MODIFICATION_PROMPT}\n\nUser Request: ${userOriginalText}`;
    const userMessage = { role: "user", parts: [{ text: fullPrompt }] };
    const newHistory = [...llmMessages, userMessage];
    setLlmMessages(newHistory);

    try {
      setLoadingProgress(30);
      setLoadingStage("generating");

      const resChat = await axios.post(`${BE_URL}/chat`, {
        message: { role: "user", parts: newHistory.flatMap(m => m.parts) },
        groqApiKey
      });

      setLoadingProgress(70);
      setLoadingStage("mounting");

      const responseText = resChat.data.response;
      
      // 4. Parse Response
      const newSteps = parseXml(responseText).map(x => ({
        ...x,
        status: "pending" as const 
      }));

      // 5. UPDATE STEPS (COMPLETE REPLACEMENT)
      // This wipes old steps and shows ONLY what is changing now.
      setSteps(newSteps);
      
      setLlmMessages(prev => [...prev, { role: "assistant", parts: [{ text: responseText }] }]);
      setLoadingProgress(100);
      
    } catch (err) {
      console.error("Follow-up failed:", err);
      alert("Failed to process follow-up");
      // If fail, revert to removing only the temp step
      setSteps(prev => prev.filter(s => s.id !== tempStepId));
    } finally {
      setIsSubmitting(false);
      setLoadingStage("complete");
    }
  };

  // --- SAVE (Smart Update) ---
  const handleSave = async () => {
    setIsSaving(true);
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers = session ? { Authorization: `Bearer ${session.access_token}` } : {};
        
        const payload = {
            title: prompt.slice(0, 50),
            prompt,
            files,
            steps,
            llmHistory: llmMessages
        };

        if (projectId) {
            await axios.put(`${BE_URL}/projects/${projectId}`, payload, { headers });
            alert("Project updated successfully!");
        } else {
            const res = await axios.post(`${BE_URL}/projects`, payload, { headers });
            navigate(`/workspace/${res.data.id}`, { replace: true });
            alert("Project saved!");
        }
    } catch (e) {
        alert("Save failed");
        console.error(e);
    } finally {
        setIsSaving(false);
    }
  };

  // --- DOWNLOAD ---
  const handleDownload = async () => {
    if (!projectId) {
      alert("Please save your project first before downloading");
      return;
    }

    try {
      const response = await axios.get(`${BE_URL}/projects/${projectId}/download`, {
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `project_${projectId}.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert("Download failed");
      console.error(e);
    }
  };

  // --- FILES EFFECT (UPDATER) ---
  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;
    
    steps.filter(s => s.status === "pending").forEach(step => {
        updateHappened = true;
        if (step.type === StepType.CreateFile && step.path) {
            let pathParts = step.path.split('/');
            let current = originalFiles;
            let folderPath = "";

            while (pathParts.length > 1) {
                const folderName = pathParts.shift()!;
                folderPath += (folderPath ? "/" : "") + folderName;
                let folder = current.find(f => f.name === folderName);
                if (!folder) {
                    folder = { name: folderName, type: "folder", path: folderPath, children: [] };
                    current.push(folder);
                }
                current = folder.children!;
            }
            
            const fileName = pathParts[0];
            const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;
            const existingFile = current.find(f => f.name === fileName);
            
            if (existingFile) existingFile.content = step.code;
            else current.push({ name: fileName, type: "file", path: filePath, content: step.code || "" });
        }
    });

    if (updateHappened) {
        setFiles(originalFiles);
        setSteps(prev => prev.map(s => ({ ...s, status: "completed" })));
    }
  }, [steps]);

  // --- MOUNT EFFECT ---
  useEffect(() => {
    if(!webcontainer || files.length === 0) return;
    const mountFiles = async () => {
        const process = async (item: FileItem) => {
            if(item.type === 'file') {
                const path = item.path.startsWith('/') ? item.path.slice(1) : item.path;
                const dir = path.split('/').slice(0, -1).join('/');
                if(dir) await webcontainer.fs.mkdir(dir, { recursive: true }).catch(()=>{});
                await webcontainer.fs.writeFile(path, item.content || "");
            }
            if(item.children) {
                for(const child of item.children) await process(child);
            }
        };
        for(const f of files) await process(f);
    };
    mountFiles();
  }, [files, webcontainer]);

  // --- TERMINAL EFFECT ---
  useEffect(() => {
    if (!webcontainer || !terminalRef.current || xtermRef.current) return;
    const term = new Terminal({ convertEol: true, theme: { background: "#1e1e1e" } });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(terminalRef.current);
    fit.fit();
    xtermRef.current = term;
    
    webcontainer.spawn("jsh").then(process => {
        process.output.pipeTo(new WritableStream({ write: d => term.write(d) }));
        const writer = process.input.getWriter();
        term.onData(d => writer.write(d));
    });

    return () => { term.dispose(); xtermRef.current = null; };
  }, [webcontainer]);

  // --- RENDER ---
  const handleFileSelect = (path: string) => {
    const find = (items: FileItem[]): FileContent | null => {
        for(const item of items) {
            if(item.path === path && item.type === 'file') return { path, content: item.content || "", language: "typescript" };
            if(item.children) {
                const found = find(item.children);
                if(found) return found;
            }
        }
        return null;
    };
    setSelectedFile(find(files));
  };

  // 1. INITIAL LOADING STATE
  if (isLoading) {
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0d1117] text-white gap-4">
            {error ? (
                <div className="text-center max-w-md p-6 bg-[#161b22] border border-red-500/30 rounded-xl shadow-2xl">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-400 font-medium mb-4">{error}</p>
                    <button onClick={() => navigate('/')} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-all">Go Back</button>
                </div>
            ) : (
                <>
                    <LoadingModal stage={loadingStage} progress={loadingProgress} />
                    <p className="text-gray-400 animate-pulse text-sm mt-4">Building your vision...</p>
                </>
            )}
        </div>
    );
  }

  // 2. MAIN WORKSPACE
  return (
    <div className="flex flex-col h-screen w-screen bg-[#0d1117] overflow-hidden text-gray-300 font-sans relative">
      
      {/* 3. FOLLOW-UP LOADING OVERLAY */}
      {isSubmitting && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all">
           <LoadingModal stage={loadingStage} progress={loadingProgress} />
        </div>
      )}

      {/* HEADER */}
      <header className="flex items-center justify-between px-4 h-14 bg-[#161b22] border-b border-[#30363d] shrink-0 z-10">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="hover:bg-[#21262d] p-1.5 rounded-md transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <h1 className="font-semibold text-white tracking-tight text-sm">Bolt Workspace</h1>
            {prompt && <span className="text-xs text-gray-500 truncate max-w-[200px] border-l border-gray-700 pl-4">{prompt}</span>}
        </div>
        
        <div className="flex items-center gap-3">
            <div className="flex bg-[#21262d] p-0.5 rounded-lg border border-[#30363d]">
                {(["code", "preview", "terminal"] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} 
                        className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                            activeTab === tab 
                            ? "bg-[#30363d] text-white shadow-sm" 
                            : "text-gray-400 hover:text-white hover:bg-[#30363d]/50"
                        }`}>
                        {tab}
                    </button>
                ))}
            </div>

            <div className="h-4 w-px bg-[#30363d] mx-1" />

            <button onClick={handleSave} disabled={isSaving} 
                className="flex items-center gap-2 px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-medium rounded-md transition-all disabled:opacity-50 disabled:grayscale">
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {projectId ? "Update" : "Save"}
            </button>
            <button onClick={handleDownload} disabled={!projectId} 
                className="flex items-center gap-2 px-3 py-1.5 bg-[#1f6feb] hover:bg-[#388bfd] text-white text-xs font-medium rounded-md transition-all disabled:opacity-50 disabled:grayscale">
                <Download className="w-3.5 h-3.5" />
                Export
            </button>
        </div>
      </header>

      {/* CONTENT AREA */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT SIDEBAR (Explorer + Chat) */}
        <aside className="w-80 border-r border-[#30363d] bg-[#0d1117] flex flex-col justify-between shrink-0 h-full">
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent p-2">
                <Sidebar steps={steps} files={files} onFileSelect={handleFileSelect} />
            </div>
            
            {/* Chat Input */}
            <div className="p-3 border-t border-[#30363d] bg-[#161b22]">
                <form onSubmit={handleFollowUpSubmit} className="flex flex-col gap-2 relative">
                    <textarea
                        value={followUpPrompt}
                        onChange={(e) => setFollowUpPrompt(e.target.value)}
                        placeholder="Ask AI to edit..."
                        className="w-full p-3 pr-10 text-xs bg-[#0d1117] border border-[#30363d] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] resize-none scrollbar-none"
                        rows={2}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleFollowUpSubmit(e);
                            }
                        }}
                    />
                    <button 
                        type="submit" 
                        disabled={isSubmitting || !followUpPrompt.trim()}
                        className="absolute bottom-3 right-3 p-1.5 bg-[#238636] text-white rounded-md hover:bg-[#2ea043] disabled:opacity-0 transition-all"
                    >
                        {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                    </button>
                </form>
            </div>
        </aside>

        {/* RIGHT MAIN AREA */}
        <main className="flex-1 bg-[#1e1e1e] relative flex flex-col min-w-0 overflow-hidden">
            {activeTab === 'code' && (
                selectedFile ? (
                    <CodeEditor content={selectedFile.content} language={selectedFile.language} />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                        <Layout className="w-16 h-16 opacity-20" />
                        <p className="text-sm font-medium">Select a file from the sidebar to view code</p>
                    </div>
                )
            )}
            
            {activeTab === 'preview' && (
                <div className="h-full w-full bg-white">
                    <PreviewFrame webContainer={webcontainer} files={files} />
                </div>
            )}
            
            <div className={`h-full w-full bg-[#1e1e1e] border-t border-[#30363d] ${activeTab === 'terminal' ? 'block' : 'hidden'}`}>
                 <div ref={terminalRef} className="h-full w-full" />
            </div>
        </main>
      </div>
    </div>
  );
}