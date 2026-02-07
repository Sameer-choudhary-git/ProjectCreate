export function LoadingSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {/* Header skeleton */}
      <div className="h-8 bg-[#21262d] rounded-lg w-3/4 animate-pulse border border-[#30363d]"></div>

      {/* Content skeletons */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-[#21262d] rounded w-full animate-pulse"></div>
            <div className="h-4 bg-[#21262d] rounded w-5/6 animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Footer skeleton */}
      <div className="flex gap-2 mt-6">
        <div className="h-10 bg-[#21262d] rounded w-1/3 animate-pulse border border-[#30363d]"></div>
        <div className="h-10 bg-[#21262d] rounded w-1/3 animate-pulse border border-[#30363d]"></div>
      </div>
    </div>
  );
}

export function FileExplorerSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          {/* Icon placeholder */}
          <div className="w-4 h-4 bg-[#21262d] rounded animate-pulse"></div>
          {/* Text placeholder */}
          <div className="h-4 bg-[#21262d] rounded flex-1 animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}

export function CodeEditorSkeleton() {
  return (
    <div className="space-y-3 p-4 font-mono text-sm bg-[#0d1117] h-full">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-[#21262d] rounded animate-pulse"
          // Random widths to simulate code lines
          style={{ width: `${Math.max(30, Math.random() * 80)}%` }}
        ></div>
      ))}
    </div>
  );
}