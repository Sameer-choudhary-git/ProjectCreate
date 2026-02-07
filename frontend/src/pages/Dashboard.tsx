import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { supabase } from "../lib/supabase";
import { BE_URL } from "../config";
import { 
  Terminal, 
  Calendar, 
  ArrowRight, 
  Plus, 
  Loader2, 
  Code2,
  Layout
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  prompt: string;
  createdAt: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUserAndFetchProjects();
  }, []);

  const checkUserAndFetchProjects = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/");
      return;
    }
    
    setUser(session.user);
    fetchProjects(session.access_token);
  };

  const fetchProjects = async (token: string) => {
    try {
      const response = await axios.get(`${BE_URL}/my-projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-[#0d1117]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1f6feb]" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#0d1117] p-8 text-[#c9d1d9]">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#30363d] pb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#c9d1d9] tracking-tight">My Projects</h1>
            <p className="text-[#8b949e] mt-2 text-sm">
              Manage and resume your AI-generated applications
            </p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-md font-medium transition-all shadow-sm border border-[rgba(240,246,252,0.1)] text-sm"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          // Empty State
          <div className="bg-[#161b22] rounded-xl border border-[#30363d] p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-[#1f6feb]/10 text-[#58a6ff] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#1f6feb]/20">
              <Layout className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#c9d1d9] mb-2">No projects yet</h3>
            <p className="text-[#8b949e] mb-8 max-w-md mx-auto leading-relaxed">
              Start building your first full-stack application with AI. It only takes a prompt to get started.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="text-[#58a6ff] font-medium hover:text-[#79c0ff] hover:underline flex items-center justify-center gap-2 mx-auto transition-colors"
            >
              Create your first project <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div 
                key={project.id}
                onClick={() => navigate(`/workspace/${project.id}`)}
                className="group bg-[#161b22] p-6 rounded-xl border border-[#30363d] hover:border-[#58a6ff] hover:shadow-xl hover:shadow-[#58a6ff]/5 transition-all cursor-pointer flex flex-col h-64 relative overflow-hidden"
              >
                {/* Decorative top gradient */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1f6feb] to-[#238636] opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-[#0d1117] rounded-lg text-[#8b949e] border border-[#30363d] group-hover:text-[#58a6ff] group-hover:border-[#58a6ff]/30 transition-colors">
                    <Terminal className="w-6 h-6" />
                  </div>
                  <div className="p-2 rounded-full hover:bg-[#30363d] transition-colors -mr-2 -mt-2">
                     <ArrowRight className="w-4 h-4 text-[#8b949e] group-hover:text-[#58a6ff] transition-colors transform group-hover:translate-x-1" />
                  </div>
                </div>
                
                <h3 className="font-bold text-lg text-[#c9d1d9] mb-2 line-clamp-1 group-hover:text-[#58a6ff] transition-colors">
                  {project.title || "Untitled Project"}
                </h3>
                
                <p className="text-[#8b949e] text-sm line-clamp-3 mb-auto leading-relaxed">
                  {project.prompt}
                </p>
                
                <div className="pt-4 mt-4 border-t border-[#30363d] flex items-center text-xs text-[#8b949e] font-medium">
                  <Calendar className="w-3.5 h-3.5 mr-2 opacity-70" />
                  {new Date(project.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}