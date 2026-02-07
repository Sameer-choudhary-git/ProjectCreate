import { X, Key, AlertCircle } from "lucide-react";
import { useState } from "react";

interface GroqKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
}

export function GroqKeyModal({ isOpen, onClose, onSave }: GroqKeyModalProps) {
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!key.trim()) {
      setError("Please enter a valid API key");
      return;
    }
    onSave(key);
    setKey("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#30363d]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1f6feb]/10 rounded-lg">
                <Key className="w-5 h-5 text-[#58a6ff]" />
            </div>
            <h2 className="text-lg font-bold text-[#c9d1d9]">Groq API Key</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#8b949e] hover:text-[#c9d1d9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-[#1f6feb]/10 border border-[#1f6feb]/20 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-[#58a6ff] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#c9d1d9]">
              Enter your own Groq API key to use your credits instead of the server's limited quota.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#c9d1d9] mb-2">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  setError("");
                }}
                placeholder="gsk_..."
                className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#58a6ff] focus:border-[#58a6ff] placeholder-[#484f58]"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b949e] text-xs hover:text-[#c9d1d9] font-medium"
              >
                {showKey ? "Hide" : "Show"}
              </button>
            </div>
            <p className="text-xs text-[#8b949e] mt-2">
              Get your key from{" "}
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#58a6ff] hover:underline"
              >
                console.groq.com/keys
              </a>
            </p>
          </div>

          {error && (
            <p className="text-sm text-[#f85149] bg-[#f85149]/10 border border-[#f85149]/20 p-2 rounded">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-[#30363d] bg-[#0d1117]/50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-[#c9d1d9] border border-[#30363d] rounded-lg hover:bg-[#21262d] font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-[#238636] text-white rounded-lg hover:bg-[#2ea043] font-medium transition-colors border border-[rgba(240,246,252,0.1)]"
          >
            Save Key
          </button>
        </div>
      </div>
    </div>
  );
}