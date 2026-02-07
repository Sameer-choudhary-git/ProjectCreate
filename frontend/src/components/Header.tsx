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
    await supabase.auth.signInWithOAuth({ provider: 'github' }); // Or 'google'
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
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = '/'}>
            <div className="bg-white p-2 rounded-lg">
              <Code2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">ProjectCreate</h1>
              <p className="text-blue-100 text-sm">AI-Powered Project Generator</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-1.5 rounded-lg">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span className="text-white text-xs font-medium">Powered by Groq</span>
            </div>

            <div className="relative group">
              <button
                onClick={() => setShowKeyModal(true)}
                className={`${
                  hasGroqKey
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-white bg-opacity-20 hover:bg-opacity-30"
                } text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium`}
                title={hasGroqKey ? "Update your Groq API key" : "Add your own Groq API key"}
              >
                <Key className="w-4 h-4" />
                API Key {hasGroqKey && "✓"}
              </button>
              {hasGroqKey && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <button
                    onClick={() => setShowKeyModal(true)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-lg text-sm font-medium"
                  >
                    Update Key
                  </button>
                  <button
                    onClick={handleRemoveGroqKey}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-lg text-sm font-medium text-red-600"
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
                  className="text-white text-sm hover:underline"
                >
                  My Projects
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4" /> Sign In
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
