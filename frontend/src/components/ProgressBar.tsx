import { useEffect, useState } from "react";

interface ProgressBarProps {
  isVisible: boolean;
  message?: string;
}

export function ProgressBar({ isVisible, message }: ProgressBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 30;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="h-1 bg-[#30363d]">
        <div
          className="h-full bg-[#1f6feb] shadow-[0_0_10px_#1f6feb] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      {message && (
        <div className="flex justify-center mt-4">
            <div className="px-4 py-2 bg-[#161b22] border border-[#30363d] text-xs text-[#58a6ff] font-medium rounded-full shadow-lg backdrop-blur-sm animate-fade-in-down">
            {message}
            </div>
        </div>
      )}
    </div>
  );
}