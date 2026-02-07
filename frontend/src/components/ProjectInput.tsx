import { useState, useEffect } from "react";
import { ArrowRight, Sparkles, Code2, Zap, LayoutTemplate, Terminal } from "lucide-react";

interface ProjectInputProps {
  onGenerate: (idea: string) => void;
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

export function ProjectInput({ onGenerate }: ProjectInputProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Trigger entrance animation on mount
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
    <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden bg-slate-50 flex items-center justify-center p-4 sm:p-8">
      
      {/* Background Decoration: Subtle Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.4]" 
           style={{ 
             backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
             backgroundSize: '32px 32px' 
           }}>
      </div>
      
      {/* Background Gradient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />

      <div className={`relative z-10 max-w-5xl w-full transition-all duration-1000 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {/* Main Content */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-blue-100 shadow-sm mb-4 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-sm font-medium text-slate-600">AI-Powered Project Generator</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Build your dream app <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              in seconds.
            </span>
          </h1>
          
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Describe your idea in plain English, and watch as we generate a production-ready codebase tailored to your needs.
          </p>
        </div>

        {/* Input Section */}
        <form onSubmit={handleSubmit} className="mb-16 relative max-w-3xl mx-auto">
          <div className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 p-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center px-4">
                <Terminal className="w-6 h-6 text-slate-400 mr-3" />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe your project (e.g., A crypto portfolio tracker...)"
                  className="w-full py-4 text-lg bg-transparent outline-none text-slate-800 placeholder-slate-400 font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-xl hover:translate-y-[-1px] active:translate-y-[1px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 min-w-[180px] shadow-lg shadow-blue-600/20"
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
             <p className="text-sm text-slate-400 font-medium">Free generation • Instant preview • Export code</p>
          </div>
        </form>

        {/* Example Projects */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8 px-2">
            <h3 className="text-slate-900 font-bold text-xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
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
                  className="group relative flex flex-col items-start text-left bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-t-2xl" />
                  
                  <div className="p-3 bg-slate-50 rounded-xl mb-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <Icon className="w-6 h-6 text-slate-600 group-hover:text-blue-600" />
                  </div>
                  
                  <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {project.description}
                  </p>
                  
                  <div className="mt-4 flex items-center text-blue-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
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