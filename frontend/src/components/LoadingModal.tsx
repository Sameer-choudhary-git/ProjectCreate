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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center">
            <Icon
              className={`w-10 h-10 text-blue-600 ${
                stage !== "complete" ? "animate-spin" : ""
              }`}
            />
          </div>
        </div>

        {/* Title and Description */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          {info.title}
        </h2>
        <p className="text-gray-600 text-center mb-6">{info.description}</p>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-bold text-blue-600">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stage Indicators */}
        <div className="space-y-2">
          {Object.entries(STAGE_INFO).map(([stageKey, stageData]) => (
            <div
              key={stageKey}
              className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
            >
              <div
                className={`w-2 h-2 rounded-full transition-all ${
                  stage === stageKey || Object.keys(STAGE_INFO).indexOf(stage) > Object.keys(STAGE_INFO).indexOf(stageKey)
                    ? "bg-blue-600"
                    : "bg-gray-300"
                }`}
              />
              <span
                className={`text-sm ${
                  stage === stageKey
                    ? "font-semibold text-gray-900"
                    : "text-gray-600"
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