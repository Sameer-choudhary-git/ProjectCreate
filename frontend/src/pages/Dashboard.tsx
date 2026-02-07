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
  Search,
  Code2
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
      // If not logged in, redirect to home
      navigate("/");
      return;
    }
    
    setUser(session.user);
    fetchProjects(session.access_token);
  };

  const fetchProjects = async (token: string) => {
    try {
      // Use the /my-projects endpoint we created in the backend
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
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-500 mt-1">
              Welcome back, {user?.email?.split('@')[0]}
            </p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Code2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Start building your first full-stack application with AI. It only takes a prompt to get started.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
            >
              Create your first project &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div 
                key={project.id}
                onClick={() => navigate(`/workspace/${project.id}`)}
                className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col h-64"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Terminal className="w-6 h-6" />
                  </div>
                  <ArrowRight className="text-gray-300 group-hover:text-blue-500 transition-colors transform group-hover:translate-x-1" />
                </div>
                
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                  {project.title || "Untitled Project"}
                </h3>
                
                <p className="text-gray-500 text-sm line-clamp-3 mb-auto">
                  {project.prompt}
                </p>
                
                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center text-xs text-gray-400 font-medium">
                  <Calendar className="w-3 h-3 mr-2" />
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