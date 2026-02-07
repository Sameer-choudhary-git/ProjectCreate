import { useState, useEffect } from "react";
import { ArrowRight, Sparkles, Code2, Zap, LayoutTemplate, Terminal } from "lucide-react";

interface ProjectInputProps {
  onGenerate: (idea: string) => void;
  prompt?: string;
}

const EXAMPLE_PROJECTS = [
  {
    icon: Code2,
    title: "React Todo App",
    description: "A clean task manager with drag-and-drop and local storage.",
    prompt: "Create a modern React Todo application with drag-and-drop functionality using local storage for persistence."
  },
  {
    icon: Zap,
    title: "Node.js REST API",
    description: "High-performance Express API with MongoDB connection.",
    prompt: "Generate a production-ready Node.js Express REST API connected to MongoDB with JWT authentication."
  },
  {
    icon: LayoutTemplate,
    title: "SaaS Dashboard",
    description: "Analytics dashboard with charts and dark mode support.",
    prompt: "Build a responsive SaaS dashboard using React, Tailwind CSS, and Recharts for data visualization."
  },
];

export function ProjectInput({ onGenerate, prompt = "" }: ProjectInputProps) {
  const [input, setInput] = useState(prompt); 
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setIsLoading(true);
      setTimeout(() => {
        onGenerate(input);
        setIsLoading(false);
      }, 800);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] relative overflow-hidden bg-[#0d1117] flex items-center justify-center p-4 sm:p-8">
      
      {/* Background Decoration: Dark Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.2]" 
           style={{ 
             backgroundImage: 'radial-gradient(#30363d 1px, transparent 1px)', 
             backgroundSize: '32px 32px' 
           }}>
      </div>
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#1f6feb]/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#238636]/10 rounded-full blur-[100px]" />

      <div className={`relative z-10 max-w-5xl w-full transition-all duration-1000 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {/* Main Content */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#161b22] border border-[#30363d] shadow-sm mb-4 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-[#e3b341]" />
            <span className="text-sm font-medium text-[#c9d1d9]">AI-Powered Project Generator</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-[#c9d1d9] tracking-tight leading-tight">
            Build your dream app <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#58a6ff] to-[#bc8cff]">
              in seconds.
            </span>
          </h1>
          
          <p className="text-xl text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
            Describe your idea in plain English, and watch as we generate a production-ready codebase tailored to your needs.
          </p>
        </div>

        {/* Input Section */}
        <form onSubmit={handleSubmit} className="mb-16 relative max-w-3xl mx-auto">
          <div className="group relative bg-[#161b22] rounded-2xl shadow-2xl transition-all duration-300 border border-[#30363d] focus-within:border-[#58a6ff] focus-within:ring-4 focus-within:ring-[#58a6ff]/10 p-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center px-4">
                <Terminal className="w-6 h-6 text-[#8b949e] mr-3" />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe your project (e.g., A crypto portfolio tracker...)"
                  className="w-full py-4 text-lg bg-transparent outline-none text-[#c9d1d9] placeholder-[#484f58] font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-8 py-4 bg-[#238636] hover:bg-[#2ea043] text-white font-bold text-lg rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 min-w-[180px] shadow-lg shadow-[#238636]/20 border border-[rgba(240,246,252,0.1)]"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    <span>Working...</span>
                  </>
                ) : (
                  <>
                    <span>Generate</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
          {/* Helper text under input */}
          <div className="absolute -bottom-8 left-0 right-0 text-center">
             <p className="text-sm text-[#8b949e] font-medium">Free generation • Instant preview • Export code</p>
          </div>
        </form>

        {/* Example Projects */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8 px-2">
            <h3 className="text-[#c9d1d9] font-bold text-xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#58a6ff]" />
              Try an example
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {EXAMPLE_PROJECTS.map((project, index) => {
              const Icon = project.icon;
              return (
                <button
                  key={index}
                  onClick={() => setInput(project.prompt)}
                  className="group relative flex flex-col items-start text-left bg-[#161b22] p-6 rounded-2xl border border-[#30363d] shadow-sm hover:shadow-xl hover:border-[#58a6ff]/50 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#58a6ff] to-[#bc8cff] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-t-2xl" />
                  
                  <div className="p-3 bg-[#0d1117] rounded-xl mb-4 border border-[#30363d] group-hover:border-[#58a6ff]/30 group-hover:text-[#58a6ff] transition-colors">
                    <Icon className="w-6 h-6 text-[#8b949e] group-hover:text-[#58a6ff]" />
                  </div>
                  
                  <h3 className="font-bold text-[#c9d1d9] text-lg mb-2 group-hover:text-[#58a6ff] transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-[#8b949e] text-sm leading-relaxed">
                    {project.description}
                  </p>
                  
                  <div className="mt-4 flex items-center text-[#58a6ff] text-sm font-semibold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    Use this prompt <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
      </div>
    </div>
  );
}