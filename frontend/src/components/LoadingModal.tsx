import { Loader2, Zap, Code2 } from "lucide-react";

interface LoadingModalProps {
  stage: "initializing" | "analyzing" | "generating" | "mounting" | "complete";
  progress: number;
}

const STAGE_INFO = {
  initializing: {
    title: "Initializing Project",
    description: "Setting up the project environment...",
    icon: Zap,
  },
  analyzing: {
    title: "Analyzing Your Request",
    description: "Understanding project requirements...",
    icon: Code2,
  },
  generating: {
    title: "Generating Code",
    description: "Using AI to create project files...",
    icon: Code2,
  },
  mounting: {
    title: "Setting Up Files",
    description: "Preparing files in the workspace...",
    icon: Loader2,
  },
  complete: {
    title: "Complete",
    description: "Project is ready!",
    icon: Zap,
  },
};

export function LoadingModal({ stage, progress }: LoadingModalProps) {
  const info = STAGE_INFO[stage];
  const Icon = info.icon;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative w-20 h-20 bg-[#1f6feb]/10 rounded-full flex items-center justify-center border border-[#1f6feb]/20">
            <Icon
              className={`w-10 h-10 text-[#58a6ff] ${
                stage !== "complete" ? "animate-spin" : ""
              }`}
            />
          </div>
        </div>

        {/* Title and Description */}
        <h2 className="text-2xl font-bold text-[#c9d1d9] text-center mb-2">
          {info.title}
        </h2>
        <p className="text-[#8b949e] text-center mb-6">{info.description}</p>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#8b949e]">Progress</span>
            <span className="text-sm font-bold text-[#58a6ff]">{progress}%</span>
          </div>
          <div className="h-2 bg-[#30363d] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1f6feb] transition-all duration-300 shadow-[0_0_10px_#1f6feb]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stage Indicators */}
        <div className="space-y-2">
          {Object.entries(STAGE_INFO).map(([stageKey, stageData]) => (
            <div
              key={stageKey}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors border ${
                 stage === stageKey 
                 ? "bg-[#1f6feb]/10 border-[#1f6feb]/20" 
                 : "border-transparent"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full transition-all ${
                  stage === stageKey || Object.keys(STAGE_INFO).indexOf(stage) > Object.keys(STAGE_INFO).indexOf(stageKey)
                    ? "bg-[#58a6ff]"
                    : "bg-[#30363d]"
                }`}
              />
              <span
                className={`text-sm ${
                  stage === stageKey
                    ? "font-semibold text-[#c9d1d9]"
                    : "text-[#8b949e]"
                }`}
              >
                {stageData.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}