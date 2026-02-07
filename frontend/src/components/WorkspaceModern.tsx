import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom"; // Added useSearchParams
import axios from "axios";
import { Sidebar } from "./Sidebar";
import { CodeEditor } from "./CodeEditor";
import { FileContent, Step, StepType, FileItem } from "../types/files";
import { BE_URL } from "../config";
import { parseXml } from "../steps";
import { LoadingModal } from "./LoadingModal";
import { ProgressBar } from "./ProgressBar";
import { WebContainer } from "@webcontainer/api";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { PreviewFrame } from "./PreviewFrame";
import { supabase } from "../lib/supabase";
import {
  Code2, Eye, Loader2, Zap, Terminal as TerminalIcon, Layout, Save, Cloud, AlertTriangle, ArrowLeft
} from "lucide-react";
import { generateInitialPrompt, CODE_OUTPUT_INSTRUCTION } from "../utils/prompts";

export function Workspace() {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // --- STATE ---
  // Priority: 1. URL Param, 2. Empty String
  const [prompt, setPrompt] = useState(searchParams.get("prompt") || "");
  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileContent | null>(null);
  const [activeTab, setActiveTab] = useState<"code" | "preview" | "terminal">("code");
  const [followUpPrompt, setFollowUpPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [llmMessages, setLlmMessages] = useState<any[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState<"initializing" | "analyzing" | "generating" | "mounting" | "complete">("initializing");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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
            // NO DATA
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
  }, [projectId, prompt]); // Re-run if ID or URL prompt changes

  // --- GENERATION LOGIC ---
  const generateProject = async (userPrompt: string) => {
    const groqApiKey = localStorage.getItem("groq_api_key");

    // Check if user has provided a Groq API key
    if (!groqApiKey) {
      setError("Please add your Groq API key first. Click the 'API Key' button in the header to get started.");
      return;
    }

    setLoadingStage("analyzing");
    setLoadingProgress(10);

    try {
      const resTemplate = await axios.post(`${BE_URL}/template`, { prompt: userPrompt, groqApiKey });
      console.log("✅ [TEMPLATE] Received template", resTemplate.data);
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
      setError(err.response?.data?.error || "Generation failed. Please check your API key and try again.");
    }
  };

  // --- SAVE ---
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

        const res = await axios.post(`${BE_URL}/projects`, payload, { headers });
        if (!projectId) navigate(`/workspace/${res.data.id}`, { replace: true });
        alert("Saved!");
    } catch (e) {
        alert("Save failed");
        console.error(e);
    } finally {
        setIsSaving(false);
    }
  };

  // --- FILES ---
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

  // --- MOUNT ---
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

  // --- TERMINAL ---
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

  if (isLoading) {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
            {error ? (
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                    <p className="text-red-600 font-medium">{error}</p>
                    <button onClick={() => navigate('/')} className="mt-4 bg-gray-800 text-white px-4 py-2 rounded">Go Back</button>
                </div>
            ) : (
                <>
                    <LoadingModal stage={loadingStage} progress={loadingProgress} />
                    <p className="text-gray-500 animate-pulse">Building your vision...</p>
                </>
            )}
        </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA]">
      <header className="flex items-center justify-between px-4 h-16 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')}><ArrowLeft className="w-5 h-5 text-gray-500" /></button>
            <h1 className="font-bold">Bolt Workspace</h1>
        </div>
        <div className="flex gap-4">
            <div className="flex bg-gray-100 p-1 rounded-lg">
                {(["code", "preview", "terminal"] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} 
                        className={`px-4 py-1.5 rounded-md text-sm capitalize ${activeTab === tab ? "bg-white shadow-sm" : ""}`}>
                        {tab}
                    </button>
                ))}
            </div>
            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
            </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 border-r bg-gray-50 flex flex-col">
            <Sidebar steps={steps} files={files} onFileSelect={handleFileSelect} />
        </aside>
        <main className="flex-1 bg-white relative">
            {activeTab === 'code' && (selectedFile ? <CodeEditor content={selectedFile.content} language={selectedFile.language} /> : <div className="h-full flex items-center justify-center text-gray-400">Select a file</div>)}
            {activeTab === 'preview' && <PreviewFrame webContainer={webcontainer} files={files} />}
            <div className={`h-full bg-[#1e1e1e] ${activeTab === 'terminal' ? 'block' : 'hidden'}`} ref={terminalRef} />
        </main>
      </div>
    </div>
  );
}