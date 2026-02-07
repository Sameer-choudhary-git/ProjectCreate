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
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      {message && (
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-200 text-sm text-blue-700 font-medium">
          {message}
        </div>
      )}
    </div>
  );
}