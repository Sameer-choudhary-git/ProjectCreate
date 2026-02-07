import React from "react";

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

export function Skeleton({
  width = "w-full",
  height = "h-4",
  className = "",
}: SkeletonProps) {
  return (
    <div
      className={`${width} ${height} bg-[#21262d] rounded animate-pulse ${className}`}
    />
  );
}

export function SkeletonText() {
  return (
    <div className="space-y-2">
      <Skeleton height="h-4" width="w-3/4" />
      <Skeleton height="h-4" width="w-5/6" />
      <Skeleton height="h-4" width="w-2/3" />
    </div>
  );
}

export function SkeletonFile() {
  return (
    <div className="flex items-center gap-2 p-2">
      <Skeleton height="h-4" width="w-4" className="rounded-sm" />
      <Skeleton height="h-4" width="w-32" />
    </div>
  );
}

export function SkeletonFileTree() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={`flex items-center gap-2 ${i % 3 === 0 ? 'ml-4' : ''}`}>
           <SkeletonFile />
        </div>
      ))}
    </div>
  );
}

export function SkeletonCodeEditor() {
  return (
    <div className="space-y-3 p-6 font-mono bg-[#1e1e1e] h-full">
      {Array.from({ length: 15 }).map((_, i) => (
        <Skeleton
          key={i}
          height="h-4"
          width={`w-${Math.max(40, Math.floor(Math.random() * 90))}%`}
          className="bg-[#30363d]"
        />
      ))}
    </div>
  );
}

interface SkeletonLoaderProps {
  type: "file-tree" | "code-editor" | "text" | "button";
  count?: number;
}

export function SkeletonLoader({ type, count = 1 }: SkeletonLoaderProps) {
  switch (type) {
    case "file-tree":
      return <SkeletonFileTree />;
    case "code-editor":
      return <SkeletonCodeEditor />;
    case "text":
      return (
        <div className="space-y-4">
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonText key={i} />
          ))}
        </div>
      );
    case "button":
      return (
        <div className="flex gap-2">
          {Array.from({ length: count }).map((_, i) => (
             <Skeleton height="h-10" width="w-24" className="rounded-lg" key={i} />
          ))}
        </div>
      );
    default:
      return <Skeleton />;
  }
}