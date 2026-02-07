export function LoadingSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {/* Header skeleton */}
      <div className="h-8 bg-gray-200 rounded-lg w-3/4 animate-pulse"></div>

      {/* Content skeletons */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Footer skeleton */}
      <div className="flex gap-2 mt-6">
        <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse"></div>
      </div>
    </div>
  );
}

export function FileExplorerSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded flex-1 animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}

export function CodeEditorSkeleton() {
  return (
    <div className="space-y-2 p-4 font-mono text-sm">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="h-5 bg-gray-200 rounded animate-pulse"
          style={{ width: `${60 + Math.random() * 40}%` }}
        ></div>
      ))}
    </div>
  );
}