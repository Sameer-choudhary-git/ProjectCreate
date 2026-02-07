import { Code2, Zap, LogOut, User, Key } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { GroqKeyModal } from "./GroqKeyModal";

export function Header() {
  const [user, setUser] = useState<any>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [hasGroqKey, setHasGroqKey] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const key = localStorage.getItem("groq_api_key");
    setHasGroqKey(!!key);
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'github' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSaveGroqKey = (key: string) => {
    localStorage.setItem("groq_api_key", key);
    setHasGroqKey(true);
    alert("Groq API key saved successfully!");
  };

  const handleRemoveGroqKey = () => {
    if (confirm("Are you sure you want to remove your Groq API key?")) {
      localStorage.removeItem("groq_api_key");
      setHasGroqKey(false);
      alert("Groq API key removed!");
    }
  };

  return (
    <header className="bg-[#161b22] border-b border-[#30363d] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center">
        <div className="flex items-center justify-between w-full">
          
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.href = '/'}>
            <div className="bg-[#21262d] p-1.5 rounded-md border border-[#30363d] group-hover:border-[#58a6ff] transition-colors">
              <Code2 className="w-5 h-5 text-[#58a6ff]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#c9d1d9] tracking-tight">ProjectCreate</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-[#0d1117] border border-[#30363d] px-3 py-1 rounded-full">
              <Zap className="w-3 h-3 text-yellow-500" />
              <span className="text-[#8b949e] text-xs font-medium">Powered by Groq</span>
            </div>

            <div className="relative group">
              <button
                onClick={() => setShowKeyModal(true)}
                className={`${
                  hasGroqKey
                    ? "bg-[#238636] hover:bg-[#2ea043] text-white"
                    : "bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d]"
                } px-3 py-1.5 rounded-md transition-all flex items-center gap-2 text-xs font-medium`}
                title={hasGroqKey ? "Update your Groq API key" : "Add your own Groq API key"}
              >
                <Key className="w-3.5 h-3.5" />
                API Key {hasGroqKey && "✓"}
              </button>
              
              {hasGroqKey && (
                <div className="absolute right-0 mt-2 w-48 bg-[#161b22] border border-[#30363d] text-[#c9d1d9] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <button
                    onClick={() => setShowKeyModal(true)}
                    className="w-full text-left px-4 py-2 hover:bg-[#1f6feb] rounded-t-lg text-sm font-medium"
                  >
                    Update Key
                  </button>
                  <button
                    onClick={handleRemoveGroqKey}
                    className="w-full text-left px-4 py-2 hover:bg-red-900/50 text-red-400 hover:text-red-300 rounded-b-lg text-sm font-medium"
                  >
                    Remove Key
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="text-[#c9d1d9] text-sm hover:text-[#58a6ff] transition-colors font-medium"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-[#21262d] hover:bg-[#da3633] hover:text-white border border-[#30363d] text-[#c9d1d9] p-1.5 rounded-md transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="bg-[#1f6feb] hover:bg-[#388bfd] text-white px-4 py-1.5 rounded-md font-medium text-xs transition-colors flex items-center gap-2"
              >
                <User className="w-3.5 h-3.5" /> Sign In
              </button>
            )}
          </div>

        </div>
      </div>

      <GroqKeyModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        onSave={handleSaveGroqKey}
      />
    </header>
  );
}